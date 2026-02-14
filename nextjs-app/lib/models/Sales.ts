import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISales extends Document {
    invoice_number: string;
    customer_name: string;
    rice_variety: string;
    grade: string;
    bag_size: number;
    quantity_bags: number;
    rate_per_bag: number;
    transport_charge: number;
    gst_amount: number;
    total_amount: number;
    paid_amount: number;
    payment_status: 'Paid' | 'Pending' | 'Partial';
    sale_date: Date;
}

const SalesSchema = new Schema<ISales>({
    invoice_number: { type: String, required: true, unique: true },
    customer_name: { type: String, required: true },
    rice_variety: { type: String, required: true },
    grade: { type: String, default: 'Standard' },
    bag_size: { type: Number, required: true },
    quantity_bags: { type: Number, required: true },
    rate_per_bag: { type: Number, required: true },
    transport_charge: { type: Number, default: 0 },
    gst_amount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    payment_status: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Pending' },
    sale_date: { type: Date, default: Date.now }
});

export default (mongoose.models.Sales as Model<ISales>) || mongoose.model<ISales>('Sales', SalesSchema);
