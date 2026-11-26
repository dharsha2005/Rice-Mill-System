const Milling = require('../models/Milling');
const Inventory = require('../models/Inventory');

const auditService = require('../services/auditService');

exports.createMillingEntry = async (req, res) => {
    try {
        const { paddy_type, input_paddy_qty, output_rice_qty, broken_rice_qty, husk_qty, milling_date } = req.body;

        const inputQty = Number(input_paddy_qty);
        const outputQty = Number(output_rice_qty);
        const brokenQty = Number(broken_rice_qty ?? 0);
        const huskQty = Number(husk_qty ?? 0);

        if (!paddy_type || !Number.isFinite(inputQty) || inputQty <= 0 || !Number.isFinite(outputQty) || outputQty < 0 || !Number.isFinite(brokenQty) || brokenQty < 0 || !Number.isFinite(huskQty) || huskQty < 0) {
            return res.status(400).json({ error: 'Valid paddy_type, positive input_paddy_qty, and non-negative output quantities are required' });
        }

        const efficiency_percentage = ((outputQty + brokenQty) / inputQty) * 100;

        const invisible_loss = inputQty - (outputQty + brokenQty + huskQty);
        const loss_percentage = (invisible_loss / inputQty) * 100;

        const batch_id = 'BATCH-' + Date.now().toString().slice(-6);

        const newMilling = await Milling.create({
            batch_id,
            paddy_type,
            input_paddy_qty: inputQty,
            output_rice_qty: outputQty,
            broken_rice_qty: brokenQty,
            husk_qty: huskQty,
            efficiency_percentage,
            loss_percentage,
            milling_date: milling_date || new Date()
        });

        // INTEGRATION: Update Inventory
        // 1. Update Head Rice
        // Assumption: Output is in Tons. Storing in Bags (e.g., 50kg bags).
        // 1 Ton = 1000kg = 20 Bags of 50kg.
        // Let's assume standard bag size 50kg for automation or take from user config. 
        // For this automated step, let's assume 50kg bags.
        const riceBags = outputQty * 20;

        await Inventory.findOneAndUpdate(
            { rice_variety: paddy_type, grade: 'Premium', bag_size: 50 },
            { $inc: { quantity: riceBags }, $set: { updated_at: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 2. Update Broken Rice
        const brokenBags = brokenQty * 20;
        await Inventory.findOneAndUpdate(
            { rice_variety: paddy_type, grade: 'Broken', bag_size: 50 },
            { $inc: { quantity: brokenBags }, $set: { updated_at: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Audit Log
        await auditService.logActivity({
            req,
            module: 'Milling',
            action: 'CREATE',
            description: `Milled ${input_paddy_qty} Tons of ${paddy_type}. Batch: ${batch_id}`,
            details: { efficiency: efficiency_percentage.toFixed(2) + '%' }
        });

        res.status(201).json(newMilling);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getMillingHistory = async (req, res) => {
    try {
        const history = await Milling.find().sort({ milling_date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
