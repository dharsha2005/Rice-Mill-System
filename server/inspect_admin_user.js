const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
const connectDB = require('./database');

const inspect = async () => {
    try {
        await connectDB();
        const user = await User.findOne({ username: 'admin' });
        console.log('Admin User:', user);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspect();
