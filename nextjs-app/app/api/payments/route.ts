import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import { logActivity } from '@/lib/services/auditService';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { ref_type, ref_id, amount, payment_mode, notes } = body;

        const numericAmount = Number(amount);
        if (!ref_type || !ref_id || !mongoose.Types.ObjectId.isValid(ref_id) || !Number.isFinite(numericAmount) || numericAmount <= 0 || !payment_mode) {
            return NextResponse.json(
                { error: 'Valid ref_type, ref_id, positive amount, and payment_mode are required' },
                { status: 400 }
            );
        }

        const newPayment = await Payment.create({
            ref_type,
            ref_id,
            amount: numericAmount,
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
