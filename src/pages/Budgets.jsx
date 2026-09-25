import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Budgets.css';

const fmt = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

function Budgets({ categories, showToast }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', limit: '' });
  const [saving, setSaving] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/budgets?month=${selectedMonth}`);
      if (res.data.success) setBudgets(res.data.data);
    } catch (e) {
      console.error('Budget fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.limit) return;
    setSaving(true);
    try {
      const res = await axios.post('/api/budgets', {
        month: selectedMonth,
        category: formData.category,
        limit: parseFloat(formData.limit)
      });
      if (res.data.success) {
        await fetchBudgets();
        showToast('Budget saved!');
        setShowForm(false);
        setFormData({ category: '', limit: '' });
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save budget', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`/api/budgets/${id}`);
      if (res.data.success) {
        await fetchBudgets();
        showToast('Budget removed.', 'info');
      }
    } catch (e) {
      showToast('Failed to delete budget', 'error');
    }
  };

  const expenseCategories = categories.expense || [];
  const usedCategories = budgets.map((b) => b.category);
  const availableCategories = expenseCategories.filter((c) => !usedCategories.includes(c));

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter((b) => b.spent > b.limit).length;

  return (
    <div className="budgets">
      <div className="budgets-header">
        <div>
          <h2>🎯 Budgets</h2>
          <p>Set monthly spending limits by category</p>
        </div>
        <div className="budgets-controls">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-picker"
          />
          {availableCategories.length > 0 && (
            <button className="btn-add-budget" onClick={() => setShowForm(true)}>
              + Set Budget
            </button>
          )}
        </div>
      </div>

      {/* Overview */}
      {budgets.length > 0 && (
        <div className="budget-overview">
          <div className="budget-stat">
            <span className="budget-stat-label">Total Budget</span>
            <span className="budget-stat-value">{fmt(totalBudget)}</span>
          </div>
          <div className="budget-stat">
            <span className="budget-stat-label">Total Spent</span>
            <span className="budget-stat-value" style={{ color: totalSpent > totalBudget ? 'var(--danger)' : 'var(--text-primary)' }}>
              {fmt(totalSpent)}
            </span>
          </div>
          <div className="budget-stat">
            <span className="budget-stat-label">Remaining</span>
            <span className="budget-stat-value" style={{ color: totalBudget - totalSpent >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {fmt(totalBudget - totalSpent)}
            </span>
          </div>
          <div className="budget-stat">
            <span className="budget-stat-label">Over Budget</span>
            <span className="budget-stat-value" style={{ color: overBudget > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {overBudget} category{overBudget !== 1 ? 'ies' : 'y'}
            </span>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <form className="budget-form" onSubmit={handleSave}>
          <h3>Set Budget for {selectedMonth}</h3>
          <div className="budget-form-row">
            <select
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              required
            >
              <option value="">Select Category</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Budget limit (₹)"
              min="1"
              step="1"
              value={formData.limit}
              onChange={(e) => setFormData((p) => ({ ...p, limit: e.target.value }))}
              required
            />
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="budgets-loading">
          <div className="spinner"></div>
          <p>Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="budgets-empty">
          <div className="empty-icon">🎯</div>
          <h3>No budgets set</h3>
          <p>Set budgets to track your spending limits by category.</p>
          {availableCategories.length > 0 && (
            <button className="btn-add-budget" onClick={() => setShowForm(true)}>
              + Set Your First Budget
            </button>
          )}
        </div>
      ) : (
        <div className="budget-cards">
          {budgets.map((b) => {
            const pct = b.percentage;
            const isOver = b.spent > b.limit;
            const isWarning = pct >= 80 && !isOver;
            const statusColor = isOver ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)';
            return (
              <div key={b._id} className={`budget-card ${isOver ? 'budget-over' : ''}`}>
                <div className="budget-card-header">
                  <div>
                    <h4>{b.category}</h4>
                    <span className="budget-period">{b.month}</span>
                  </div>
                  <div className="budget-card-actions">
                    {isOver && <span className="budget-badge over">Over Budget</span>}
                    {isWarning && <span className="budget-badge warning">⚠️ Near Limit</span>}
                    <button
                      className="btn-delete-budget"
                      onClick={() => handleDelete(b._id)}
                      title="Remove budget"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="budget-progress-bar">
                  <div
                    className="budget-progress-fill"
                    style={{ width: `${Math.min(100, pct)}%`, backgroundColor: statusColor }}
                  />
                </div>

                <div className="budget-card-stats">
                  <div>
                    <span className="budget-label">Spent</span>
                    <span className="budget-value" style={{ color: isOver ? 'var(--danger)' : 'inherit' }}>
                      {fmt(b.spent)}
                    </span>
                  </div>
                  <div className="budget-pct" style={{ color: statusColor }}>
                    {pct}%
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="budget-label">Limit</span>
                    <span className="budget-value">{fmt(b.limit)}</span>
                  </div>
                </div>

                <div className="budget-remaining">
                  <span>{isOver ? 'Over by' : 'Remaining'}</span>
                  <span style={{ color: statusColor, fontWeight: 600 }}>
                    {fmt(Math.abs(b.remaining))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Budgets;
