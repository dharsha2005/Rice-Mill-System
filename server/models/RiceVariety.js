const mongoose = require('mongoose');

const RiceVarietySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String }, // Optional short code
    is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('RiceVariety', RiceVarietySchema);
