const router = require('express').Router();
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Purchase = require('../models/Purchase');
const { auth } = require('../middleware/auth');

// Dashboard summary (all in one call)
router.get('/dashboard', auth, async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const in30 = new Date(); in30.setDate(in30.getDate() + 30);
  const in90 = new Date(); in90.setDate(in90.getDate() + 90);

  const [todaySales, medicines, recentSales, monthlySales] = await Promise.all([
    Sale.find({ createdAt: { $gte: today } }),
    Medicine.find({ active: true }),
    Sale.find().sort({ createdAt: -1 }).limit(5).populate('cashier', 'name'),
    Sale.find({ createdAt: { $gte: monthStart } }).populate('items.medicine', 'purchasePrice'),
  ]);

  // Today profit
  let todayRevenue = 0, todayCost = 0;
  for (const s of todaySales) {
    todayRevenue += s.total;
    for (const item of s.items) {
      const med = medicines.find(m => m._id.toString() === item.medicine?.toString());
      todayCost += (med?.purchasePrice || 0) * item.qty;
    }
  }

  // Stock stats
  const totalStockValue = medicines.reduce((s, m) => s + m.stock * m.purchasePrice, 0);
  const outOfStock = medicines.filter(m => m.stock === 0);
  const lowStock = medicines.filter(m => m.stock > 0 && m.stock <= m.lowStockAlert);
  const expiry30 = medicines.filter(m => new Date(m.expiryDate) <= in30);
  const expiry90 = medicines.filter(m => new Date(m.expiryDate) <= in90 && new Date(m.expiryDate) > in30);

  // Top selling this month
  const salesMap = {};
  for (const s of monthlySales) {
    for (const item of s.items) {
      salesMap[item.name] = (salesMap[item.name] || 0) + item.qty;
    }
  }
  const topSelling = Object.entries(salesMap).sort((a,b) => b[1]-a[1]).slice(0,5).map(([name, qty]) => ({ name, qty }));

  res.json({
    todayProfit: todayRevenue - todayCost,
    todaySales: todayRevenue,
    todayOrders: todaySales.length,
    totalStockValue,
    totalMedicines: medicines.length,
    outOfStock: outOfStock.length,
    expiry30: expiry30.length,
    expiry90: expiry90.length,
    lowStockList: lowStock.slice(0, 8),
    expiry30List: expiry30.slice(0, 8),
    recentSales,
    topSelling,
  });
});

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
