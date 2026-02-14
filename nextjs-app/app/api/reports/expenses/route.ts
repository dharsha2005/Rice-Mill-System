import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const query: Record<string, unknown> = {};
        if (startDate && endDate) {
            query.expense_date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const expenses = await Expense.find(query).sort({ expense_date: -1 });

        const summary = {
            totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
            count: expenses.length,
            byCategory: expenses.reduce((acc: Record<string, number>, e) => {
                acc[e.category] = (acc[e.category] || 0) + e.amount;
                return acc;
            }, {})
        };

        return NextResponse.json({ expenses, summary });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
