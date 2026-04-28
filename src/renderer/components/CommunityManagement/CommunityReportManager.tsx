import React, { useState, useEffect } from 'react';
import { FileText, Plus, Loader2, Save, Trash2, Calendar, ClipboardCheck, Info, X, Pencil } from 'lucide-react';
import { showToast } from '../../utils/toast';
import ReportDocumentManager from './ReportDocumentManager';

interface CommunityReportManagerProps {
  communityId: string;
}

const CommunityReportManager: React.FC<CommunityReportManagerProps> = ({ communityId }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [editingReport, setEditingReport] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Planning');
  const [folderDate, setFolderDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const statusOptions = [
    { label: 'Planning', color: '#94a3b8' },
    { label: 'In Development', color: '#eab308' },
    { label: 'Operational', color: '#22c55e' },
    { label: 'Maintenance', color: '#3b82f6' },
    { label: 'Inactive', color: '#ef4444' }
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getCommunityReports(communityId);
      setReports(data || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Fetch Failed', 'Could not load community reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [communityId]);

  const handleUpsertReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // @ts-ignore
      await window.api.upsertCommunityReport(editingReport?.id, {
        communityId,
        title,
        status,
        folderDate,
        notes
      });
      showToast('success', editingReport ? 'Report Updated' : 'Report Created', `Community report has been ${editingReport ? 'updated' : 'added'}.`);
      setShowAddForm(false);
      setEditingReport(null);
      setTitle('');
      setNotes('');
      fetchReports();
    } catch (err) {
      console.error(err);
      showToast('error', 'Action Failed', 'Could not save the report.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (report: any) => {
    setEditingReport(report);
    setTitle(report.title);
    setStatus(report.status);
    setFolderDate(new Date(report.folderDate).toISOString().split('T')[0]);
    setNotes(report.notes || '');
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingReport(null);
    setTitle('');
    setStatus('Planning');
    setFolderDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      // @ts-ignore
      await window.api.deleteCommunityReport(id);
      showToast('success', 'Report Deleted', 'Record removed.');
      fetchReports();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not remove report.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="mt-4 text-muted">Retrieving community reports...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 style={{ margin: 0, fontWeight: 800 }}>Community Reports</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Historical folders and community status reports.</p>
        </div>
        {!showAddForm && (
          <button className="btn btn-primary btn-sm ripple" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> New Report
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--accent-light)' }}>
          <h4 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>{editingReport ? 'Update Existing Report' : 'Create New Report Entry'}</h4>
          <form onSubmit={handleUpsertReport} className="grid gap-6">
            <div className="grid grid-2">
              <div className="form-group">
                <label>Report Title / Folder Name</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Annual Community Review 2024"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Date Created (Folder Date)</label>
                <input 
                  type="date" 
                  value={folderDate} 
                  onChange={(e) => setFolderDate(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Current Project State</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map(opt => (
                  <option key={opt.label} value={opt.label}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Notes / Observations</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Key highlights or notes from this report..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <button type="button" className="btn btn-outline" onClick={cancelForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><Save size={18} /> {editingReport ? 'Update Changes' : 'Save Report Entry'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {reports.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {reports.map((report) => (
            <div key={report.id} className="glass-panel" style={{ 
              background: 'white', 
              border: '1px solid var(--border)', 
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '4px', 
                height: '100%', 
                background: statusOptions.find(o => o.label === report.status)?.color || '#94a3b8'
              }} />
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'rgba(var(--primary-rgb), 0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'var(--primary)' 
                  }}>
                    <ClipboardCheck size={20} />
                  </div>
                  <span style={{ 
                    background: (statusOptions.find(o => o.label === report.status)?.color || '#94a3b8') + '15',
                    color: statusOptions.find(o => o.label === report.status)?.color || '#64748b',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: `1px solid ${(statusOptions.find(o => o.label === report.status)?.color || '#94a3b8')}30`
                  }}>
                    {report.status}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem', lineHeight: 1.3 }}>
                  {report.title}
                </h4>
                
                <div className="flex items-center gap-1 text-muted mb-4" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  <Calendar size={12} /> {new Date(report.folderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                {report.notes && (
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.5,
                    margin: '0 0 1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {report.notes}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-auto pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => setSelectedReport(report)}
                    style={{ 
                      borderRadius: '10px', 
                      fontSize: '0.75rem', 
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      border: '1px solid var(--info)',
                      color: 'var(--info)'
                    }}
                  >
                    <Info size={14} /> Details
                  </button>
                  <button 
                    className="icon-btn" 
                    onClick={() => startEdit(report)}
                    style={{ color: 'var(--primary)', opacity: 0.6 }}
                    title="Edit Report"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
                <button 
                  className="icon-btn" 
                  onClick={() => handleDelete(report.id)}
                  style={{ color: 'var(--danger)', opacity: 0.6 }}
                  title="Delete Report"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '24px', background: 'rgba(var(--primary-rgb), 0.01)' }}>
          <FileText size={48} className="text-muted" style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h5 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>No Reports Found</h5>
          <p className="text-muted" style={{ maxWidth: '300px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>Record your community review meetings and annual status folders here.</p>
          {!showAddForm && (
            <button className="btn btn-outline btn-sm" onClick={() => setShowAddForm(true)}>
              <Plus size={16} /> Create Initial Report
            </button>
          )}
        </div>
      )}
      {/* Next-Gen Report Details Modal */}
      {selectedReport && (
        <div className="modal-overlay" style={{ zIndex: 1100, backdropFilter: 'blur(12px)', backgroundColor: 'rgba(2, 6, 23, 0.7)' }}>
          <div className="animate-scale-in" style={{ 
            width: '95%', 
            maxWidth: '1000px', 
            height: '85vh',
            background: 'white', 
            borderRadius: '32px', 
            overflow: 'hidden',
            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Background Decorative Blobs */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '300px', height: '300px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

            {/* Header Area */}
            <div style={{ 
              padding: '2rem 3rem', 
              borderBottom: '1px solid rgba(0,0,0,0.05)', 
              background: 'rgba(255,255,255,0.8)', 
              backdropFilter: 'blur(10px)',
              zIndex: 10
            }} className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '16px', 
                  background: 'var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '1.5rem',
                  color: 'white',
                  boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.2)'
                }}>
                  <ClipboardCheck size={28} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 900, color: 'var(--primary)', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{selectedReport.title}</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Community Official Record • #{selectedReport.id.split('-')[0]}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                style={{ 
                  background: '#f1f5f9', 
                  border: 'none', 
                  color: '#64748b', 
                  borderRadius: '14px', 
                  padding: '10px 18px',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={20} /> Close
              </button>
            </div>
            
            {/* Main Content Pane (Stacked Vertical) */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
              
              {/* Top Section - Observations & Meta (Compacted) */}
              <div style={{ padding: '2rem 3rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem', alignItems: 'start' }}>
                  
                  {/* Left: Observations */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(var(--accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        <FileText size={18} />
                      </div>
                      <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>Record Observations</h3>
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.95rem', 
                      lineHeight: 1.6, 
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                      padding: '1.5rem',
                      background: '#fcfcfd',
                      borderRadius: '20px',
                      border: '1px solid #f1f5f9',
                      boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.01)',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {selectedReport.notes || 'No detailed observations recorded.'}
                    </div>
                  </div>

                  {/* Right: Quick Meta Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="meta-group">
                      <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'block' }}>Report Status</label>
                      <div style={{ 
                        background: '#f8fafc', 
                        padding: '0.85rem 1.25rem', 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}>
                        <div style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: statusOptions.find(o => o.label === selectedReport.status)?.color || '#94a3b8'
                        }} />
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{selectedReport.status}</span>
                      </div>
                    </div>

                    <div className="meta-group">
                      <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'block' }}>Filing Date</label>
                      <div style={{ 
                        background: '#f8fafc', 
                        padding: '0.85rem 1.25rem', 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        color: 'var(--primary)'
                      }}>
                        <Calendar size={16} className="text-muted" />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date(selectedReport.folderDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Full Width Dark Attachments */}
              <div style={{ 
                background: '#0f172a', 
                padding: '3rem', 
                margin: '1rem', 
                borderRadius: '32px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}>
                <ReportDocumentManager reportId={selectedReport.id} />
              </div>

              {/* Footer Info */}
              <div style={{ padding: '2rem 3rem 4rem', textAlign: 'center' }}>
                 <div style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 2rem', 
                  background: 'rgba(var(--primary-rgb), 0.03)', 
                  borderRadius: '100px', 
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  <Info size={18} className="text-info" />
                  Official Franciscan System Community Archive Entry • Authorized Personnel Only
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityReportManager;
