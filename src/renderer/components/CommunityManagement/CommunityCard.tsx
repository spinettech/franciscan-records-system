import React from 'react';
import { Building2, Shield, Users, Phone, Info, Edit, Trash } from 'lucide-react';

interface CommunityCardProps {
  comm: any;
  onEdit: (c: any) => void;
  onDelete: (id: string) => void;
  onView: (c: any) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ comm, onEdit, onDelete, onView }) => (
  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--border)', background: 'white' }}>
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        <div style={{ padding: '0.75rem', background: 'rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.05)', borderRadius: '14px', color: 'var(--primary)' }}>
          <Building2 size={28} />
        </div>
        <div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{comm.name}</h4>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>{comm.location}, {comm.diocese}</p>
        </div>
      </div>
      <span className={`badge badge-${comm.isActive ? 'success' : 'danger'}`}>
        {comm.isActive ? 'Active' : 'Closed'}
      </span>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
      <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.9rem' }}>
        <Shield size={18} className="text-accent" /> 
        <span>Superior: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{comm.superiorName || 'Not Assigned'}</span></span>
      </div>
      <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.9rem' }}>
        <Users size={18} className="text-accent" /> 
        <span>Sisters: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{comm.sistersCount || 0} / {comm.capacity}</span></span>
      </div>
      <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.9rem' }}>
        <Phone size={18} className="text-accent" /> 
        <span>{comm.contactPhone || 'No direct line'}</span>
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', flex: 1, marginRight: '1rem' }}>
        {comm.apostolateType?.split(', ').map((ap: string) => (
          <span key={ap} className="badge badge-info" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{ap}</span>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="icon-btn" title="View Details" onClick={() => onView(comm)} style={{ color: 'var(--info)' }}><Info size={16} /></button>
        <button className="icon-btn" title="Edit House" onClick={() => onEdit(comm)}><Edit size={16} /></button>
        <button className="icon-btn" style={{ color: 'var(--danger)' }} title="Delete" onClick={() => onDelete(comm.id)}><Trash size={16} /></button>
      </div>
    </div>
  </div>
);

export default CommunityCard;
