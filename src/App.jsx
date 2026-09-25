import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import './App.css';

const API_BASE = '/api/transactions';

let toastId = 0;

function App() {
  const [page, setPage] = useState('dashboard'); // 'dashboard' | 'analytics' | 'budgets'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0, categorySummary: {} });
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [filters, setFilters] = useState({ month: '', category: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err.message);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.category) params.category = filters.category;
      if (filters.type) params.type = filters.type;

      const res = await axios.get(API_BASE, { params });
      if (res.data.success) {
        setTransactions(res.data.data.transactions);
        setSummary({
          totalIncome: res.data.data.totalIncome,
          totalExpenses: res.data.data.totalExpenses,
          balance: res.data.data.balance,
          categorySummary: res.data.data.categorySummary
        });
        setConnected(true);
      }
    } catch (err) {
      setConnected(false);
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const addTransaction = async (data) => {
    try {
      const res = await axios.post(API_BASE, data);
      if (res.data.success) {
        await fetchTransactions();
        showToast('Transaction added successfully! 🎉');
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add transaction', 'error');
      return false;
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`, data);
      if (res.data.success) {
        await fetchTransactions();
        showToast('Transaction updated successfully!');
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update transaction', 'error');
      return false;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/${id}`);
      if (res.data.success) {
        await fetchTransactions();
        showToast('Transaction deleted.', 'info');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete transaction', 'error');
    }
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    window.open(`/api/export/csv?${params.toString()}`, '_blank');
    showToast('Exporting CSV...', 'info');
  };

  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'analytics', icon: '📈', label: 'Analytics' },
    { key: 'budgets', icon: '🎯', label: 'Budgets' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="header-logo">💰</div>
            <div className="header-text">
              <h1>ExpenseTracker</h1>
              <p>Personal Finance Manager</p>
            </div>
          </div>

          <div className="header-actions">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`header-nav-btn ${page === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                {item.icon} <span>{item.label}</span>
              </button>
            ))}
            <button
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {!connected && (
          <div className="connection-banner">
            ⚠️ Unable to connect to server. Please check your backend is running.
          </div>
        )}

        {loading && transactions.length === 0 ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading your data...</p>
          </div>
        ) : (
          <>
            {page === 'dashboard' && (
              <Dashboard
                transactions={transactions}
                summary={summary}
                categories={categories}
                filters={filters}
                onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
                onAdd={addTransaction}
                onUpdate={updateTransaction}
                onDelete={deleteTransaction}
                onExportCSV={exportCSV}
                loading={loading}
              />
            )}
            {page === 'analytics' && (
              <Analytics categories={categories} />
            )}
            {page === 'budgets' && (
              <Budgets categories={categories} showToast={showToast} />
            )}
          </>
        )}
      </main>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && '✅'}
            {t.type === 'error' && '❌'}
            {t.type === 'info' && 'ℹ️'}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
