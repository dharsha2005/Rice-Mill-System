import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Alert from '@/lib/models/Alert';

export async function GET() {
    try {
        await connectDB();
        const alerts = await Alert.find().sort({ created_at: -1 }).limit(50);
        return NextResponse.json(alerts);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
