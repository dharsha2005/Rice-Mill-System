import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import { logActivity } from '@/lib/services/auditService';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { ref_type, ref_id, amount, payment_mode, notes } = body;

        const newPayment = await Payment.create({
            ref_type,
            ref_id,
            amount,
            payment_mode,
            notes,
            payment_date: new Date()
        });

        // Audit Log
        await logActivity({
            req: request,
            module: 'Payments',
            action: 'CREATE',
            description: `Recorded payment of ₹${amount} for ${ref_type}`,
            details: { payment_id: newPayment._id, ref_type, ref_id, amount }
        });

        return NextResponse.json(newPayment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
