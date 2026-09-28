const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);

// All subsequent transaction routes require authentication
router.use(protect);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
