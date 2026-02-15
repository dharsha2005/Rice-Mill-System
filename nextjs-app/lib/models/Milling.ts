import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMilling extends Document {
    batch_id: string;
    paddy_type: string;
    input_paddy_qty: number;
    output_rice_qty: number;
    broken_rice_qty: number;
    husk_qty: number;
    efficiency_percentage: number;
    loss_percentage: number;
    milling_date: Date;
    rice_variety: string;
}

const MillingSchema = new Schema<IMilling>({
    batch_id: { type: String, required: true, unique: true },
    paddy_type: { type: String, required: true },
    rice_variety: { type: String, required: true },
    input_paddy_qty: { type: Number, required: true },
    output_rice_qty: { type: Number, required: true },
    broken_rice_qty: { type: Number, required: true },
    husk_qty: { type: Number, required: true },
    efficiency_percentage: { type: Number, required: true },
    loss_percentage: { type: Number, required: true },
    milling_date: { type: Date, default: Date.now }
});

export default (mongoose.models.Milling as Model<IMilling>) || mongoose.model<IMilling>('Milling', MillingSchema);
