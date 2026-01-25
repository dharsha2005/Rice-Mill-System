const mongoose = require('mongoose');

const MillingSchema = new mongoose.Schema({
    batch_id: { type: String, required: true, unique: true },
    paddy_type: { type: String, required: true },
    input_paddy_qty: { type: Number, required: true },
    output_rice_qty: { type: Number, required: true },
    broken_rice_qty: { type: Number, required: true },
    husk_qty: { type: Number, required: true },
    efficiency_percentage: { type: Number, required: true },
    loss_percentage: { type: Number, required: true },
    milling_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Milling', MillingSchema);
