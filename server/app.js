require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
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
const PORT = process.env.PORT || 3000;

// CORS configuration for Vercel deployment
const corsOptions = {
    origin: [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Next.js dev server
        'https://rice-mill-system-61l4.vercel.app',  // Your Vercel frontend
        'https://*.vercel.app'  // Allow all Vercel subdomains
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Routes
// Routes
app.get('/api/health', (req, res) => {
    const clientPath = path.join(__dirname, '../client/dist');
    let clientFiles = [];
    try {
        clientFiles = fs.readdirSync(clientPath);
    } catch (e) {
        clientFiles = [`Error: ${e.message}`];
    }
    res.json({
        status: 'ok',
        cwd: process.cwd(),
        dirname: __dirname,
        clientPath,
        clientFiles,
        env: process.env.NODE_ENV
    });
});
app.use('/api', apiRoutes);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

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

                const quantity = Math.floor(Math.random() * 50) + 10;
                const rate = 1200 + Math.floor(Math.random() * 500);
                const total = quantity * rate;


                salesData.push({
                    invoice_number: `INV-${2023000 + i}`,
                    customer_name: buyers[Math.floor(Math.random() * buyers.length)],
                    rice_variety: varieties[Math.floor(Math.random() * varieties.length)],
                    bag_size: 25,
                    quantity_bags: quantity,
                    rate_per_bag: rate,
                    total_amount: total,
                    payment_status: 'Paid',
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

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await connectDB();

        // Seed Data only after successful connection
        // We wait for the connection to be 'open' which happens after connectDB resolves, 
        // but explicit ordering here is safer or we can just call it directly.
        // The original code used mongoose.connection.once('open'), which is fine.
        // But since we await connectDB(), we are already connected here.
        await seedData();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);

            // Debug Logging
            const clientPath = path.join(__dirname, '../client/dist');
            console.log('Client Path:', clientPath);
            try {
                const files = fs.readdirSync(clientPath);
                console.log('Client Files:', files);
            } catch (e) {
                console.log('Error reading client files:', e.message);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
