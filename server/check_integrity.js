
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Procurement = require('./models/Procurement');
const Sales = require('./models/Sales');
require('dotenv').config();

const uri = "mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0";

const run = async () => {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        console.log('\n--- Checking Paid Amount Consistency ---');

        // 1. Check Procurement specifically
        const procs = await Procurement.find({});
        for (const p of procs) {
            // Find payments linked to this procurement
            // IMPORTANT: Payment.ref_id is likely ObjectId, so we cast p._id
            const matches = await Payment.find({
                ref_id: p._id,
                ref_type: 'Procurement'
            });

            const totalPaid = matches.reduce((sum, pay) => sum + pay.amount, 0);

            if (p.paid_amount !== totalPaid) {
                console.log(`[MISMATCH] Procurement ${p.supplier_name} (${p._id})`);
                console.log(`  Doc Paid: ${p.paid_amount}`);
                console.log(`  Payments Sum: ${totalPaid} (Count: ${matches.length})`);

                if (matches.length > 0) {
                    console.log('  Payments are present but Doc not updated!');
                }
            } else {
                console.log(`[OK] Procurement ${p.supplier_name} (${p._id}) matches.`);
            }
        }

        // 2. Check Sales (optional, but good for completeness)
        // ... omitted for brevity

        console.log('\n--- Done ---');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
