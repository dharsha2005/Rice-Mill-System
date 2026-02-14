const Expense = require('../models/Expense');

const auditService = require('../services/auditService');

// Add new expense
exports.addExpense = async (req, res) => {
    try {
        const { category, description, amount, payment_mode, expense_date } = req.body;

        if (!category || !amount) {
            return res.status(400).json({ error: 'Category and Amount are required' });
        }

        const newExpense = await Expense.create({
            category,
            description,
            amount,
            payment_mode,
            expense_date: expense_date || new Date()
        });

        // Audit Log
        await auditService.logActivity({
            req,
            module: 'Expenses',
            action: 'CREATE',
            description: `Expense: ${category} - ${description}`,
            details: { amount: amount }
        });

        res.status(201).json(newExpense);
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ error: 'Failed to add expense' });
    }
};

// Get all expenses (sorted by date desc)
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ expense_date: -1, created_at: -1 });
        res.json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

// Get expense summary (Today, Month, Breakdown)
exports.getExpenseSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Today's total
        const todayExpenses = await Expense.aggregate([
            { $match: { expense_date: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Monthly total
        const monthlyExpenses = await Expense.aggregate([
            { $match: { expense_date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Category breakdown (All time or Monthly? Let's do Monthly to keep it relevant)
        const categoryBreakdown = await Expense.aggregate([
            { $match: { expense_date: { $gte: startOfMonth } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);

        res.json({
            today: todayExpenses[0]?.total || 0,
            month: monthlyExpenses[0]?.total || 0,
            breakdown: categoryBreakdown
        });

    } catch (err) {
        console.error('Error getting expense summary:', err);
        res.status(500).json({ error: 'Failed to get summary' });
    }
};
