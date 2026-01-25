const Sales = require('../models/Sales');
const Expense = require('../models/Expense');
const Procurement = require('../models/Procurement');
const Inventory = require('../models/Inventory');

// Helper to filter by date range
const getDateFilter = (startDate, endDate) => {
    let filter = {};
    if (startDate && endDate) {
        filter = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else {
        // Default to current month if no date provided? 
        // Or all time? Let's default to current month for reports to be useful immediately.
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        filter = { $gte: start };
    }
    return filter;
};

exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log('Sales Report Request:', { startDate, endDate });
        const filter = {};
        if (startDate && endDate) {
            // Assume YYYY-MM-DD strings. 
            // new Date("YYYY-MM-DD") returns UTC midnight.
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Ensure we capture the entire end day in UTC
            end.setUTCHours(23, 59, 59, 999);

            filter.sale_date = {
                $gte: start,
                $lte: end
            };
        }
        console.log('Constructed Filter:', JSON.stringify(filter));
        const report = await Sales.find(filter).sort({ sale_date: 1 });
        console.log('Found Sales Records:', report.length);

        // Calculate totals
        const totalAmount = report.reduce((sum, item) => sum + item.total_amount, 0);
        const totalPaid = report.reduce((sum, item) => sum + (item.paid_amount || 0), 0);

        res.json({
            data: report,
            summary: {
                totalSales: totalAmount,
                totalCollected: totalPaid,
                count: report.length
            }
        });
    } catch (err) {
        console.error('Error generating sales report:', err);
        res.status(500).json({ error: 'Failed to generate sales report' });
    }
};

exports.getExpenseReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);

            filter.expense_date = {
                $gte: start,
                $lte: end
            };
        }

        const report = await Expense.find(filter).sort({ expense_date: 1 });
        const totalExpense = report.reduce((sum, item) => sum + item.amount, 0);

        res.json({
            data: report,
            summary: {
                totalExpense: totalExpense,
                count: report.length
            }
        });
    } catch (err) {
        console.error('Error generating expense report:', err);
        res.status(500).json({ error: 'Failed to generate expense report' });
    }
};

exports.getStockReport = async (req, res) => {
    try {
        // Stock is a snapshot, date range doesn't apply strictly unless we had history tracking.
        // We will return current stock status.
        const inventory = await Inventory.find({}).sort({ item_name: 1 });

        // Calculate estimated value?
        // We don't track value in Inventory model, just quantity.
        // But we can check procurement rates for raw paddy?
        // For simplicity, just return quantity status.

        res.json({
            data: inventory,
            summary: {
                totalItems: inventory.length
            }
        });
    } catch (err) {
        console.error('Error generating stock report:', err);
        res.status(500).json({ error: 'Failed to generate stock report' });
    }
};

exports.getPLReport = async (req, res) => {
    // This is similar to profitController but returns a flat list/document structure for printing
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Ensure end date covers the full day
            end.setHours(23, 59, 59, 999);

            dateFilter.$gte = start;
            dateFilter.$lte = end;
        } else {
            // Default to this month
            const start = new Date();
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            dateFilter.$gte = start;
        }

        const sales = await Sales.aggregate([
            { $match: { sale_date: dateFilter } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);

        const procurement = await Procurement.aggregate([
            { $match: { purchase_date: dateFilter } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);

        const expenses = await Expense.aggregate([
            { $match: { expense_date: dateFilter } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalRevenue = sales[0]?.total || 0;
        const totalCOGS = procurement[0]?.total || 0;
        const totalOpex = expenses[0]?.total || 0;
        const netProfit = totalRevenue - (totalCOGS + totalOpex);

        res.json({
            period: { startDate, endDate },
            data: [
                { category: 'Revenue', description: 'Total Sales', amount: totalRevenue, type: 'credit' },
                { category: 'Cost of Goods', description: 'Procurement Cost', amount: totalCOGS, type: 'debit' },
                { category: 'Operating Expenses', description: 'General Expenses', amount: totalOpex, type: 'debit' },
                { category: 'Net Profit', description: 'Bottom Line', amount: netProfit, type: 'result' }
            ],
            summary: {
                netProfit
            }
        });

    } catch (err) {
        console.error('Error generating P&L report:', err);
        res.status(500).json({ error: 'Failed to generate P&L report' });
    }
};
