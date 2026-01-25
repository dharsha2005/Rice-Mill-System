const mongoose = require('mongoose');

const SalesSchema = new mongoose.Schema({
    invoice_number: { type: String, required: true, unique: true },
    customer_name: { type: String, required: true },
    rice_variety: { type: String, required: true },
    grade: { type: String, default: 'Standard' },
    bag_size: { type: Number, required: true }, // kg
    quantity_bags: { type: Number, required: true },
    rate_per_bag: { type: Number, required: true },
    transport_charge: { type: Number, default: 0 },
    gst_amount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    payment_status: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Pending' },
    sale_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sales', SalesSchema);
