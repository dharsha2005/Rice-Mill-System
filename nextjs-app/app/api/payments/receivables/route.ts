import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sales from '@/lib/models/Sales';

export async function GET() {
    try {
        await connectDB();

        const receivables = await Sales.find({
            payment_status: { $in: ['Pending', 'Partial'] }
        }).sort({ sale_date: -1 });

        const totalReceivable = receivables.reduce((sum, sale) => {
            return sum + (sale.total_amount - sale.paid_amount);
        }, 0);

        return NextResponse.json({
            receivables,
            totalReceivable
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
