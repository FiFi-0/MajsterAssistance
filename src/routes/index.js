const express = require('express');
const authRoutes = require('./authRoutes');
const ratesRoutes = require('./ratesRoutes');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/rates', ratesRoutes);

module.exports = router;
