import './TransactionItem.css';

function TransactionItem({ transaction, onEdit, onDelete }) {
  const { amount, type, category, description, date } = transaction;

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

  return (
    <div className={`transaction-item ${type}`}>
      <div className="ti-cell ti-date">{formattedDate}</div>
      <div className="ti-cell ti-desc" title={description}>
        {description}
      </div>
      <div className="ti-cell ti-category">
        <span className="category-badge">{category}</span>
      </div>
      <div className="ti-cell ti-type">
        <span className={`type-badge type-${type}`}>
          {type === 'income' ? '↑' : '↓'} {type}
        </span>
      </div>
      <div className={`ti-cell ti-amount amount-${type}`}>
        {type === 'income' ? '+' : '-'}
        {formattedAmount}
      </div>
      <div className="ti-cell ti-actions">
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(transaction)}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(transaction._id)}
          title="Delete"
        >
          🗑️
        </button>
      </div>

      <div className="ti-mobile">
        <div className="ti-mobile-top">
          <div>
            <p className="ti-mobile-desc">{description}</p>
            <p className="ti-mobile-meta">
              {formattedDate} • {category}
            </p>
          </div>
          <div className={`ti-mobile-amount amount-${type}`}>
            {type === 'income' ? '+' : '-'}
            {formattedAmount}
          </div>
        </div>
        <div className="ti-mobile-bottom">
          <span className={`type-badge type-${type}`}>
            {type === 'income' ? '↑' : '↓'} {type}
          </span>
          <div className="ti-mobile-actions">
            <button
              className="action-btn edit-btn"
              onClick={() => onEdit(transaction)}
            >
              ✏️
            </button>
            <button
              className="action-btn delete-btn"
              onClick={() => onDelete(transaction._id)}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionItem;
