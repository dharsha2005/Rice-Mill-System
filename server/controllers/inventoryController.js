const Inventory = require('../models/Inventory');

exports.getStockOverview = async (req, res) => {
    try {
        const stock = await Inventory.find().sort({ rice_variety: 1 });
        console.log('Inventory API - Total items:', stock.length);
        stock.forEach(item => {
            console.log(`API Returning: ${item.rice_variety} - ${item.grade}: ${item.quantity} bags`);
        });
        res.json(stock);
    } catch (err) {
        console.error('Inventory API Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Optional: Manual Adjustments
const auditService = require('../services/auditService');

exports.adjustStock = async (req, res) => {
    try {
        const { id, adjustment, reason } = req.body;
        // In real app, log 'reason' in a separate MovementLog table
        const item = await Inventory.findById(id);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        const oldQuantity = item.quantity;
        item.quantity += adjustment;
        item.updated_at = new Date();
        await item.save();

        // Audit Log
        await auditService.logActivity({
            req,
            module: 'Inventory',
            action: 'UPDATE',
            description: `Manual Stock Adjustment: ${adjustment > 0 ? '+' : ''}${adjustment} bags. Reason: ${reason || 'N/A'}`,
            details: { item_id: item._id, variety: item.rice_variety, old_qty: oldQuantity, new_qty: item.quantity }
        });

        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
