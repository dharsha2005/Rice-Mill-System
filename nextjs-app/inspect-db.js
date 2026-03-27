const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0";

async function inspectData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const collections = ['procurements', 'millings', 'sales', 'inventories'];
        for (const colName of collections) {
            console.log(`\n--- ${colName} ---`);
            const doc = await mongoose.connection.db.collection(colName).findOne();
            console.log(JSON.stringify(doc, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectData();
