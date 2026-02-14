const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

async function checkRemoteDB() {
  try {
    // Connect to remote MongoDB (same as server)
    await mongoose.connect('mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to REMOTE MongoDB');
    
    const inventory = await Inventory.find({});
    console.log('REMOTE DB - Total inventory items:', inventory.length);
    
    inventory.forEach(item => {
      console.log(`${item.rice_variety} - ${item.grade}: ${item.quantity} bags`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to remote DB:', err);
    process.exit(1);
  }
}

checkRemoteDB();
