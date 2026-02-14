import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IInventory extends Document {
    rice_variety: string;
    grade: string;
    bag_size: number;
    quantity: number;
    godown_location: string;
    minimum_threshold: number;
    updated_at: Date;
}

const InventorySchema = new Schema<IInventory>({
    rice_variety: { type: String, required: true },
    grade: { type: String, default: 'Standard' },
    bag_size: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    godown_location: { type: String, default: 'Main Warehouse' },
    minimum_threshold: { type: Number, default: 50 },
    updated_at: { type: Date, default: Date.now }
});

InventorySchema.index({ rice_variety: 1, grade: 1, bag_size: 1, godown_location: 1 }, { unique: true });

export default (mongoose.models.Inventory as Model<IInventory>) || mongoose.model<IInventory>('Inventory', InventorySchema);
