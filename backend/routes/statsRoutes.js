const express = require('express');
const router = express.Router();
const { getMonthlyTrends, getTopCategories } = require('../controllers/statsController');

router.get('/monthly-trends', getMonthlyTrends);
router.get('/top-categories', getTopCategories);

module.exports = router;
