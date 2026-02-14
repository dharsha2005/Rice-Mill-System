const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

async function checkInventory() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ricemill_erp');
    console.log('Connected to MongoDB');
    
    const inventory = await Inventory.find({});
    console.log('Total inventory items:', inventory.length);
    
    inventory.forEach(item => {
      console.log(`${item.rice_variety} - ${item.grade}: ${item.quantity} bags`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkInventory();
