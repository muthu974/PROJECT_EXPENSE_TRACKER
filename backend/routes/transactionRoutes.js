const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
} = require('../controllers/transactionController');

router.get('/categories', getCategories);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
