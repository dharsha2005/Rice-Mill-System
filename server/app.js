const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const apiRoutes = require('./routes/api');
const mongoose = require('mongoose');

// Models
const Sales = require('./models/Sales');
const Procurement = require('./models/Procurement');
const User = require('./models/User');

const Milling = require('./models/Milling');
const Inventory = require('./models/Inventory');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Connect to MongoDB
connectDB();

// Seeding Logic
const seedData = async () => {
    try {
        // Seed Admin User
        const adminCheck = await User.findOne({ username: 'admin' });
        if (!adminCheck) {
            await User.create({
                username: 'admin',
                password_hash: 'admin123',
                role: 'admin'
            });
            console.log('Admin user seeded');
        }

        // Seed Sales if empty
        const count = await Sales.countDocuments();
        if (count === 0) {
            console.log('Seeding mock sales data...');
            const salesData = [];
            const varieties = ['Basmati Premium', 'Sona Masoori', 'Idli Rice'];
            const buyers = ['RK Traders', 'Green Foods', 'City Supermarket'];

            for (let i = 0; i < 50; i++) {
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 180));

                salesData.push({
                    buyer_name: buyers[Math.floor(Math.random() * buyers.length)],
                    rice_variety: varieties[Math.floor(Math.random() * varieties.length)],
                    quantity_bags: Math.floor(Math.random() * 50) + 10,
                    total_amount: (Math.floor(Math.random() * 50) + 10) * 1200,
                    sale_date: date
                });
            }
            await Sales.insertMany(salesData);
            console.log('Mock sales data seeded.');
        }

        // Seed Procurement if empty
        const pCount = await Procurement.countDocuments();
        if (pCount === 0) {
            console.log('Seeding mock procurement data...');
            await Procurement.create({
                supplier_name: 'Farmer Ramarao',
                paddy_type: 'MTU 1010',
                moisture_percentage: 14.5,
                quantity: 10,
                rate_per_quintal: 2200,
                total_amount: 10 * 10 * 2200,
                purchase_date: new Date()
            });
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

mongoose.connection.once('open', () => {
    seedData();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
