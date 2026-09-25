import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import './Analytics.css';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

const fmt = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

function Analytics({ categories }) {
  const [trends, setTrends] = useState([]);
  const [topCats, setTopCats] = useState([]);
  const [monthsBack, setMonthsBack] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trendsRes, catsRes] = await Promise.all([
          axios.get(`/api/stats/monthly-trends?months=${monthsBack}`),
          axios.get('/api/stats/top-categories')
        ]);
        if (trendsRes.data.success) setTrends(trendsRes.data.data);
        if (catsRes.data.success) setTopCats(catsRes.data.data);
      } catch (e) {
        console.error('Analytics fetch error:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [monthsBack]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((p) => (
            <p key={p.dataKey} style={{ color: p.color }}>
              {p.name}: {fmt(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const netData = trends.map((d) => ({ ...d, net: (d.income || 0) - (d.expense || 0) }));

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h2>📈 Analytics</h2>
          <p>Visualize your financial trends over time</p>
        </div>
        <div className="period-selector">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              className={`period-btn ${monthsBack === m ? 'active' : ''}`}
              onClick={() => setMonthsBack(m)}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {trends.length === 0 ? (
        <div className="analytics-empty">
          <div className="empty-icon">📊</div>
          <h3>No data yet</h3>
          <p>Add some transactions to see analytics here.</p>
        </div>
      ) : (
        <div className="analytics-grid">
          {/* Income vs Expense Line Chart */}
          <div className="chart-card chart-card-wide">
            <h3>Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Net Savings Bar Chart */}
          <div className="chart-card chart-card-wide">
            <h3>Net Savings per Month</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={netData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="net" name="Net Savings" radius={[6, 6, 0, 0]}>
                  {netData.map((entry, i) => (
                    <Cell key={i} fill={entry.net >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Categories Pie */}
          <div className="chart-card">
            <h3>Expense Breakdown</h3>
            {topCats.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={topCats}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {topCats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No expense data</div>
            )}
          </div>

          {/* Top Categories List */}
          <div className="chart-card">
            <h3>Top Spending Categories</h3>
            <div className="top-cats-list">
              {topCats.map((cat, i) => {
                const total = topCats.reduce((s, c) => s + c.total, 0);
                const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) : 0;
                return (
                  <div key={cat.category} className="top-cat-row">
                    <div className="top-cat-info">
                      <span className="top-cat-dot" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="top-cat-name">{cat.category}</span>
                      <span className="top-cat-count">{cat.count} txns</span>
                    </div>
                    <div className="top-cat-right">
                      <div className="top-cat-bar-track">
                        <div
                          className="top-cat-bar-fill"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                      <span className="top-cat-amount">{fmt(cat.total)}</span>
                      <span className="top-cat-pct">{pct}%</span>
                    </div>
                  </div>
                );
              })}
              {topCats.length === 0 && <p className="chart-empty">No data yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
