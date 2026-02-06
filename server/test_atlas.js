const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Testing URI:', uri);

if (!uri) {
    console.error('No MONGO_URI found in .env');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
