const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Electricity', 'Labor', 'Transport', 'Maintenance', 'Packaging', 'Diesel', 'Other']
    },
    description: {
        type: String, // Notes
        required: false
    },
    amount: {
        type: Number,
        required: true
    },
    payment_mode: {
        type: String,
        enum: ['Cash', 'Bank'],
        default: 'Cash'
    },
    expense_date: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
