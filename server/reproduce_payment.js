
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Procurement = require('./models/Procurement');
require('dotenv').config();

const uri = "mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0";
const run = async () => {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // 1. Create a dummy procurement
        const proc = await Procurement.create({
            supplier_name: 'Test Supplier',
            paddy_type: 'Test Paddy',
            quantity: 10,
            rate_per_quintal: 1000,
            total_amount: 10000,
            paid_amount: 0,
            payment_status: 'Pending'
        });
        console.log('Created Procurement:', proc._id);

        // 2. Simulate recordPayment controller logic
        const ref_id = proc._id.toString(); // emulate string from JSON body
        const amount = 5000;

        console.log('Recording Payment for:', ref_id, 'Amount:', amount);

        // Logic from controller
        const newPayment = await Payment.create({
            ref_type: 'Procurement',
            ref_id: ref_id,
            amount,
            payment_mode: 'Cash',
            notes: 'Test Payment'
        });
        console.log('Payment Created:', newPayment._id);

        // Update Reference
        const foundProc = await Procurement.findById(ref_id);
        if (foundProc) {
            console.log('Found Procurement for update');
            foundProc.paid_amount = (foundProc.paid_amount || 0) + parseFloat(amount);
            if (foundProc.paid_amount >= foundProc.total_amount) {
                foundProc.payment_status = 'Paid';
            } else {
                foundProc.payment_status = 'Partial';
            }
            await foundProc.save();
            console.log('Procurement Updated. New Paid Amount:', foundProc.paid_amount);
        } else {
            console.log('CRITICAL: Procurement NOT found for update!');
        }

        // 3. Verify
        const finalProc = await Procurement.findById(proc._id);
        if (finalProc.paid_amount === 5000) {
            console.log('SUCCESS: Logic works as expected.');
        } else {
            console.log('FAILURE: Paid amount mismatch!', finalProc.paid_amount);
        }

        // Cleanup
        await Procurement.deleteOne({ _id: proc._id });
        await Payment.deleteOne({ _id: newPayment._id });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
