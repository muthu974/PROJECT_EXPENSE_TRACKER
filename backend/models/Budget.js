const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Budget limit must be at least 1']
    }
  },
  {
    timestamps: true
  }
);

// Unique budget per month+category combination
budgetSchema.index({ month: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
