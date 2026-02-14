import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';


export async function GET() {
    try {
        await connectDB();

        const cashInflow = await Payment.aggregate([
            { $match: { ref_type: 'Sales' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const cashOutflow = await Payment.aggregate([
            { $match: { ref_type: { $in: ['Procurement', 'Expense'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const inflow = cashInflow[0]?.total || 0;
        const outflow = cashOutflow[0]?.total || 0;
        const netCashFlow = inflow - outflow;

        return NextResponse.json({
            cashInflow: inflow,
            cashOutflow: outflow,
            netCashFlow
        });
    } catch (error) {
        console.error('Error in /api/payments/summary:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
