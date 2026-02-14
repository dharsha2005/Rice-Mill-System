import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sales from '@/lib/models/Sales';
import Procurement from '@/lib/models/Procurement';
import Milling from '@/lib/models/Milling';

export async function GET() {
    try {
        await connectDB();

        // Helper for Sum Aggregation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getSum = async (model: any, field: string) => {
            const result = await model.aggregate([
                { $group: { _id: null, total: { $sum: `$${field}` } } }
            ]);
            return result[0]?.total || 0;
        };

        // 1. Total Paddy Stock (Procurement - Consumed in Milling)
        const totalProcured = await getSum(Procurement, 'quantity');
        const totalMilled = await getSum(Milling, 'input_paddy_qty');
        const totalPaddyStock = totalProcured - totalMilled;

        // 2. Total Finished Rice (Milled Output - Sales)
        const totalRiceProduced = await getSum(Milling, 'output_rice_qty');
        const totalSoldBags = await getSum(Sales, 'quantity_bags');
        const soldTons = (totalSoldBags * 0.05) || 0;
        const finishedRiceStock = totalRiceProduced - soldTons;

        // 3. Today's Procurement Cost
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayCostResult = await Procurement.aggregate([
            { $match: { purchase_date: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const todayCost = todayCostResult[0]?.total || 0;

        // 4. Net Profit / Loss
        const totalSales = await getSum(Sales, 'total_amount');
        const totalProcurementCost = await getSum(Procurement, 'total_amount');
        const netProfit = totalSales - totalProcurementCost;

        // 5. Real Efficiency Calculation
        const efficiencyResult = await Milling.aggregate([
            {
                $group: {
                    _id: null,
                    avgEfficiency: { $avg: "$efficiency_percentage" }
                }
            }
        ]);
        const avgEfficiency = efficiencyResult[0]?.avgEfficiency || 0;

        // 6. Chart Data: Monthly Purchase vs Sales (Last 6 months)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getMonthlySum = async (model: any, dateField: string) => {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            return await model.aggregate([
                { $match: { [dateField]: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: `$${dateField}` } },
                        total: { $sum: "$total_amount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        };

        const purchaseTrends = await getMonthlySum(Procurement, 'purchase_date');
        const salesTrends = await getMonthlySum(Sales, 'sale_date');

        const chartData: { month: string; purchases: number; sales: number }[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const months = new Set([...purchaseTrends.map((x: any) => x._id), ...salesTrends.map((x: any) => x._id)].sort());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        months.forEach((m: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = purchaseTrends.find((x: any) => x._id === m);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const s = salesTrends.find((x: any) => x._id === m);
            chartData.push({
                month: m,
                purchases: p ? p.total : 0,
                sales: s ? s.total : 0
            });
        });

        return NextResponse.json({
            metrics: {
                totalPaddyStock,
                finishedRiceStock,
                todayCost,
                netProfit,
                avgEfficiency
            },
            chartData
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
