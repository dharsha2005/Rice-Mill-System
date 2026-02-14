import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sales from '@/lib/models/Sales';
import Procurement from '@/lib/models/Procurement';
import Expense from '@/lib/models/Expense';

export async function GET() {
    try {
        await connectDB();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getSum = async (model: any, field: string) => {
            const result = await model.aggregate([
                { $group: { _id: null, total: { $sum: `$${field}` } } }
            ]);
            return result[0]?.total || 0;
        };

        const totalRevenue = await getSum(Sales, 'total_amount');
        const totalCost = await getSum(Procurement, 'total_amount');
        const totalExpenses = await getSum(Expense, 'amount');

        const grossProfit = totalRevenue - totalCost;
        const netProfit = grossProfit - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return NextResponse.json({
            totalRevenue,
            totalCost,
            totalExpenses,
            grossProfit,
            netProfit,
            profitMargin: profitMargin.toFixed(2)
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
