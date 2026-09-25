import TransactionItem from './TransactionItem';
import './TransactionList.css';

function TransactionList({ transactions, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="transaction-list-card">
        <h3>📋 Transactions</h3>
        <div className="list-loading">
          <div className="spinner spinner-sm"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list-card">
      <div className="list-header">
        <h3>📋 Transactions</h3>
        <span className="list-count">{transactions.length} total</span>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-title">No transactions found</p>
          <p className="empty-text">
            Add your first transaction or adjust your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="list-table-header">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Type</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="transaction-items">
            {transactions.map((t) => (
              <TransactionItem
                key={t._id}
                transaction={t}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default TransactionList;
