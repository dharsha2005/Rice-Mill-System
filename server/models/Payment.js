const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    ref_type: {
        type: String,
        required: true,
        enum: ['Sales', 'Procurement', 'Expense']
    },
    ref_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'ref_type'
    },
    amount: {
        type: Number,
        required: true
    },
    payment_mode: {
        type: String,
        required: true,
        enum: ['Cash', 'Bank']
    },
    notes: {
        type: String
    },
    payment_date: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema);
