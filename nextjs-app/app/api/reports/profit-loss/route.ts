import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sales from '@/lib/models/Sales';
import Procurement from '@/lib/models/Procurement';
import Expense from '@/lib/models/Expense';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const salesData = await Sales.find({
                sale_date: { $gte: start, $lte: end }
            });

            const procurementData = await Procurement.find({
                purchase_date: { $gte: start, $lte: end }
            });

            const expenseData = await Expense.find({
                expense_date: { $gte: start, $lte: end }
            });

            const totalRevenue = salesData.reduce((sum, s) => sum + s.total_amount, 0);
            const totalCost = procurementData.reduce((sum, p) => sum + p.total_amount, 0);
            const totalExpenses = expenseData.reduce((sum, e) => sum + e.amount, 0);

            const grossProfit = totalRevenue - totalCost;
            const netProfit = grossProfit - totalExpenses;

            return NextResponse.json({
                period: { startDate, endDate },
                revenue: totalRevenue,
                cost: totalCost,
                expenses: totalExpenses,
                grossProfit,
                netProfit,
                profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
            });
        }

        // Default: All-time P&L
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

        return NextResponse.json({
            period: 'All Time',
            revenue: totalRevenue,
            cost: totalCost,
            expenses: totalExpenses,
            grossProfit,
            netProfit,
            profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
