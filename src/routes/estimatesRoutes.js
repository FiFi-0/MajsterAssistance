const express = require('express');
const estimatesController = require('../controllers/estimatesController');
const requireAuth = require('../middleware/authMiddleware');
const { llmLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(requireAuth);

router.get('/', estimatesController.list);
router.get('/:id', estimatesController.getOne);
router.post('/generate', llmLimiter, estimatesController.generate);
router.patch('/:id/status', estimatesController.updateStatus);
router.delete('/:id', estimatesController.remove);
router.post('/:id/items', estimatesController.addItem);
router.put('/:id/items/:itemId', estimatesController.updateItem);
router.delete('/:id/items/:itemId', estimatesController.removeItem);

module.exports = router;
