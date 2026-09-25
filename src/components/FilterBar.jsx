import { useMemo } from 'react';
import './FilterBar.css';

function FilterBar({ filters, categories, onFilterChange }) {
  const allCategories = useMemo(() => {
    if (filters.type === 'income') return categories.income || [];
    if (filters.type === 'expense') return categories.expense || [];
    return [...(categories.expense || []), ...(categories.income || [])].filter(
      (val, idx, arr) => arr.indexOf(val) === idx
    );
  }, [categories, filters.type]);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      });
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleClear = () => {
    onFilterChange({ month: '', category: '', type: '' });
  };

  const hasActiveFilters = filters.month || filters.category || filters.type;

  return (
    <div className="filter-bar">
      <div className="filter-bar-header">
        <h3>🔍 Filters</h3>
        {hasActiveFilters && (
          <button className="filter-clear" onClick={handleClear}>
            Clear All
          </button>
        )}
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="month-filter">Month</label>
          <select
            id="month-filter"
            value={filters.month}
            onChange={(e) => onFilterChange({ month: e.target.value })}
          >
            <option value="">All Months</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type-filter">Type</label>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) =>
              onFilterChange({ type: e.target.value, category: '' })
            }
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
