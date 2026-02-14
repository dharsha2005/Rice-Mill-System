import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Alert from '@/lib/models/Alert';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const alert = await Alert.findByIdAndUpdate(
            id,
            { status: 'Resolved' },
            { new: true }
        );

        if (!alert) {
            return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        return NextResponse.json(alert);
    } catch (error) {
        console.error('Error resolving alert:', error);
        return NextResponse.json({ error: 'Failed to resolve alert' }, { status: 500 });
    }
}
