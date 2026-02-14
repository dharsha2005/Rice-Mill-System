import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IExpense extends Document {
    category: 'Electricity' | 'Labor' | 'Transport' | 'Maintenance' | 'Packaging' | 'Diesel' | 'Other';
    description?: string;
    amount: number;
    payment_mode: 'Cash' | 'Bank';
    expense_date: Date;
    created_at: Date;
}

const ExpenseSchema = new Schema<IExpense>({
    category: {
        type: String,
        required: true,
        enum: ['Electricity', 'Labor', 'Transport', 'Maintenance', 'Packaging', 'Diesel', 'Other']
    },
    description: {
        type: String,
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

export default (mongoose.models.Expense as Model<IExpense>) || mongoose.model<IExpense>('Expense', ExpenseSchema);
