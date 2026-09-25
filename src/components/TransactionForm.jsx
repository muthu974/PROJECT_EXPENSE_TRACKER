import { useState, useEffect } from 'react';
import './TransactionForm.css';

function TransactionForm({ categories, onSubmit, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: String(initialData.amount),
        type: initialData.type,
        category: initialData.category,
        description: initialData.description,
        date: new Date(initialData.date).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const currentCategories =
    formData.type === 'income'
      ? categories.income || []
      : categories.expense || [];

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || String(formData.amount).trim() === '') {
      newErrors.amount = 'Amount is required';
    } else {
      const num = parseFloat(formData.amount);
      if (isNaN(num) || num <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
    }

    if (!formData.type) {
      newErrors.type = 'Transaction type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const d = new Date(formData.date);
      if (isNaN(d.getTime())) {
        newErrors.date = 'Invalid date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'type') {
        updated.category = '';
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const success = await onSubmit({
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description.trim(),
      date: formData.date
    });

    setSubmitting(false);

    if (success && !initialData) {
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          {errors.type && <span className="form-error">{errors.type}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₹) *</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
          />
          {errors.amount && (
            <span className="form-error">{errors.amount}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            {currentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="form-error">{errors.category}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Enter description"
          maxLength={200}
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
        <span className="char-count">{formData.description.length}/200</span>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-submit" disabled={submitting}>
          {submitting
            ? 'Saving...'
            : initialData
              ? 'Update Transaction'
              : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
