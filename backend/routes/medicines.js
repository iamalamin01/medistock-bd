const router = require('express').Router();
const Medicine = require('../models/Medicine');
const { auth, role } = require('../middleware/auth');

// GET all medicines (with search)
router.get('/', auth, async (req, res) => {
  const { q, lowStock, nearExpiry } = req.query;
  let filter = { active: true };
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { genericName: new RegExp(q, 'i') }];
  if (lowStock === 'true') filter.$expr = { $lte: ['$stock', '$lowStockAlert'] };
  if (nearExpiry === 'true') {
    const soon = new Date();
    soon.setDate(soon.getDate() + 90);
    filter.expiryDate = { $lte: soon };
  }
  const medicines = await Medicine.find(filter).sort({ name: 1 });
  res.json(medicines);
});

router.get('/:id', auth, async (req, res) => {
  const med = await Medicine.findById(req.params.id);
  if (!med) return res.status(404).json({ message: 'Not found' });
  res.json(med);
});

router.post('/', auth, role('admin', 'pharmacist'), async (req, res) => {
  try {
    const med = await Medicine.create(req.body);
    res.status(201).json(med);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, role('admin', 'pharmacist'), async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(med);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  await Medicine.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ message: 'Medicine deactivated' });
});

module.exports = router;
