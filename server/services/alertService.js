const Alert = require('../models/Alert');
const Inventory = require('../models/Inventory');
const Sales = require('../models/Sales'); // For payments
const Expense = require('../models/Expense');

// Rule 1: Check Low Stock
const checkStockLevels = async () => {
    try {
        const lowStockItems = await Inventory.find({
            $expr: { $lt: ["$quantity", "$minimum_threshold"] }
        });

        for (const item of lowStockItems) {
            const message = `Low Stock Warning: ${item.rice_variety} (${item.grade}) is at ${item.quantity} bags (Threshold: ${item.minimum_threshold})`;

            // Avoid duplicate active alerts
            const existing = await Alert.findOne({
                type: 'STOCK',
                message: message,
                status: { $ne: 'Resolved' }
            });

            if (!existing) {
                await Alert.create({
                    type: 'STOCK',
                    message,
                    priority: 'High',
                    status: 'New'
                });
            }
        }
    } catch (err) {
        console.error('Error checking stock levels:', err);
    }
};

// Rule 2: Check Pending Payments (e.g. older than 30 days) - Mock logic for demo
const checkPendingPayments = async () => {
    try {
        const pendingSales = await Sales.find({ payment_status: 'Pending' });
        // In real app, check date difference. For now, just alert if ANY pending.
        if (pendingSales.length > 5) { // Threshold
            const message = `High Volume of Pending Payments: ${pendingSales.length} invoices are Unpaid.`;
            const existing = await Alert.findOne({ type: 'PAYMENT', message, status: { $ne: 'Resolved' } });
            if (!existing) {
                await Alert.create({ type: 'PAYMENT', message, priority: 'Medium', status: 'New' });
            }
        }
    } catch (err) {
        console.error(err);
    }
};

exports.generateAlerts = async () => {
    await checkStockLevels();
    await checkPendingPayments();
};
