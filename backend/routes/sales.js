const router = require('express').Router();
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { from, to, page = 1, limit = 20 } = req.query;
  let filter = {};
  if (from || to) filter.createdAt = {};
  if (from) filter.createdAt.$gte = new Date(from);
  if (to) filter.createdAt.$lte = new Date(to);
  const sales = await Sale.find(filter)
    .populate('cashier', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(+limit);
  const total = await Sale.countDocuments(filter);
  res.json({ sales, total });
});

router.get('/:id', auth, async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate('cashier', 'name');
  if (!sale) return res.status(404).json({ message: 'Not found' });
  res.json(sale);
});

router.post('/', auth, role('admin', 'cashier', 'manager'), async (req, res) => {
  try {
    const { items, discount = 0, paymentMethod, customerPhone, note } = req.body;
    // Validate stock & calculate
    let subtotal = 0;
    for (const item of items) {
      const med = await Medicine.findById(item.medicine);
      if (!med) return res.status(400).json({ message: `Medicine not found: ${item.medicine}` });
      if (med.stock < item.qty) return res.status(400).json({ message: `Insufficient stock for ${med.name}` });
      item.name = med.name;
      item.price = med.sellingPrice;
      item.subtotal = med.sellingPrice * item.qty;
      subtotal += item.subtotal;
    }
    const total = subtotal - discount;
    const sale = await Sale.create({
      items, subtotal, discount, total, paymentMethod,
      cashier: req.user.id, customerPhone, note
    });
    // Deduct stock
    for (const item of items) {
      await Medicine.findByIdAndUpdate(item.medicine, { $inc: { stock: -item.qty } });
    }
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
