import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sales from '@/lib/models/Sales';
import Procurement from '@/lib/models/Procurement';
import Expense from '@/lib/models/Expense';

export async function GET() {
    try {
        await connectDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const salesTrend = await Sales.aggregate([
            { $match: { sale_date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$sale_date" } },
                    revenue: { $sum: '$total_amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const procurementTrend = await Procurement.aggregate([
            { $match: { purchase_date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$purchase_date" } },
                    cost: { $sum: '$total_amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const expenseTrend = await Expense.aggregate([
            { $match: { expense_date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$expense_date" } },
                    expenses: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const months = new Set([
            ...salesTrend.map((x: { _id: string }) => x._id),
            ...procurementTrend.map((x: { _id: string }) => x._id),
            ...expenseTrend.map((x: { _id: string }) => x._id)
        ].sort());

        const chartData = Array.from(months).map((month) => {
            const s = salesTrend.find((x: { _id: string, revenue: number }) => x._id === month);
            const p = procurementTrend.find((x: { _id: string, cost: number }) => x._id === month);
            const e = expenseTrend.find((x: { _id: string, expenses: number }) => x._id === month);

            const revenue = s?.revenue || 0;
            const cost = p?.cost || 0;
            const expenses = e?.expenses || 0;
            const profit = revenue - cost - expenses;

            return {
                month,
                revenue,
                cost,
                expenses,
                profit
            };
        });

        return NextResponse.json(chartData);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
