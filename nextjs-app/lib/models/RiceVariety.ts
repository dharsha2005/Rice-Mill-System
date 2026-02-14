import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRiceVariety extends Document {
    name: string;
    code?: string;
    is_active: boolean;
}

const RiceVarietySchema = new Schema<IRiceVariety>({
    name: { type: String, required: true, unique: true },
    code: { type: String },
    is_active: { type: Boolean, default: true }
});

export default (mongoose.models.RiceVariety as Model<IRiceVariety>) || mongoose.model<IRiceVariety>('RiceVariety', RiceVarietySchema);
