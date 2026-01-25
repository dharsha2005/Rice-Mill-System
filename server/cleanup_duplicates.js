const mongoose = require('mongoose');
const Procurement = require('./models/Procurement');
const Payment = require('./models/Payment');

// Using the correct connection string from database.js
mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');

const cleanup = async () => {
    try {
        console.log("Starting cleanup...");

        // Find all procurements
        const allProcurements = await Procurement.find({}).sort({ created_at: 1 });

        console.log(`Total Procurements: ${allProcurements.length}`);

        const uniqueMap = new Map();
        const toDelete = [];

        for (const doc of allProcurements) {
            // Create a signature based on key content fields
            const dateStr = new Date(doc.purchase_date).toISOString().split('T')[0];
            const signature = `${doc.supplier_name}-${doc.paddy_type}-${doc.quantity}-${doc.total_amount}-${dateStr}`;

            if (uniqueMap.has(signature)) {
                // This is a duplicate. We keep the first one encountered (sort order helps).
                toDelete.push(doc._id);
            } else {
                uniqueMap.set(signature, doc._id);
            }
        }

        console.log(`Found ${toDelete.length} duplicates to delete.`);

        if (toDelete.length > 0) {
            const result = await Procurement.deleteMany({ _id: { $in: toDelete } });
            console.log(`Deleted ${result.deletedCount} documents.`);

            // Cleanup associated payments
            const payResult = await Payment.deleteMany({ ref_id: { $in: toDelete } });
            console.log(`Deleted ${payResult.deletedCount} associated payment records.`);
        } else {
            console.log("No duplicates found.");
        }

    } catch (err) {
        console.error("Error during cleanup:", err);
    } finally {
        // Wait a bit before closing to ensure operations complete, though await should handle it.
        setTimeout(() => mongoose.connection.close(), 1000);
    }
};

cleanup();
