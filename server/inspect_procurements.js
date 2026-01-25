const mongoose = require('mongoose');
const Procurement = require('./models/Procurement');

mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');

const list = async () => {
    try {
        const docs = await Procurement.find({});
        console.log(JSON.stringify(docs, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => mongoose.connection.close(), 1000);
    }
};

list();
