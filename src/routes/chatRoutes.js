const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.post('/checklist', chatController.generateChecklist);

module.exports = router;
