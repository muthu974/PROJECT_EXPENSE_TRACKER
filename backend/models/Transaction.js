const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Bills',
  'Entertainment',
  'Education',
  'Healthcare',
  'Other'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Allowance',
  'Other'
];

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.pre('validate', function (next) {
  if (this.type && this.category) {
    const validCategories =
      this.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!validCategories.includes(this.category)) {
      this.invalidate(
        'category',
        `Invalid category "${this.category}" for type "${this.type}". Valid categories: ${validCategories.join(', ')}`
      );
    }
  }
  next();
});

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES };
