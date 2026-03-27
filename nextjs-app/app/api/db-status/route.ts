import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

export async function GET() {
    try {
        const startTime = Date.now();
        await connectDB();
        const latency = Date.now() - startTime;
        
        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
            99: 'uninitialized',
        };

        return NextResponse.json({
            status: states[state as keyof typeof states] || 'unknown',
            latency: `${latency}ms`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
