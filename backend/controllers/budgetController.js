const Budget = require('../models/Budget');
const { Transaction } = require('../models/Transaction');

// GET /api/budgets?month=YYYY-MM
const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { user: req.user._id };
    if (month) filter.month = month;

    const budgets = await Budget.find(filter).sort({ category: 1 });

    // If month is provided, also compute actual spending per category for this user
    let spending = {};
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

      const transactions = await Transaction.find({
        user: req.user._id,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      });

      transactions.forEach((t) => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });
    }

    const budgetsWithSpending = budgets.map((b) => ({
      _id: b._id,
      month: b.month,
      category: b.category,
      limit: b.limit,
      spent: spending[b.category] || 0,
      remaining: b.limit - (spending[b.category] || 0),
      percentage: Math.min(100, Math.round(((spending[b.category] || 0) / b.limit) * 100))
    }));

    res.status(200).json({ success: true, data: budgetsWithSpending });
  } catch (error) {
    console.error('Get budgets error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while fetching budgets' });
  }
};

// POST /api/budgets
const createOrUpdateBudget = async (req, res) => {
  try {
    const { month, category, limit } = req.body;

    if (!month || !category || !limit) {
      return res.status(400).json({
        success: false,
        message: 'month, category, and limit are required'
      });
    }

    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ success: false, message: 'Month must be YYYY-MM format' });
    }

    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({ success: false, message: 'Limit must be a positive number' });
    }

    // Upsert: create or update existing budget for user + month + category
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month, category },
      { limit: parsedLimit, user: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('Create budget error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while saving budget' });
  }
};

// DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.status(200).json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    console.error('Delete budget error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while deleting budget' });
  }
};

module.exports = { getBudgets, createOrUpdateBudget, deleteBudget };
