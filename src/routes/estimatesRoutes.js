const express = require('express');
const estimatesController = require('../controllers/estimatesController');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', estimatesController.list);
router.get('/:id', estimatesController.getOne);
router.post('/generate', estimatesController.generate);

module.exports = router;
