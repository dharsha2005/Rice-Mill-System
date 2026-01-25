const mongoose = require('mongoose');
const varietyController = require('./controllers/varietyController');

mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');

const runSeed = async () => {
    try {
        console.log('Seeding Varieties...');
        await varietyController.seedVarieties();
        console.log('Done.');
    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => mongoose.connection.close(), 1000);
    }
};

runSeed();
