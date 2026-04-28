import React, { useState, useEffect } from 'react';
import { Upload, Inbox, Send, Search } from 'lucide-react';
import { showToast } from '../utils/toast';
import DocumentCard from './Correspondence/DocumentCard';
import CorrespondenceForm from './Correspondence/CorrespondenceForm';

const Correspondence = ({ initialUploadMode = false, onModeReset }: { initialUploadMode?: boolean, onModeReset?: () => void }) => {
  const [direction, setDirection] = useState('all');
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(initialUploadMode);
  const [search, setSearch] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getCorrespondence({ direction, search });
      setDocs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this correspondence record?')) {
      try {
        // @ts-ignore
        await window.api.deleteCorrespondence(id);
        showToast('success', 'Record Deleted', 'The correspondence entry has been removed from the archive.');
        fetchDocs();
      } catch (err: any) {
        showToast('error', 'Delete Failed', err.message || 'Could not delete the correspondence record.');
      }
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [direction, search]);

  if (isAdding) {
    return (
      <CorrespondenceForm 
        onBack={() => { setIsAdding(false); onModeReset?.(); }} 
        onSave={() => { setIsAdding(false); onModeReset?.(); fetchDocs(); }} 
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Correspondence Registry</h1>
          <p>Official repository and tracking of all congregation documents.</p>
        </div>
        <button className="btn btn-primary ripple" onClick={() => setIsAdding(true)}>
          <Upload size={18}/> New Entry
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2.5rem' }}>
        <div>
          <div className="flex gap-3 mb-8">
            <button className={`btn ${direction === 'all' ? 'btn-primary' : 'btn-outline'}`} style={direction === 'all' ? {} : {background: 'white'}} onClick={() => setDirection('all')}>All Volumes</button>
            <button className={`btn ${direction === 'Received' ? 'btn-primary' : 'btn-outline'}`} style={direction === 'Received' ? {} : {background: 'white'}} onClick={() => setDirection('Received')}><Inbox size={18}/> Received</button>
            <button className={`btn ${direction === 'Sent' ? 'btn-primary' : 'btn-outline'}`} style={direction === 'Sent' ? {} : {background: 'white'}} onClick={() => setDirection('Sent')}><Send size={18}/> Outgoing</button>
          </div>

          <div className="docs-list">
            {loading ? (
              <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>Synchronising with central archive...</div>
            ) : docs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>No correspondence found matching your filters.</div>
            ) : docs.map(doc => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        <aside>
          <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
            <h3 className="section-title">Archive Search</h3>
            <div className="form-group mb-6">
              <label>Topic / Reference</label>
              <div className="search-bar">
                <Search size={18} />
                <input placeholder="Search subjects, senders..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(249,115,22,0.04)', borderRadius: '18px', border: '1px solid rgba(249,115,22,0.1)', color: 'var(--accent)' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 850, letterSpacing: '-0.01em' }}>Curia Insights</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                You have <strong>{docs.filter(d => d.status === 'pending').length}</strong> records awaiting review or follow-up in this view.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Correspondence;
