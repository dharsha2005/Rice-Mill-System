const RiceVariety = require('../models/RiceVariety');

exports.getVarieties = async (req, res) => {
    try {
        const varieties = await RiceVariety.find({ is_active: true }).sort({ name: 1 });
        res.json(varieties);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch varieties' });
    }
};

exports.addVariety = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const existing = await RiceVariety.findOne({ name });
        if (existing) {
            if (!existing.is_active) {
                existing.is_active = true;
                await existing.save();
                return res.json(existing);
            }
            return res.status(400).json({ error: 'Variety already exists' });
        }

        const newVariety = await RiceVariety.create({ name });
        res.status(201).json(newVariety);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add variety' });
    }
};

exports.deleteVariety = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        await RiceVariety.findByIdAndUpdate(id, { is_active: false });
        res.json({ message: 'Variety removed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete variety' });
    }
};

// Seed defaults
exports.seedVarieties = async () => {
    const defaults = ['Basmati', 'Sona Masoori', 'MTU 1010', 'BPT 5204'];
    for (const name of defaults) {
        await RiceVariety.findOneAndUpdate({ name }, { name, is_active: true }, { upsert: true });
    }
};
