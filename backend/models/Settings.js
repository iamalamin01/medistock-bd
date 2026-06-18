const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  shopName: { type: String, default: 'MediStock BD' },
  address: String,
  phone: String,
  logo: String,
  currency: { type: String, default: 'BDT' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
