const mongoose = require('mongoose');

const RolePermissionSchema = new mongoose.Schema({
    role: { type: String, required: true, unique: true }, // e.g. Owner, Manager, Staff
    permissions: {
        type: Map,
        of: new mongoose.Schema({
            read: { type: Boolean, default: false },
            write: { type: Boolean, default: false }
        }, { _id: false })
    }
});

module.exports = mongoose.model('RolePermission', RolePermissionSchema);
