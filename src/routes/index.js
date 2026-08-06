const express = require('express');
const authRoutes = require('./authRoutes');
const ratesRoutes = require('./ratesRoutes');
const chatRoutes = require('./chatRoutes');
const estimatesRoutes = require('./estimatesRoutes');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/rates', ratesRoutes);
router.use('/chat', chatRoutes);
router.use('/estimates', estimatesRoutes);

module.exports = router;
