const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    rice_variety: { type: String, required: true }, // e.g., Basmati, Sona Masoori
    grade: { type: String, default: 'Standard' }, // e.g., Premium, Grade A, Broken
    bag_size: { type: Number, required: true }, // e.g., 25, 50, 75 (kg)
    quantity: { type: Number, default: 0 }, // Number of Bags
    godown_location: { type: String, default: 'Main Warehouse' },
    minimum_threshold: { type: Number, default: 50 }, // Alert level (bags)
    updated_at: { type: Date, default: Date.now }
});

// Compound index for uniqueness
InventorySchema.index({ rice_variety: 1, grade: 1, bag_size: 1, godown_location: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', InventorySchema);
