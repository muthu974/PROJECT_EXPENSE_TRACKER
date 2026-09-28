import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';
import './App.css';

const API_BASE = '/api/transactions';

let toastId = 0;

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  useEffect(() => { if (user) fetchCategories(); }, [fetchCategories, user]);
  useEffect(() => { if (user) fetchTransactions(); }, [fetchTransactions, user]);

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

  const exportCSV = async () => {
    try {
      showToast('Exporting CSV...', 'info');
      const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;

      const res = await axios.get('/api/export/csv', { params, responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('CSV exported successfully! 📄', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  // Show full-page loading while verifying auth token
  if (authLoading) {
    return (
      <div className="loading-screen" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Show auth pages if not logged in
  if (!user) {
    return (
      <>
        {authView === 'login' ? (
          <Login onSwitch={() => setAuthView('register')} showToast={showToast} />
        ) : (
          <Register onSwitch={() => setAuthView('login')} showToast={showToast} />
        )}
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
      </>
    );
  }

  // Profile page (full screen)
  if (page === 'profile') {
    return (
      <>
        <Profile showToast={showToast} onBack={() => setPage('dashboard')} />
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
      </>
    );
  }

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

            {/* Profile dropdown */}
            <div className="profile-dropdown-wrap" ref={profileRef}>
              <button
                className="profile-trigger-btn"
                onClick={() => setProfileOpen((v) => !v)}
                title="Account"
              >
                <span className="profile-trigger-avatar">{user.avatar || '👤'}</span>
                <span className="profile-trigger-name">{user.name?.split(' ')[0]}</span>
                <span className="profile-trigger-chevron">{profileOpen ? '▲' : '▼'}</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <span className="profile-dropdown-avatar">{user.avatar || '👤'}</span>
                    <div>
                      <p className="profile-dropdown-name">{user.name}</p>
                      <p className="profile-dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button
                    className="profile-dropdown-item"
                    onClick={() => { setPage('profile'); setProfileOpen(false); }}
                  >
                    👤 My Profile
                  </button>
                  <button
                    className="profile-dropdown-item profile-dropdown-logout"
                    onClick={() => { logout(); setProfileOpen(false); }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
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
            <div className="spinner" />
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
