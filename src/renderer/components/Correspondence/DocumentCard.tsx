import React from 'react';
import { Send, Inbox, CheckCircle2, Clock, Eye, Download, Trash2 } from 'lucide-react';

interface DocumentCardProps {
  doc: any;
  onDelete: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onDelete }) => (
  <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1rem', borderLeft: `6px solid ${doc.direction === 'Sent' ? 'var(--info)' : 'var(--accent)'}`, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ padding: '1rem', background: doc.direction === 'Sent' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)', borderRadius: '12px', color: doc.direction === 'Sent' ? 'var(--info)' : 'var(--accent)' }}>
      {doc.direction === 'Sent' ? <Send size={24} /> : <Inbox size={24} />}
    </div>
    
    <div style={{ flex: 1 }}>
      <div className="flex justify-between items-start">
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{doc.subject}</h4>
          <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
            <span className="text-accent" style={{ fontWeight: 700 }}>{doc.type}</span> • {new Date(doc.date).toLocaleDateString()}
          </p>
        </div>
        <span className={`badge badge-${doc.status === 'followed-up' ? 'success' : 'warning'}`}>
          {doc.status === 'followed-up' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          {doc.status}
        </span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sender</span>
          <span style={{ fontWeight: 600 }}>{doc.sender}</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recipient</span>
          <span style={{ fontWeight: 600 }}>{doc.recipient}</span>
        </div>
      </div>
    </div>

    <div className="flex gap-2">
      <button className="icon-btn" title="View"><Eye size={18} /></button>
      <button className="icon-btn" title="Download"><Download size={18} /></button>
      <button className="icon-btn text-danger" title="Delete" onClick={() => onDelete(doc.id)}><Trash2 size={18} /></button>
    </div>
  </div>
);

export default DocumentCard;
