const mongoose = require('mongoose');
const Sales = require('./models/Sales');
const Payment = require('./models/Payment');

mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');

const cleanupSales = async () => {
    try {
        console.log("Starting Sales cleanup...");
        const allSales = await Sales.find({}).sort({ created_at: 1 });
        console.log(`Total Sales: ${allSales.length}`);

        const uniqueMap = new Map();
        const toDelete = [];

        for (const doc of allSales) {
            // Signature: Invoice should be unique technically, but let's assume content dupes
            // customer + variety + total + date
            const dateStr = new Date(doc.sale_date).toISOString().split('T')[0];
            const signature = `${doc.customer_name}-${doc.rice_variety}-${doc.total_amount}-${dateStr}`;

            if (uniqueMap.has(signature)) {
                toDelete.push(doc._id);
            } else {
                uniqueMap.set(signature, doc._id);
            }
        }

        console.log(`Found ${toDelete.length} duplicate Sales to delete.`);

        if (toDelete.length > 0) {
            const result = await Sales.deleteMany({ _id: { $in: toDelete } });
            console.log(`Deleted ${result.deletedCount} sales.`);
            await Payment.deleteMany({ ref_id: { $in: toDelete } });
        } else {
            console.log("No duplicate Sales found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => mongoose.connection.close(), 1000);
    }
};

cleanupSales();
