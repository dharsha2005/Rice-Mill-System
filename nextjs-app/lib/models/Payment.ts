import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayment extends Document {
    ref_type: 'Sales' | 'Procurement' | 'Expense';
    ref_id: mongoose.Types.ObjectId;
    amount: number;
    payment_mode: 'Cash' | 'Bank';
    notes?: string;
    payment_date: Date;
    created_at: Date;
}

const PaymentSchema = new Schema<IPayment>({
    ref_type: {
        type: String,
        required: true,
        enum: ['Sales', 'Procurement', 'Expense']
    },
    ref_id: {
        type: Schema.Types.ObjectId,
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

export default (mongoose.models.Payment as Model<IPayment>) || mongoose.model<IPayment>('Payment', PaymentSchema);
