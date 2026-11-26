const AuditLog = require('../models/AuditLog');

exports.getLogs = async (req, res) => {
    try {
        const { module, action, start_date, end_date, user, limit = 100 } = req.query;

        let query = {};

        if (module) query.module = module;
        if (action) query.action = action;
        if (user) {
            const escapedUser = String(user).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.user_name = { $regex: escapedUser, $options: 'i' };
        }

        if (start_date || end_date) {
            query.timestamp = {};
            if (start_date) {
                const start = new Date(start_date);
                if (isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid start_date' });
                query.timestamp.$gte = start;
            }
            if (end_date) {
                const end = new Date(end_date);
                if (isNaN(end.getTime())) return res.status(400).json({ error: 'Invalid end_date' });
                query.timestamp.$lte = end;
            }
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json(logs);
    } catch (err) {
        console.error('Fetch Logs Error:', err);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};
