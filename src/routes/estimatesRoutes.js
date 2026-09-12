const express = require('express');
const estimatesController = require('../controllers/estimatesController');
const requireAuth = require('../middleware/authMiddleware');
const { llmLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(requireAuth);

router.get('/', estimatesController.list);
router.get('/:id', estimatesController.getOne);
router.post('/generate', llmLimiter, estimatesController.generate);
router.delete('/:id', estimatesController.remove);

module.exports = router;
