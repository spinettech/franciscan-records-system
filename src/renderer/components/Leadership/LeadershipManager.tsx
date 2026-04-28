import React, { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Award, Calendar, Loader2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { showToast } from '../../utils/toast';

const LeadershipManager = () => {
  const [leadership, setLeadership] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPos, setEditingPos] = useState<any>(null);
  const [sisters, setSisters] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [sisterId, setSisterId] = useState('');
  const [name, setName] = useState('');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLeadership = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getLeadership();
      setLeadership(data || []);
    } catch (err) {
      showToast('error', 'Fetch Failed', 'Could not load leadership records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSisters = async () => {
    try {
      // @ts-ignore
      const data = await window.api.getSisters();
      setSisters(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeadership();
    fetchSisters();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        sisterId: sisterId || null,
        name: sisterId ? null : name,
        termStart: termStart ? new Date(termStart) : null,
        termEnd: termEnd ? new Date(termEnd) : null
      };

      // @ts-ignore
      await window.api.upsertLeadership(editingPos?.id, payload);
      showToast('success', 'Leadership Updated', 'Provincial leadership records saved.');
      resetForm();
      fetchLeadership();
    } catch (err) {
      showToast('error', 'Save Failed', 'Could not update leadership records.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (pos: any) => {
    setEditingPos(pos);
    setTitle(pos.title);
    setSisterId(pos.sisterId || '');
    setName(pos.name || '');
    setTermStart(pos.termStart ? new Date(pos.termStart).toISOString().split('T')[0] : '');
    setTermEnd(pos.termEnd ? new Date(pos.termEnd).toISOString().split('T')[0] : '');
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPos(null);
    setTitle('');
    setSisterId('');
    setName('');
    setTermStart('');
    setTermEnd('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this leadership position?')) return;
    try {
      // @ts-ignore
      await window.api.deleteLeadership(id);
      showToast('success', 'Removed', 'Leadership position removed.');
      fetchLeadership();
    } catch (err) {
      showToast('error', 'Error', 'Failed to remove position.');
    }
  };

  const groupedLeadership = leadership.reduce((acc: any, pos: any) => {
    const isCurrent = !pos.termEnd || new Date(pos.termEnd) > new Date();
    const year = pos.termStart ? new Date(pos.termStart).getFullYear() : 'Undated';
    const key = isCurrent ? 'Current Administration' : `Provincial Leadership ${year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pos);
    return acc;
  }, {});

  // Sort keys so current is first, then years descending
  const sortedKeys = Object.keys(groupedLeadership).sort((a, b) => {
    if (a === 'Current Administration') return -1;
    if (b === 'Current Administration') return 1;
    return b.localeCompare(a);
  });

  return (
    <div className="animate-fade-in p-8" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--primary)', marginBottom: '0.5rem' }}>Leadership Board</h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Historical and current provincial administration records.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary ripple" onClick={() => setShowForm(true)}>
            <Plus size={20} /> Assign Position
          </button>
        )}
      </header>

      {showForm && (
        <div className="glass-panel animate-scale-in" style={{ padding: '2.5rem', marginBottom: '3rem', border: '1px solid var(--accent-light)' }}>
          <div className="flex justify-between items-center mb-8">
            <h3 style={{ margin: 0, fontWeight: 800 }}>{editingPos ? 'Modify Leadership Position' : 'New Leadership Assignment'}</h3>
            <button className="icon-btn" onClick={resetForm}><X size={20} /></button>
          </div>
          <form onSubmit={handleSave} className="grid gap-6">
            <div className="grid grid-1">
              <div className="form-group">
                <label>Leadership Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Provincial Superior" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Link to Sister Profile</label>
                <select value={sisterId} onChange={e => setSisterId(e.target.value)}>
                  <option value="">Manual Name Entry (No Profile Link)</option>
                  {sisters.map(s => (
                    <option key={s.id} value={s.id}>{s.religiousName || s.fullName}</option>
                  ))}
                </select>
              </div>
              {!sisterId && (
                <div className="form-group">
                  <label>Full Name (Manual)</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter name manually" 
                  />
                </div>
              )}
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Term Start Date</label>
                <input type="date" value={termStart} onChange={e => setTermStart(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Term End Date (Optional)</label>
                <input type="date" value={termEnd} onChange={e => setTermEnd(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" className="btn btn-outline" onClick={resetForm}>Discard Changes</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><Save size={18} /> Confirm Leadership Assignment</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="mt-4 text-muted">Synchronizing leadership records...</p>
        </div>
      ) : leadership.length > 0 ? (
        <div className="space-y-12">
          {sortedKeys.map((key) => (
            <div key={key} className="animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</h3>
                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, var(--border), transparent)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {groupedLeadership[key].map((pos: any) => (
                  <div key={pos.id} className="glass-panel leadership-card" style={{ 
                    padding: '2rem', 
                    background: 'white', 
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '4px', 
                      height: '100%', 
                      background: key === 'Current Administration' ? 'var(--primary)' : 'var(--text-muted)',
                      opacity: key === 'Current Administration' ? 1 : 0.3
                    }} />
                    
                    <div className="flex justify-between items-start mb-5">
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        background: key === 'Current Administration' ? 'rgba(var(--primary-rgb), 0.05)' : '#f8fafc', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: key === 'Current Administration' ? 'var(--primary)' : 'var(--text-muted)'
                      }}>
                        <Award size={24} />
                      </div>
                      <div className="flex gap-2">
                        <button className="icon-btn sm" onClick={() => startEdit(pos)} title="Edit Position"><Pencil size={14} /></button>
                        <button className="icon-btn sm text-danger" onClick={() => handleDelete(pos.id)} title="Remove"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className="mb-5">
                      <h4 style={{ margin: 0, fontSize: '0.7rem', fontWeight: 900, color: key === 'Current Administration' ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{pos.title}</h4>
                      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1.2 }}>
                        {pos.sister?.religiousName || pos.sister?.fullName || pos.name}
                      </h2>
                    </div>

                    <div className="mt-auto pt-5" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        <Calendar size={14} />
                        <span>
                          {pos.termStart ? new Date(pos.termStart).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'} 
                          {' — '} 
                          {pos.termEnd ? new Date(pos.termEnd).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '5rem 2rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '32px', background: 'rgba(var(--primary-rgb), 0.01)' }}>
          <Award size={64} className="text-muted" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
          <h3 style={{ fontWeight: 900, color: 'var(--primary)', marginBottom: '0.75rem' }}>No Leadership Records</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.6 }}>Record the provincial administration and governing bodies of the province here.</p>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={20} /> Assign First Position
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadershipManager;
