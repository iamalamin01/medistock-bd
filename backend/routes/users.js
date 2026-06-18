const router = require('express').Router();
const User = require('../models/User');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, role('admin'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ id: user._id, name: user.name, phone: user.phone, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    if (req.body.password) {
      const User2 = require('../models/User');
      const u = await User2.findById(req.params.id);
      u.set(req.body);
      await u.save();
      return res.json({ message: 'Updated' });
    }
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ message: 'User deactivated' });
});

module.exports = router;
