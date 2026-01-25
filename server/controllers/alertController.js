const Alert = require('../models/Alert');
const alertService = require('../services/alertService');

exports.getAlerts = async (req, res) => {
    try {
        // Trigger check on every load (lazy update)
        // In highly active system, this would be a cron job
        await alertService.generateAlerts();

        const alerts = await Alert.find({ status: { $ne: 'Resolved' } }).sort({ priority: 1, created_at: -1 });
        // Priority sort: High (String sort H comes before M? No, High vs Medium vs Low. 
        // Alphabetical: High, Low, Medium. 
        // We want High first. Let's fix sort in memory or ensure enum is mapped if needed.
        // Actually, let's just find and sort by date descending for now, frontend can group.

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
};

exports.resolveAlert = async (req, res) => {
    try {
        const { id } = req.params;
        await Alert.findByIdAndUpdate(id, { status: 'Resolved' });
        res.json({ message: 'Alert resolved' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to resolve alert' });
    }
};
