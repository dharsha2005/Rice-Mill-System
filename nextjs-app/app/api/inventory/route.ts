import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inventory from '@/lib/models/Inventory';

export async function GET() {
    try {
        await connectDB();
        const inventory = await Inventory.find().sort({ rice_variety: 1, grade: 1 });
        return NextResponse.json(inventory);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
