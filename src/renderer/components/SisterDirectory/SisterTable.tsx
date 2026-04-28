import React from 'react';
import { Info, Edit2, ArrowRightLeft } from 'lucide-react';

interface SisterTableProps {
  sisters: any[];
  loading: boolean;
  onView: (sister: any) => void;
  onEdit: (sister: any) => void;
  onAddObedience: (sister: any) => void;
}

const SisterTable: React.FC<SisterTableProps> = ({ sisters, loading, onView, onEdit, onAddObedience }) => {
  if (loading) {
    return <div className="p-10 text-center">Loading records...</div>;
  }

  return (
    <table className="modern-table">
      <thead>
        <tr>
          <th style={{ width: '80px' }}>Photo</th>
          <th>Religious Name</th>
          <th>Official Name</th>
          <th>Current Post</th>
          <th>Status</th>
          <th className="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sisters.map((s) => (
          <tr key={s.id}>
            <td>
              <div 
                className="avatar-small" 
                style={s.passportPhoto ? { 
                  backgroundImage: `url("${s.passportPhoto}")`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center', 
                  width: '45px', 
                  height: '45px',
                  borderRadius: '10px'
                } : { 
                  width: '45px', 
                  height: '45px',
                  borderRadius: '10px',
                  background: 'var(--primary-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'var(--primary)'
                }}
              >
                {!s.passportPhoto && (s.religiousName?.[0] || s.fullName?.[0])}
              </div>
            </td>
            <td>
              <div>
                <div className="font-bold">{s.religiousName || '—'}</div>
                <div className="text-xs text-muted">ID: {s.id.slice(0, 8)}</div>
              </div>
            </td>
            <td style={{ fontWeight: 600 }}>{s.fullName}</td>
            <td>{s.currentCommunity || '—'}</td>
            <td>
              <span className={`badge badge-${s.status === 'active' ? 'success' : 'warning'}`}>
                {s.status}
              </span>
            </td>
            <td className="text-center">
              <div className="flex justify-center gap-2">
                <button className="icon-btn" style={{ color: 'var(--accent)' }} onClick={() => onAddObedience(s)} title="Add Obedience"><ArrowRightLeft size={16} /></button>
                <button className="icon-btn" style={{ color: 'var(--info)' }} onClick={() => onView(s)} title="View Profile"><Info size={16} /></button>
                <button className="icon-btn" style={{ color: 'var(--accent)' }} onClick={() => onEdit(s)} title="Edit"><Edit2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SisterTable;
