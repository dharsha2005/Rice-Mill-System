const User = require('../models/User');
const RolePermission = require('../models/RolePermission');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login Attempt:', { username, password });

        // Special Backdoor for initial setup if no users exist
        if (username === 'admin' && password === 'admin123') {
            const adminExists = await User.findOne({ username: 'admin' });
            if (!adminExists) {
                // Return temporary admin access to allow seeding
                return res.json({
                    token: 'temp-admin-token',
                    user: { username: 'admin', role: 'Proprietor' },
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
                });
            }
        }

        // Case-insensitive username search
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        if (!user || user.status === 'Disabled') {
            console.log('Login failed: User not found or disabled.', {
                inputUsername: username,
                foundUser: user ? user.username : 'null',
                status: user ? user.status : 'N/A'
            });
            return res.status(401).json({ error: 'Invalid credentials or account disabled' });
        }

        // Simple password check (In production use bcrypt.compare)
        if (user.password_hash !== password) {
            console.log('Password mismatch. DB:', user.password_hash, 'Input:', password);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Fetch permissions for the role
        const roleData = await RolePermission.findOne({ role: user.role });

        // Default safe permissions if role not defined yet
        let permissions = roleData ? roleData.permissions : {};

        // Fallback for admin user if roles not seeded yet
        if (user.username === 'admin' && Object.keys(permissions).length === 0) {
            permissions = {
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
        }

        res.json({
            token: 'jwt-token-' + user._id, // Mock token
            user: { username: user.username, role: user.role },
            permissions
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};
