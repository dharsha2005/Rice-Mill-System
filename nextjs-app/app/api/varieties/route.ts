import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RiceVariety from '@/lib/models/RiceVariety';
import { logActivity } from '@/lib/services/auditService';

export async function GET() {
    try {
        await connectDB();
        const varieties = await RiceVariety.find({ is_active: true }).sort({ name: 1 });
        return NextResponse.json(varieties);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, code } = body;

        const existingVariety = await RiceVariety.findOne({ name });
        if (existingVariety) {
            return NextResponse.json(
                { error: 'Variety already exists' },
                { status: 400 }
            );
        }

        const newVariety = await RiceVariety.create({
            name,
            code,
            is_active: true
        });

        // Audit Log
        await logActivity({
            req: request,
            module: 'Varieties',
            action: 'CREATE',
            description: `Added new rice variety: ${name}`,
            details: { variety_id: newVariety._id, name, code }
        });

        return NextResponse.json(newVariety, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
