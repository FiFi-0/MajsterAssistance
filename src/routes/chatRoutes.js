const express = require('express');
const chatController = require('../controllers/chatController');
const { llmLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/checklist', llmLimiter, chatController.generateChecklist);

module.exports = router;
