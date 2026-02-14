import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inventory from '@/lib/models/Inventory';

export async function GET() {
    try {
        await connectDB();

        const inventory = await Inventory.find().sort({ rice_variety: 1, grade: 1 });

        const summary = {
            totalItems: inventory.length,
            totalBags: inventory.reduce((sum, i) => sum + i.quantity, 0),
            lowStockItems: inventory.filter(i => i.quantity < i.minimum_threshold)
        };

        return NextResponse.json({ inventory, summary });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
