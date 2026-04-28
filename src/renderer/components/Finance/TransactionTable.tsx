import React from 'react';
import { ArrowUpRight, ArrowDownRight, Edit, Trash2 } from 'lucide-react';

interface TransactionTableProps {
  transactions: any[];
  loading: boolean;
  formatCurrency: (amount: number) => string;
  onEdit: (t: any) => void;
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, loading, formatCurrency, onEdit, onDelete }) => {
  if (loading) {
    return <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading finance records...</td></tr>;
  }

  if (transactions.length === 0) {
    return <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>No transactions found.</td></tr>;
  }

  return (
    <>
      {transactions.map((t) => (
        <tr key={t.id}>
          <td className="text-muted">{new Date(t.date).toLocaleDateString()}</td>
          <td><span className="font-semibold">{t.category}</span></td>
          <td>
            <span className={`badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
              {t.type === 'income' ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
              {t.type.toUpperCase()}
            </span>
          </td>
          <td className={t.type === 'income' ? 'text-success font-semibold' : 'text-danger font-semibold'}>
            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
          </td>
          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.description || '-'}
          </td>
          <td>
            <div className="flex gap-2">
              <button className="icon-btn" onClick={() => onEdit(t)} title="Edit"><Edit size={16}/></button>
              <button className="icon-btn text-danger" onClick={() => onDelete(t.id)} title="Delete"><Trash2 size={16}/></button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default TransactionTable;
