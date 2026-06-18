const router = require('express').Router();
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Purchase = require('../models/Purchase');
const { auth } = require('../middleware/auth');

// Sales summary
router.get('/sales-summary', auth, async (req, res) => {
  const { period = 'today' } = req.query;
  const now = new Date();
  let start = new Date();
  if (period === 'today') start.setHours(0, 0, 0, 0);
  else if (period === 'week') start.setDate(now.getDate() - 7);
  else if (period === 'month') start.setDate(1), start.setHours(0, 0, 0, 0);

  const sales = await Sale.find({ createdAt: { $gte: start } });
  const totalSales = sales.reduce((s, x) => s + x.total, 0);
  const totalOrders = sales.length;
  res.json({ period, totalSales, totalOrders });
});

// Stock report
router.get('/stock', auth, async (req, res) => {
  const medicines = await Medicine.find({ active: true }).select('name genericName stock sellingPrice purchasePrice expiryDate lowStockAlert');
  const totalValue = medicines.reduce((s, m) => s + m.stock * m.purchasePrice, 0);
  res.json({ medicines, totalValue });
});

// Expiry report
router.get('/expiry', auth, async (req, res) => {
  const days = parseInt(req.query.days) || 90;
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  const medicines = await Medicine.find({ active: true, expiryDate: { $lte: limit } }).sort({ expiryDate: 1 });
  res.json(medicines);
});

// Profit & Loss (basic)
router.get('/profit-loss', auth, async (req, res) => {
  const { from, to } = req.query;
  let filter = {};
  if (from || to) filter.createdAt = {};
  if (from) filter.createdAt.$gte = new Date(from);
  if (to) filter.createdAt.$lte = new Date(to);

  const sales = await Sale.find(filter).populate('items.medicine', 'purchasePrice');
  let revenue = 0, cost = 0;
  for (const sale of sales) {
    revenue += sale.total;
    for (const item of sale.items) {
      cost += (item.medicine?.purchasePrice || 0) * item.qty;
    }
  }
  res.json({ revenue, cost, profit: revenue - cost });
});

module.exports = router;
