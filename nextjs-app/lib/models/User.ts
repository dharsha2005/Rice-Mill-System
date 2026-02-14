import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password_hash: string;
    role: string;
    status: 'Active' | 'Disabled';
    created_at: Date;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: 'Staff' },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
    created_at: { type: Date, default: Date.now }
});

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
