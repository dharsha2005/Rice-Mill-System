import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditLog extends Document {
    user_id?: mongoose.Types.ObjectId;
    user_name: string;
    module: string;
    action: string;
    description: string;
    details?: Record<string, unknown>;
    ip_address?: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    user_name: { type: String, required: true },
    module: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ip_address: { type: String },
    timestamp: { type: Date, default: Date.now }
});

AuditLogSchema.index({ module: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ user_name: 1, timestamp: -1 });

export default (mongoose.models.AuditLog as Model<IAuditLog>) || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
