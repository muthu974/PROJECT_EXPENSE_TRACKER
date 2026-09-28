const express = require('express');
const router = express.Router();
const { getMonthlyTrends, getTopCategories } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/monthly-trends', getMonthlyTrends);
router.get('/top-categories', getTopCategories);

module.exports = router;
