import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAlert extends Document {
    type: string;
    message: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'New' | 'Read' | 'Resolved';
    created_at: Date;
}

const AlertSchema = new Schema<IAlert>({
    type: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['New', 'Read', 'Resolved'], default: 'New' },
    created_at: { type: Date, default: Date.now }
});

export default (mongoose.models.Alert as Model<IAlert>) || mongoose.model<IAlert>('Alert', AlertSchema);
