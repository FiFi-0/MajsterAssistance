const express = require('express');
const authRoutes = require('./authRoutes');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);

module.exports = router;
