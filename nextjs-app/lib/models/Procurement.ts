import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProcurement extends Document {
    supplier_name: string;
    paddy_type: string;
    moisture_percentage?: number;
    quantity: number;
    rate_per_quintal: number;
    total_amount: number;
    paid_amount: number;
    purchase_date: Date;
    payment_status: 'Pending' | 'Paid' | 'Partial';
}

const ProcurementSchema = new Schema<IProcurement>({
    supplier_name: { type: String, required: true },
    paddy_type: { type: String, required: true },
    moisture_percentage: { type: Number },
    quantity: { type: Number, required: true },
    rate_per_quintal: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    purchase_date: { type: Date, default: Date.now },
    payment_status: { type: String, enum: ['Pending', 'Paid', 'Partial'], default: 'Pending' }
});

export default (mongoose.models.Procurement as Model<IProcurement>) || mongoose.model<IProcurement>('Procurement', ProcurementSchema);
