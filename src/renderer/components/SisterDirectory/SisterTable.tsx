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
          <th>Official Name</th>
          <th>Religious Name</th>
          <th>Current Post</th>
          <th>Status</th>
          <th className="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sisters.map((s) => (
          <tr key={s.id}>
            <td>
              <div className="flex items-center gap-3">
                <div className="avatar-small" style={s.passportPhoto ? { backgroundImage: `url(${s.passportPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}>
                  {s.passportPhoto ? '' : s.fullName?.[0]}
                </div>
                <div>
                  <div className="font-bold">{s.fullName}</div>
                  <div className="text-xs text-muted">ID: {s.id.slice(0, 8)}</div>
                </div>
              </div>
            </td>
            <td>{s.religiousName || '—'}</td>
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
