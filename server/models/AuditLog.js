const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Nullable for system actions or if user deleted
    user_name: { type: String, required: true }, // Snapshot of username
    module: { type: String, required: true }, // e.g., 'Procurement', 'Sales', 'Auth'
    action: { type: String, required: true }, // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    description: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed }, // Store changed fields or ID references
    ip_address: { type: String },
    timestamp: { type: Date, default: Date.now }
});

// Index for fast filtering
AuditLogSchema.index({ module: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ user_name: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
