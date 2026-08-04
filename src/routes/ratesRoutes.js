const express = require('express');
const ratesController = require('../controllers/ratesController');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', ratesController.list);
router.post('/', ratesController.create);
router.put('/:id', ratesController.update);
router.delete('/:id', ratesController.remove);

module.exports = router;
