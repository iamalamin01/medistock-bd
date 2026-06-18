const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  name: String,
  qty: { type: Number, required: true },
  price: Number,
  subtotal: Number
}, { _id: false });

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true },
  items: [saleItemSchema],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  total: Number,
  paymentMethod: { type: String, enum: ['cash', 'bkash', 'card'], default: 'cash' },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerPhone: String,
  note: String
}, { timestamps: true });

// Auto invoice number
saleSchema.pre('save', async function (next) {
  if (!this.invoiceNo) {
    const count = await mongoose.model('Sale').countDocuments();
    this.invoiceNo = `INV-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
