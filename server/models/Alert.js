const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'STOCK', 'PAYMENT', 'EXPENSE', 'SYSTEM'
    message: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['New', 'Read', 'Resolved'], default: 'New' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
