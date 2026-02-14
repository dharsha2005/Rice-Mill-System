import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';

export async function GET() {
    try {
        await connectDB();

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Today's expenses
        const todayResult = await Expense.aggregate([
            { $match: { expense_date: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const today = todayResult[0]?.total ?? 0;

        // This month's expenses
        const monthResult = await Expense.aggregate([
            { $match: { expense_date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const month = monthResult[0]?.total ?? 0;

        // Breakdown by category (current month)
        const breakdown = await Expense.aggregate([
            { $match: { expense_date: { $gte: startOfMonth } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        return NextResponse.json({
            today,
            month,
            breakdown,
            byCategory: breakdown,
            monthlyTrend: []
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
