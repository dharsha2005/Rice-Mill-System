const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password_hash').sort({ created_at: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Basic validation
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check uniqueness
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Store plain password for this prototype as per authController logic (or hash if library available, but sticking to existing pattern for consistency unless instructed otherwise)
        // Note: Production systems MUST use bcrypt.
        const newUser = await User.create({
            username,
            password_hash: password, // In real app, hash this!
            role,
            status: 'Active'
        });

        res.status(201).json({ message: 'User created successfully', user: { username: newUser.username, role: newUser.role } });

    } catch (err) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Active' or 'Disabled'

        await User.findByIdAndUpdate(id, { status });
        res.json({ message: `User status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
};
