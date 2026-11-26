import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Procurement from '@/lib/models/Procurement';
import { logActivity } from '@/lib/services/auditService';

export async function GET() {
    try {
        await connectDB();
        const procurements = await Procurement.find().sort({ purchase_date: -1 });
        return NextResponse.json(procurements);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { supplier_name, paddy_type, moisture_percentage, quantity, rate_per_quintal, purchase_date } = body;

        const qtyNum = Number(quantity);
        const rateNum = Number(rate_per_quintal);

        if (!supplier_name || !paddy_type || !Number.isFinite(qtyNum) || qtyNum <= 0 || !Number.isFinite(rateNum) || rateNum < 0) {
            return NextResponse.json(
                { error: 'Valid supplier_name, paddy_type, quantity, and rate_per_quintal are required' },
                { status: 400 }
            );
        }

        const total_amount = qtyNum * rateNum;

        const newProcurement = await Procurement.create({
            supplier_name,
            paddy_type,
            moisture_percentage,
            quantity: qtyNum,
            rate_per_quintal: rateNum,
            total_amount,
            purchase_date: purchase_date || new Date()
        });

        // Audit Log
        await logActivity({
            req: request,
            module: 'Procurement',
            action: 'CREATE',
            description: `Procured ${quantity} quintals of ${paddy_type} from ${supplier_name}`,
            details: { procurement_id: newProcurement._id, amount: total_amount }
        });

        return NextResponse.json(newProcurement, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
