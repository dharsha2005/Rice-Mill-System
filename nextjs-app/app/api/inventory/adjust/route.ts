import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inventory from '@/lib/models/Inventory';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { rice_variety, grade, bag_size, adjustment } = body;

        const inventoryItem = await Inventory.findOne({
            rice_variety,
            grade,
            bag_size
        });

        if (!inventoryItem) {
            return NextResponse.json(
                { error: 'Inventory item not found' },
                { status: 404 }
            );
        }

        inventoryItem.quantity += adjustment;
        inventoryItem.updated_at = new Date();
        await inventoryItem.save();

        return NextResponse.json(inventoryItem);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
