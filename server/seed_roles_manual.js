const mongoose = require('mongoose');
const User = require('./models/User');
const RolePermission = require('./models/RolePermission');

mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');

const seed = async () => {
    try {
        console.log('Seeding Roles...');

        // 1. Create Proprietor Role
        const proprietorPermissions = {
            dashboard: { read: true, write: true },
            procurement: { read: true, write: true },
            milling: { read: true, write: true },
            inventory: { read: true, write: true },
            sales: { read: true, write: true },
            expenses: { read: true, write: true },
            reports: { read: true, write: true },
            accounts: { read: true, write: true },
            settings: { read: true, write: true }
        };

        await RolePermission.findOneAndUpdate(
            { role: 'Proprietor' },
            { role: 'Proprietor', permissions: proprietorPermissions },
            { upsert: true, new: true }
        );
        console.log('Proprietor Role created.');

        // 2. Update Admin user to use this role
        // The admin user currently has role 'admin', we change it to 'Proprietor'
        const res = await User.updateOne(
            { username: 'admin' },
            { $set: { role: 'Proprietor', status: 'Active' } }
        );
        console.log('Admin user updated:', res);

        // 3. Create other default roles
        await RolePermission.findOneAndUpdate(
            { role: 'Staff' },
            {
                role: 'Staff',
                permissions: {
                    dashboard: { read: true, write: false },
                    procurement: { read: true, write: true },
                    inventory: { read: true, write: false }
                }
            },
            { upsert: true }
        );
        console.log('Staff Role created.');

    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => mongoose.connection.close(), 1000);
    }
};

seed();
