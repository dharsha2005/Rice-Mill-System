const mongoose = require('mongoose');

const ProcurementSchema = new mongoose.Schema({
    supplier_name: { type: String, required: true },
    paddy_type: { type: String, required: true },
    moisture_percentage: { type: Number },
    quantity: { type: Number, required: true }, // Tons/Quintals
    rate_per_quintal: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    purchase_date: { type: Date, default: Date.now },
    payment_status: { type: String, enum: ['Pending', 'Paid', 'Partial'], default: 'Pending' }
});

module.exports = mongoose.model('Procurement', ProcurementSchema);
