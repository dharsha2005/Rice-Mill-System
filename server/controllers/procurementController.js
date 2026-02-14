const Procurement = require('../models/Procurement');
const Sales = require('../models/Sales');
const Milling = require('../models/Milling');

const auditService = require('../services/auditService');

// Create new procurement entry
exports.createProcurement = async (req, res) => {
    try {
        const { supplier_name, paddy_type, moisture_percentage, quantity, rate_per_quintal, purchase_date } = req.body;

        const total_amount = (quantity * rate_per_quintal);

        const newProcurement = await Procurement.create({
            supplier_name,
            paddy_type,
            moisture_percentage,
            quantity,
            rate_per_quintal,
            total_amount,
            purchase_date: purchase_date || new Date()
        });

        // Audit Log
        await auditService.logActivity({
            req,
            module: 'Procurement',
            action: 'CREATE',
            description: `Procured ${quantity} quintals of ${paddy_type} from ${supplier_name}`,
            details: { procurement_id: newProcurement._id, amount: total_amount }
        });

        res.status(201).json(newProcurement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// List all procurements
exports.getAllProcurements = async (req, res) => {
    try {
        const procurements = await Procurement.find().sort({ purchase_date: -1 });
        res.status(200).json(procurements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Summary metrics for Dashboard
exports.getDashboardMetrics = async (req, res) => {
    try {
        // Helper for Sum Aggregation
        const getSum = async (model, field) => {
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
        // Sales are in Bags (e.g. 50kg). Convert to Tons? 
        // Let's assume 1 Bag = 50kg = 0.05 Tons.
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
        // Avg Efficiency of all Milling Batches
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
        const getLast6MonthsData = async (model, dateField, amountField) => {
            return await model.aggregate([
                {
                    $match: { 'purchase_date': { $exists: true } } // Safety check
                },
                // ... Simplified for demo, Aggregation can be complex with Dates in Mongo if fields vary
                // Using a simple $project to extract YYYY-MM
            ]);
            // Reverting to previous robust aggregation logic for Chart
        };

        // Robust Chart Aggregation
        const getMonthlySum = async (model, dateField) => {
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

        const chartData = [];
        const months = new Set([...purchaseTrends.map(x => x._id), ...salesTrends.map(x => x._id)].sort());

        months.forEach(m => {
            const p = purchaseTrends.find(x => x._id === m);
            const s = salesTrends.find(x => x._id === m);
            chartData.push({
                name: m,
                Purchase: p ? p.total : 0,
                Sales: s ? s.total : 0
            });
        });

        res.status(200).json({
            metrics: {
                totalPaddyStock,
                finishedRiceStock,
                todayCost,
                netProfit,
                avgEfficiency // Sending real efficiency
            },
            chartData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
