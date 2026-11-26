import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Inventory from '@/lib/models/Inventory';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { id, rice_variety, grade, bag_size, adjustment } = body;

        const numericAdjustment = Number(adjustment);
        if (!Number.isFinite(numericAdjustment)) {
            return NextResponse.json(
                { error: 'Valid numeric adjustment is required' },
                { status: 400 }
            );
        }

        let inventoryItem = null;
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json({ error: 'Invalid inventory ID' }, { status: 400 });
            }
            inventoryItem = await Inventory.findById(id);
        } else {
            inventoryItem = await Inventory.findOne({
                rice_variety,
                grade,
                bag_size
            });
        }

        if (!inventoryItem) {
            return NextResponse.json(
                { error: 'Inventory item not found' },
                { status: 404 }
            );
        }

        inventoryItem.quantity += numericAdjustment;
        inventoryItem.updated_at = new Date();
        await inventoryItem.save();

        return NextResponse.json(inventoryItem);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
