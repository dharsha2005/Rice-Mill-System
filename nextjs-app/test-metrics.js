const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0";

// Mocking the models since I can't easily import TS files into a plain node script without setup
// I'll define the schemas directly based on what I saw in lib/models

const ProcurementSchema = new mongoose.Schema({
    quantity: Number,
});
const Procurement = mongoose.models.Procurement || mongoose.model('Procurement', ProcurementSchema);

const MillingSchema = new mongoose.Schema({
    input_paddy_qty: Number,
});
const Milling = mongoose.models.Milling || mongoose.model('Milling', MillingSchema);

async function testMetrics() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected');

        const getSum = async (model, field) => {
            const result = await model.aggregate([
                { $group: { _id: null, total: { $sum: `$${field}` } } }
            ]);
            console.log(`Sum for ${model.modelName} (${field}):`, result);
            return result[0]?.total || 0;
        };

        const totalProcured = await getSum(Procurement, 'quantity');
        const totalMilled = await getSum(Milling, 'input_paddy_qty');
        
        console.log('Total Procured:', totalProcured);
        console.log('Total Milled:', totalMilled);
        console.log('Paddy Stock:', totalProcured - totalMilled);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testMetrics();
