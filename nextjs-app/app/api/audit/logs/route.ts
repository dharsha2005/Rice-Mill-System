import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuditLog from '@/lib/models/AuditLog';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const moduleName = searchParams.get('module');
        const action = searchParams.get('action');
        const user_name = searchParams.get('user_name');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const query: Record<string, unknown> = {};

        if (moduleName) query.module = moduleName;
        if (action) query.action = action.toUpperCase();
        if (user_name) query.user_name = { $regex: user_name, $options: 'i' };

        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(100);

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
