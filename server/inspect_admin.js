const mongoose = require('mongoose');
const User = require('./models/User');
const RolePermission = require('./models/RolePermission');

mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');

const inspect = async () => {
    try {
        const users = await User.find({});
        console.log("Users:", JSON.stringify(users, null, 2));

        const roles = await RolePermission.find({});
        console.log("Roles:", JSON.stringify(roles, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => mongoose.connection.close(), 1000);
    }
};

inspect();
