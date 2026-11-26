const mongoose = require('mongoose');
const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password_hash').sort({ created_at: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

const auditService = require('../services/auditService');

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

        // Audit Log
        await auditService.logActivity({
            req,
            module: 'User Management',
            action: 'CREATE',
            description: `Created new user: ${username} with role ${role}`,
            details: { user_id: newUser._id }
        });

        res.status(201).json({ message: 'User created successfully', user: { username: newUser.username, role: newUser.role } });

    } catch (err) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newStatus = req.body?.status || (existingUser.status === 'Active' ? 'Disabled' : 'Active');
        const oldStatus = existingUser.status;
        existingUser.status = newStatus;
        await existingUser.save();

        // Audit Log
        await auditService.logActivity({
            req,
            module: 'User Management',
            action: 'UPDATE',
            description: `Changed status of user ${existingUser.username} to ${newStatus}`,
            details: { user_id: id, old_status: oldStatus, new_status: newStatus }
        });

        res.json({ message: `User status updated to ${newStatus}`, user: existingUser });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
};
