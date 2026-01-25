const mongoose = require('mongoose');
const Sales = require('./models/Sales');

mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');

const inspectSales = async () => {
    try {
        const sales = await Sales.find({}, { sale_date: 1, _id: 0 }).sort({ sale_date: 1 });
        console.log("Total Sales:", sales.length);
        if (sales.length > 0) {
            console.log("First Sale Date:", sales[0].sale_date);
            console.log("Last Sale Date:", sales[sales.length - 1].sale_date);
            console.log("Sample Data:", JSON.stringify(sales.slice(0, 5), null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => mongoose.connection.close(), 1000);
    }
};

inspectSales();
