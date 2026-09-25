import { useState } from 'react';
import SummaryCards from '../components/SummaryCards';
import FilterBar from '../components/FilterBar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import CategorySummary from '../components/CategorySummary';
import Modal from '../components/Modal';
import './Dashboard.css';

function Dashboard({
  transactions, summary, categories, filters,
  onFilterChange, onAdd, onUpdate, onDelete, onExportCSV, loading
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleAdd = async (data) => {
    const success = await onAdd(data);
    if (success) setShowForm(false);
    return success;
  };

  const handleUpdate = async (data) => {
    if (!editingTransaction) return false;
    const success = await onUpdate(editingTransaction._id, data);
    if (success) setEditingTransaction(null);
    return success;
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this transaction?')) onDelete(id);
  };

  return (
    <div className="dashboard">
      <SummaryCards summary={summary} />

      <div className="dashboard-toolbar">
        <FilterBar filters={filters} categories={categories} onFilterChange={onFilterChange} />
        <div className="toolbar-actions">
          <button className="btn-export" onClick={onExportCSV} title="Export to CSV">
            ⬇️ Export CSV
          </button>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            + Add Transaction
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <TransactionList
            transactions={transactions}
            onEdit={setEditingTransaction}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
        <div className="dashboard-sidebar">
          <CategorySummary categorySummary={summary.categorySummary} />
        </div>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Add Transaction">
          <TransactionForm
            categories={categories}
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {editingTransaction && (
        <Modal onClose={() => setEditingTransaction(null)} title="Edit Transaction">
          <TransactionForm
            categories={categories}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
            initialData={editingTransaction}
          />
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
