const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0";

const ProcurementSchema = new mongoose.Schema({
    purchase_date: Date,
    total_amount: Number,
});
const Procurement = mongoose.models.Procurement || mongoose.model('Procurement', ProcurementSchema);

async function testTrend() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected');

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const result = await Procurement.aggregate([
            { $match: { purchase_date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$purchase_date" } },
                    total: { $sum: "$total_amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log('Trend Result:', JSON.stringify(result, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Aggregation Error:', err);
        process.exit(1);
    }
}

testTrend();
