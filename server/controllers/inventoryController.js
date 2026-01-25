const Inventory = require('../models/Inventory');

exports.getStockOverview = async (req, res) => {
    try {
        const stock = await Inventory.find().sort({ rice_variety: 1 });
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Optional: Manual Adjustments
exports.adjustStock = async (req, res) => {
    try {
        const { id, adjustment, reason } = req.body;
        // In real app, log 'reason' in a separate MovementLog table
        const item = await Inventory.findById(id);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        item.quantity += adjustment;
        item.updated_at = new Date();
        await item.save();

        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
