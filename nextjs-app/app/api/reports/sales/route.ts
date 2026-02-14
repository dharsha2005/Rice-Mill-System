import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sales from '@/lib/models/Sales';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const query: Record<string, unknown> = {};
        if (startDate && endDate) {
            query.sale_date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const sales = await Sales.find(query).sort({ sale_date: -1 });

        const summary = {
            totalSales: sales.reduce((sum, s) => sum + s.total_amount, 0),
            totalQuantity: sales.reduce((sum, s) => sum + s.quantity_bags, 0),
            count: sales.length
        };

        return NextResponse.json({ sales, summary });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
