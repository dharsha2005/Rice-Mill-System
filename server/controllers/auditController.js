const AuditLog = require('../models/AuditLog');

exports.getLogs = async (req, res) => {
    try {
        const { module, action, start_date, end_date, user, limit = 100 } = req.query;

        let query = {};

        if (module) query.module = module;
        if (action) query.action = action;
        if (user) query.user_name = { $regex: user, $options: 'i' };

        if (start_date || end_date) {
            query.timestamp = {};
            if (start_date) query.timestamp.$gte = new Date(start_date);
            if (end_date) query.timestamp.$lte = new Date(end_date);
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
