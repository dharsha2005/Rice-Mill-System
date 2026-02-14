import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Procurement from '@/lib/models/Procurement';

export async function GET() {
    try {
        await connectDB();

        const payables = await Procurement.find({
            payment_status: { $in: ['Pending', 'Partial'] }
        }).sort({ purchase_date: -1 });

        const totalPayable = payables.reduce((sum, procurement) => {
            return sum + (procurement.total_amount - procurement.paid_amount);
        }, 0);

        return NextResponse.json({
            payables,
            totalPayable
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
