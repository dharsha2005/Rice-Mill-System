import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Milling from '@/lib/models/Milling';
import Inventory from '@/lib/models/Inventory';
import { logActivity } from '@/lib/services/auditService';

export async function GET() {
    try {
        await connectDB();
        const history = await Milling.find().sort({ milling_date: -1 });
        return NextResponse.json(history);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { paddy_type, rice_variety, input_paddy_qty, output_rice_qty, broken_rice_qty, husk_qty, milling_date } = body;

        const efficiency_percentage = ((output_rice_qty + broken_rice_qty) / input_paddy_qty) * 100;

        const invisible_loss = input_paddy_qty - (output_rice_qty + broken_rice_qty + husk_qty);
        const loss_percentage = (invisible_loss / input_paddy_qty) * 100;

        const batch_id = 'BATCH-' + Date.now().toString().slice(-6);

        const newMilling = await Milling.create({
            batch_id,
            paddy_type,
            rice_variety: rice_variety || paddy_type, // Fallback to paddy_type if not provided
            input_paddy_qty,
            output_rice_qty,
            broken_rice_qty,
            husk_qty,
            efficiency_percentage,
            loss_percentage,
            milling_date: milling_date || new Date()
        });

        // Update Inventory
        // 1 Ton = 1000kg = 20 Bags of 50kg
        const riceBags = output_rice_qty * 20;

        // Use rice_variety (Output) for updating the Rice Stock
        await Inventory.findOneAndUpdate(
            { rice_variety: rice_variety || paddy_type, grade: 'Premium', bag_size: 50 },
            { $inc: { quantity: riceBags }, $set: { updated_at: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Update Broken Rice
        const brokenBags = broken_rice_qty * 20;
        await Inventory.findOneAndUpdate(
            { rice_variety: rice_variety || paddy_type, grade: 'Broken', bag_size: 50 },
            { $inc: { quantity: brokenBags }, $set: { updated_at: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Audit Log
        await logActivity({
            req: request,
            module: 'Milling',
            action: 'CREATE',
            description: `Milled ${input_paddy_qty} Tons of ${paddy_type}. Batch: ${batch_id}`,
            details: { efficiency: efficiency_percentage.toFixed(2) + '%' }
        });

        return NextResponse.json(newMilling, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
