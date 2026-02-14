import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import { logActivity } from '@/lib/services/auditService';

export async function GET() {
    try {
        await connectDB();
        const expenses = await Expense.find().sort({ expense_date: -1 });
        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { category, amount, description, payment_mode, expense_date } = body;

        const newExpense = await Expense.create({
            category,
            amount,
            description,
            payment_mode,
            expense_date: expense_date || new Date()
        });

        // Audit Log
        await logActivity({
            req: request,
            module: 'Expenses',
            action: 'CREATE',
            description: `Recorded expense of ₹${amount} for ${category}`,
            details: { expense_id: newExpense._id, amount, category }
        });

        return NextResponse.json(newExpense, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
