import React, { useState, useEffect } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { showToast } from '../utils/toast';
import FinanceStats from './Finance/FinanceStats';
import TransactionTable from './Finance/TransactionTable';
import TransactionFormModal from './Finance/TransactionFormModal';

const Finance = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenditure: 0,
    monthlyIncome: 0,
    monthlyExpenditure: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const trans = await window.api.getTransactions(filters);
      // @ts-ignore
      const financialStats = await window.api.getFinanceStats();
      setTransactions(trans);
      setStats(financialStats);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (transaction: any = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const onTxSubmit = async (data: any) => {
    try {
      // @ts-ignore
      await window.api.upsertTransaction(editingTransaction?.id, data);
      showToast('success', editingTransaction ? 'Ledger Updated' : 'Transaction Recorded', `${data.type === 'income' ? 'Income' : 'Expenditure'} of ${formatCurrency(data.amount)} has been committed.`);
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showToast('error', 'Save Failed', error.message || 'Could not save the transaction.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? This cannot be undone.')) {
      try {
        // @ts-ignore
        await window.api.deleteTransaction(id);
        showToast('success', 'Transaction Deleted', 'The ledger entry has been permanently removed.');
        fetchData();
      } catch (error: any) {
        showToast('error', 'Delete Failed', error.message || 'Could not delete the transaction.');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="animate-fade-in finance-page">
      <header className="page-header">
        <div>
          <h1>Finance Management</h1>
          <p>Track income, expenditure, and general financial health of the FSIC.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary ripple" onClick={() => {}}><Download size={18}/> Export Reports</button>
          <button className="btn btn-primary ripple" onClick={() => handleOpenModal()}><Plus size={18}/> New Transaction</button>
        </div>
      </header>

      <FinanceStats stats={stats} formatCurrency={formatCurrency} />

      <div className="dashboard-grid">
        <div className="glass-panel main-panel">
          <div className="panel-header">
            <h3>Transaction History</h3>
            <div className="flex gap-2">
              <div className="search-bar" style={{ minWidth: '250px' }}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by description or ref..." 
                  onChange={(e) => {/* Implement local filter or server fetch */}}
                />
              </div>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <TransactionTable 
                  transactions={transactions} 
                  loading={loading} 
                  formatCurrency={formatCurrency} 
                  onEdit={handleOpenModal} 
                  onDelete={handleDelete} 
                />
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel side-panel">
          <div className="panel-header">
            <h3>Quick Filter</h3>
          </div>
          <div className="filter-form">
            <div className="form-group">
              <label>Transaction Type</label>
              <select 
                value={filters.type} 
                onChange={e => setFilters({...filters, type: e.target.value})}
              >
                <option value="">All Types</option>
                <option value="income">Income Only</option>
                <option value="expenditure">Expenditure Only</option>
              </select>
            </div>
            <button className="btn btn-primary w-full mt-4" onClick={fetchData}>Apply Filters</button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Fiscal Summary</h3>
            <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="text-muted">Total Balance</span>
              <span className="font-bold">{formatCurrency(stats.balance)}</span>
            </div>
            <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="text-muted">Avg Monthly Flow</span>
              <span>{formatCurrency((stats.monthlyIncome + stats.monthlyExpenditure) / 2)}</span>
            </div>
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(var(--primary-rgb), 0.05)', border: 'none', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                <strong>Tip:</strong> Keep references of all bank transfers to ease the end-of-year audit process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TransactionFormModal 
          editingTransaction={editingTransaction} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={onTxSubmit} 
          formatCurrency={formatCurrency} 
        />
      )}
    </div>
  );
};

export default Finance;
