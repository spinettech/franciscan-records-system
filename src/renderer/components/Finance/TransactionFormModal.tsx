import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Save } from 'lucide-react';
import FieldErr from '../shared/FieldErr';

const transactionSchema = z.object({
  type:          z.enum(['income', 'expenditure']),
  category:      z.string().min(1),
  amount:        z.coerce.number().positive('Amount must be greater than zero'),
  date:          z.string().min(1, 'Date is required'),
  paymentMethod: z.string().min(1),
  reference:     z.string().optional(),
  description:   z.string().optional(),
});

type TxFormData = z.infer<typeof transactionSchema>;

const categories = {
  income: ['Donation', 'Grant', 'Book Sales', 'Investments', 'Other'],
  expenditure: ['Maintenance', 'Utilities', 'Healthcare', 'Missions', 'Education', 'Travel', 'Food', 'Salaries', 'Other']
};

interface TransactionFormModalProps {
  editingTransaction: any;
  onClose: () => void;
  onSubmit: (data: TxFormData) => void;
  formatCurrency: (amount: number) => string;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ editingTransaction, onClose, onSubmit, formatCurrency }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TxFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: editingTransaction?.type || 'income',
      category: editingTransaction?.category || 'Donation',
      amount: editingTransaction?.amount || undefined,
      date: editingTransaction?.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: editingTransaction?.paymentMethod || 'Bank Transfer',
      reference: editingTransaction?.reference || '',
      description: editingTransaction?.description || '',
    },
  });

  const watchedType = watch('type');

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
        <div className="wiz-hdr" style={{ padding: '1.5rem 2rem', background: 'rgba(var(--primary-rgb), 0.02)', margin: 0, borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '12px' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{editingTransaction ? 'Edit Record' : 'New Transaction'}</h2>
            <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Commit financial data to the central ledger.</p>
          </div>
          <button className="close-btn" onClick={onClose} style={{ marginLeft: 'auto' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '2rem' }}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Ledger Type</label>
              <select {...register('type', { onChange: e => setValue('category', categories[e.target.value as 'income' | 'expenditure'][0]) })}>
                <option value="income">Income (+)</option>
                <option value="expenditure">Expenditure (-)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transaction Category</label>
              <select {...register('category')}>
                {categories[watchedType as 'income' | 'expenditure'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Amount (NGN)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: errors.amount ? '35%' : '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.9rem' }}>₦</span>
              <input
                type="number" step="0.01" placeholder="0.00"
                {...register('amount')}
                className={errors.amount ? 'input-error' : ''}
                style={{ paddingLeft: '2.5rem', fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>
            <FieldErr msg={errors.amount?.message} />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Value Date</label>
              <input type="date" {...register('date')} className={errors.date ? 'input-error' : ''} />
              <FieldErr msg={errors.date?.message} />
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select {...register('paymentMethod')}>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash / Petty</option>
                <option value="Check">Manual Check</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Reference # / Audit Trail</label>
            <input type="text" {...register('reference')} placeholder="e.g. TRF-9901-2024" />
          </div>

          <div className="form-group">
            <label>Transaction Description</label>
            <textarea rows={3} {...register('description')} placeholder="Purpose or breakdown of the fund usage..." />
          </div>

          <div className="flex gap-4 mt-8">
            <button type="button" className="btn btn-outline" style={{ background: 'white' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary ripple" style={{ flex: 1 }}>
              <Save size={18} /> {editingTransaction ? 'Update Ledger' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;
