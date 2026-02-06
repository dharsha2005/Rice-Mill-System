const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const verify = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is undefined in .env');
        }
        console.log('Attempting to connect to MongoDB Atlas...');
        await mongoose.connect(uri);
        console.log('✅ Connection Successful!');
        console.log('Host:', mongoose.connection.host);
        console.log('DB Name:', mongoose.connection.name);
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    }
};

verify();
