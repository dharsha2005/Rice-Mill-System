const RolePermission = require('../models/RolePermission');

exports.getRoles = async (req, res) => {
    try {
        const roles = await RolePermission.find({});
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};

exports.updateRolePermissions = async (req, res) => {
    try {
        const { role, permissions } = req.body;

        // Upsert logic: create if not exists, update if exists
        const updatedRole = await RolePermission.findOneAndUpdate(
            { role },
            { permissions },
            { new: true, upsert: true }
        );

        res.json(updatedRole);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update permissions' });
    }
};

// Seeding helper (called internally or via specific route if needed)
exports.seedRoles = async (req, res) => {
    try {
        const defaultRoles = [
            {
                role: 'Proprietor', // Owner
                permissions: {
                    dashboard: { read: true, write: true },
                    procurement: { read: true, write: true },
                    milling: { read: true, write: true },
                    inventory: { read: true, write: true },
                    sales: { read: true, write: true },
                    expenses: { read: true, write: true },
                    reports: { read: true, write: true },
                    accounts: { read: true, write: true },
                    settings: { read: true, write: true }
                }
            },
            {
                role: 'Accountant',
                permissions: {
                    dashboard: { read: true, write: false },
                    procurement: { read: true, write: false },
                    sales: { read: true, write: true }, // Record sales
                    expenses: { read: true, write: true }, // Record expenses
                    reports: { read: true, write: true },
                    accounts: { read: true, write: true },
                    inventory: { read: true, write: false },
                    milling: { read: false, write: false },
                    settings: { read: false, write: false }
                }
            },
            {
                role: 'Staff',
                permissions: {
                    dashboard: { read: true, write: false },
                    procurement: { read: true, write: true }, // Gate entry
                    milling: { read: true, write: true }, // Daily logs
                    inventory: { read: true, write: false },
                    sales: { read: false, write: false },
                    expenses: { read: false, write: false },
                    reports: { read: false, write: false },
                    accounts: { read: false, write: false },
                    settings: { read: false, write: false }
                }
            }
        ];

        for (const r of defaultRoles) {
            await RolePermission.findOneAndUpdate({ role: r.role }, r, { upsert: true });
        }

        res.json({ message: 'Roles seeded successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Seed failed' });
    }
}
