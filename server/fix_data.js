
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Procurement = require('./models/Procurement');
require('dotenv').config();

const uri = "mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0";

const run = async () => {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const procId = '697638f3db47d2c260c86bfe'; // The Farmer Ramarao procurement

        console.log(`Fixing Procurement ${procId}...`);

        // 1. Get all payments
        const payments = await Payment.find({ ref_id: procId, ref_type: 'Procurement' }).sort({ created_at: 1 });
        console.log(`Found ${payments.length} payments.`);

        if (payments.length > 1) {
            console.log('Duplicate payments detected. Keeping the first one and deleting others.');
            const toKeep = payments[0];
            const toDelete = payments.slice(1);

            for (const p of toDelete) {
                await Payment.deleteOne({ _id: p._id });
                console.log(`Deleted duplicate payment ${p._id}`);
            }

            console.log(`Kept payment ${toKeep._id} of amount ${toKeep.amount}`);
        }

        // 2. Update Procurement
        // Recalculate paid amount from REMAINING payments (should be 1)
        const remainingPayments = await Payment.find({ ref_id: procId, ref_type: 'Procurement' });
        const realPaidAmount = remainingPayments.reduce((sum, p) => sum + p.amount, 0);

        const proc = await Procurement.findById(procId);
        if (proc) {
            proc.paid_amount = realPaidAmount;
            if (proc.paid_amount >= proc.total_amount) {
                proc.payment_status = 'Paid';
            } else {
                proc.payment_status = 'Partial';
            }
            await proc.save();
            console.log(`Updated Procurement. New Paid: ${proc.paid_amount}, Status: ${proc.payment_status}`);
        } else {
            console.log('Procurement not found!');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
