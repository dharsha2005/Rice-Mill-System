const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

async function addMissingIR20() {
  try {
    await mongoose.connect('mongodb+srv://onlytamilan6_db_user:08-Aug-05@cluster0.irjjr71.mongodb.net/ricemill_erp?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to REMOTE MongoDB');
    
    // Add IR20 Broken rice (missing)
    const ir20Broken = await Inventory.findOneAndUpdate(
      { rice_variety: 'IR20', grade: 'Broken', bag_size: 50 },
      { 
        $setOnInsert: { 
          rice_variety: 'IR20', 
          grade: 'Broken', 
          bag_size: 50,
          godown_location: 'Main Warehouse',
          minimum_threshold: 50
        },
        $inc: { quantity: 8 }, // Add 8 bags
        $set: { updated_at: new Date() }
      },
      { upsert: true, new: true }
    );
    
    console.log('Added/Updated IR20 Broken:', ir20Broken);
    
    // Check final inventory
    const inventory = await Inventory.find({}).sort({ rice_variety: 1 });
    console.log('\nFinal Inventory:');
    inventory.forEach(item => {
      console.log(`${item.rice_variety} - ${item.grade}: ${item.quantity} bags`);
    });
    
    console.log('\nIR20 added successfully to remote database!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

addMissingIR20();
