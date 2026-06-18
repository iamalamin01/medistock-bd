const router = require('express').Router();
const Settings = require('../models/Settings');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
});

router.put('/', auth, role('admin'), async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  settings.set(req.body);
  await settings.save();
  res.json(settings);
});

module.exports = router;
