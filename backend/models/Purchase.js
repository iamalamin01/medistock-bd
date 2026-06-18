const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  name: String,
  qty: { type: Number, required: true },
  price: Number,
  subtotal: Number
}, { _id: false });

const purchaseSchema = new mongoose.Schema({
  supplier: String,
  supplierPhone: String,
  items: [purchaseItemSchema],
  total: Number,
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  note: String,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
