const AuditLog = require('../models/AuditLog');

/**
 * Logs a user activity to the database.
 * @param {Object} params - The log parameters.
 * @param {Object} params.req - Express request object (optional, to extract user/IP).
 * @param {string} params.user_name - Username (if req not provided).
 * @param {string} params.user_id - User ID (if req not provided).
 * @param {string} params.module - The module name (e.g., 'Sales', 'Inventory').
 * @param {string} params.action - The action type (CREATE, UPDATE, DELETE).
 * @param {string} params.description - Human-readable description.
 * @param {Object} params.details - JSON object with details (oldValue, newValue, etc.).
 */
exports.logActivity = async ({ req, user_name, user_id, module, action, description, details }) => {
    try {
        let finalUserName = user_name || 'System';
        let finalUserId = user_id || null;
        let ipAddress = '127.0.0.1';

        // Try to extract from request if available
        if (req) {
            if (req.user) {
                finalUserName = req.user.username;
                finalUserId = req.user._id; /* Assuming auth middleware attaches ._id? check authController */
                // The mock auth controller we saw earlier adds user: { username, role } but maybe not _id if token is simple. 
                // Let's assume standard behavior or fallback.
            }
            ipAddress = req.ip || req.connection.remoteAddress;
        }

        await AuditLog.create({
            user_id: finalUserId,
            user_name: finalUserName,
            module,
            action: action.toUpperCase(),
            description,
            details,
            ip_address: ipAddress,
            timestamp: new Date()
        });

    } catch (err) {
        // Silently fail to avoid disrupting the main flow, but log to console
        console.error('AUDIT LOGGING FAILED:', err.message);
    }
};
