
const mongoose = require('mongoose');
const Procurement = require('./models/Procurement');
require('dotenv').config();

const uri = "mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0";

const run = async () => {
    try {
        await mongoose.connect(uri);
        const id = '697638f3db47d2c260c86bfe';
        const doc = await Procurement.findById(id);
        if (doc) {
            console.log('Procurement Document:', JSON.stringify(doc, null, 2));
            console.log('Total:', doc.total_amount);
            console.log('Paid:', doc.paid_amount);
            console.log('Pending:', doc.total_amount - doc.paid_amount);
        } else {
            console.log('Doc not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
