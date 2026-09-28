const { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../models/Transaction');
const mongoose = require('mongoose');

const getTransactions = async (req, res) => {
  try {
    const { month, category, type } = req.query;
    const filter = { user: req.user._id };

    if (month) {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month format. Use YYYY-MM'
        });
      }
      const [year, mon] = month.split('-').map(Number);
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (category) {
      filter.category = category;
    }

    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either income or expense'
        });
      }
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySummary = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        categorySummary[t.category] =
          (categorySummary[t.category] || 0) + t.amount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        transactions,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        categorySummary
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category || !description || !date) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: amount, type, category, description, date'
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date provided'
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      amount: parsedAmount,
      type,
      category,
      description: description.trim(),
      date: parsedDate
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    console.error('Create transaction error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction'
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category || !description || !date) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: amount, type, category, description, date'
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date provided'
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user._id },
      {
        amount: parsedAmount,
        type,
        category,
        description: description.trim(),
        date: parsedDate
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    console.error('Update transaction error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction'
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting transaction'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        income: INCOME_CATEGORIES,
        expense: EXPENSE_CATEGORIES
      }
    });
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
};
