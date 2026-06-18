const router = require('express').Router();
const Purchase = require('../models/Purchase');
const Medicine = require('../models/Medicine');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const purchases = await Purchase.find()
    .populate('addedBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(+limit);
  const total = await Purchase.countDocuments();
  res.json({ purchases, total });
});

router.post('/', auth, role('admin', 'pharmacist'), async (req, res) => {
  try {
    const { supplier, supplierPhone, items, paidAmount, note } = req.body;
    let total = 0;
    for (const item of items) {
      const med = await Medicine.findById(item.medicine);
      if (!med) return res.status(400).json({ message: `Medicine not found` });
      item.name = med.name;
      item.price = item.price || med.purchasePrice;
      item.subtotal = item.price * item.qty;
      total += item.subtotal;
    }
    const dueAmount = total - (paidAmount || 0);
    const purchase = await Purchase.create({
      supplier, supplierPhone, items, total, paidAmount, dueAmount, note, addedBy: req.user.id
    });
    // Add stock
    for (const item of items) {
      await Medicine.findByIdAndUpdate(item.medicine, { $inc: { stock: item.qty } });
    }
    res.status(201).json(purchase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
