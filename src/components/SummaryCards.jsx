import './SummaryCards.css';

const fmt = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

function SummaryCards({ summary }) {
  const cards = [
    {
      title: 'Total Income',
      amount: summary.totalIncome,
      cls: 'income',
      icon: '↑',
      iconBg: '#d1fae5',
      iconColor: '#059669',
      gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
    },
    {
      title: 'Total Expenses',
      amount: summary.totalExpenses,
      cls: 'expense',
      icon: '↓',
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
      gradient: 'linear-gradient(135deg, #fff1f2, #fee2e2)'
    },
    {
      title: 'Net Balance',
      amount: summary.balance,
      cls: summary.balance >= 0 ? 'balance-pos' : 'balance-neg',
      icon: '≈',
      iconBg: summary.balance >= 0 ? '#dbeafe' : '#fce7f3',
      iconColor: summary.balance >= 0 ? '#2563eb' : '#db2777',
      gradient: summary.balance >= 0
        ? 'linear-gradient(135deg, #eff6ff, #dbeafe)'
        : 'linear-gradient(135deg, #fdf2f8, #fce7f3)'
    }
  ];

  return (
    <div className="summary-cards">
      {cards.map((card) => (
        <div key={card.title} className={`summary-card summary-card-${card.cls}`}>
          <div className="card-icon-wrap" style={{ background: card.iconBg, color: card.iconColor }}>
            {card.icon}
          </div>
          <div className="card-body">
            <p className="card-title">{card.title}</p>
            <p className="card-amount">{fmt(card.amount)}</p>
          </div>
          <div className="card-bg-decoration" style={{ background: card.gradient }} />
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
