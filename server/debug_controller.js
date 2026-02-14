const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

async function debugController() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');
    console.log('Connected to MongoDB');
    
    // Test the exact same query as controller
    const stock = await Inventory.find().sort({ rice_variety: 1 });
    console.log('Controller query result:');
    console.log('Total items:', stock.length);
    
    stock.forEach(item => {
      console.log(`${item.rice_variety} - ${item.grade}: ${item.quantity} bags`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

debugController();
