import mongoose, { Document, Schema, Model } from 'mongoose';

interface PermissionSet {
    read: boolean;
    write: boolean;
}

export interface IRolePermission extends Document {
    role: string;
    permissions: Map<string, PermissionSet>;
}

const RolePermissionSchema = new Schema<IRolePermission>({
    role: { type: String, required: true, unique: true },
    permissions: {
        type: Map,
        of: new Schema<PermissionSet>({
            read: { type: Boolean, default: false },
            write: { type: Boolean, default: false }
        }, { _id: false })
    }
});

export default (mongoose.models.RolePermission as Model<IRolePermission>) || mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);
