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

        const total_amount = quantity * rate_per_quintal;

        const newProcurement = await Procurement.create({
            supplier_name,
            paddy_type,
            moisture_percentage,
            quantity,
            rate_per_quintal,
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
