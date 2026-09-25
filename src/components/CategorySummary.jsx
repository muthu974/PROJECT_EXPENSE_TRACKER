import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './CategorySummary.css';

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#14b8a6'
];

function CategorySummary({ categorySummary }) {
  const data = Object.entries(categorySummary)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{payload[0].payload.name}</p>
          <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="category-summary-card">
        <h3>📊 Expense by Category</h3>
        <div className="empty-category">
          <p>No expense data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-summary-card">
      <h3>📊 Expense by Category</h3>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={20}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="category-list">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
          return (
            <div key={item.name} className="category-row">
              <div className="category-info">
                <span
                  className="category-dot"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="category-name">{item.name}</span>
              </div>
              <div className="category-values">
                <span className="category-amount">
                  {formatCurrency(item.amount)}
                </span>
                <span className="category-percent">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="category-total">
        <span>Total Expenses</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export default CategorySummary;
