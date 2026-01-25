const Sales = require('../models/Sales');
const Procurement = require('../models/Procurement');
const Expense = require('../models/Expense');

exports.getProfitSummary = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        let matchStage = {};

        // Date Filtering Logic
        if (startDate && endDate) {
            matchStage = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (period === 'daily') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            matchStage = { $gte: today };
        } else if (period === 'monthly') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            matchStage = { $gte: startOfMonth };
        } else {
            // Default to all time or maybe last 30 days? 
            // Let's stick to 'monthly' default if nothing provided, or empty for all time?
            // Let's make it ALL TIME if no filter to show big picture, or maybe current month.
            // Let's default to current month for safety/speed if no params.
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            matchStage = { $gte: startOfMonth };
        }

        // Helper for aggregation
        const aggregateTotal = async (Model, dateField, match) => {
            const result = await Model.aggregate([
                { $match: { [dateField]: match } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } } // Note: Expense uses 'amount', others 'total_amount'
            ]);
            return result[0]?.total || 0;
        };

        // Expense uses 'amount' field
        const aggregateExpense = async (match) => {
            const result = await Expense.aggregate([
                { $match: { expense_date: match } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            return result[0]?.total || 0;
        };

        const revenue = await aggregateTotal(Sales, 'sale_date', matchStage);
        const procurementCost = await aggregateTotal(Procurement, 'purchase_date', matchStage);
        const expenses = await aggregateExpense(matchStage);

        const grossProfit = revenue - procurementCost;
        const netProfit = grossProfit - expenses;
        const margin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0;

        res.json({
            revenue,
            procurementCost,
            expenses,
            grossProfit,
            netProfit,
            margin: parseFloat(margin)
        });

    } catch (err) {
        console.error('Error calculating P&L:', err);
        res.status(500).json({ error: 'Failed to calculate P&L' });
    }
};

exports.getProfitTrend = async (req, res) => {
    try {
        // Last 6 months trend
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const groupByMonth = {
            $group: {
                _id: { $month: "$sale_date" }, // Adjust date field per model
                year: { $first: { $year: "$sale_date" } },
                total: { $sum: "$total_amount" } // Adjust amount field per model
            }
        };

        // We need to merge these results. It's easier to do separate queries and map in JS for this scale.

        const getMonthlyData = async (Model, dateField, amountField) => {
            return await Model.aggregate([
                { $match: { [dateField]: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            month: { $month: `$${dateField}` },
                            year: { $year: `$${dateField}` }
                        },
                        total: { $sum: `$${amountField}` }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);
        };

        const salesData = await getMonthlyData(Sales, 'sale_date', 'total_amount');
        const procurementData = await getMonthlyData(Procurement, 'purchase_date', 'total_amount');
        const expenseData = await getMonthlyData(Expense, 'expense_date', 'amount'); // Note: amount

        // Merge logic
        // Create a map keyed by "YYYY-M"
        const dataMap = {};

        const addToMap = (data, key) => {
            data.forEach(item => {
                const mapKey = `${item._id.year}-${item._id.month}`;
                if (!dataMap[mapKey]) dataMap[mapKey] = { month: item._id.month, year: item._id.year, revenue: 0, cost: 0, expenses: 0 };
                dataMap[mapKey][key] += item.total;
            });
        };

        addToMap(salesData, 'revenue');
        addToMap(procurementData, 'cost');
        addToMap(expenseData, 'expenses');

        const result = Object.values(dataMap).map(item => ({
            ...item,
            netProfit: item.revenue - (item.cost + item.expenses)
        })).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });

        // Convert month number to name
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedResult = result.map(item => ({
            name: `${monthNames[item.month - 1]} ${item.year}`,
            Revenue: item.revenue,
            Expenses: item.cost + item.expenses, // Combining COGS + Ops for simpler chart or keeping separate? User asked for Profit vs Expense. 
            // Let's Send Revenue, Expenses (Total Outflow), and NetProfit
            Profit: item.netProfit
        }));

        res.json(formattedResult);

    } catch (err) {
        console.error('Error calculating P&L Trend:', err);
        res.status(500).json({ error: 'Failed to calculate trend' });
    }
};
