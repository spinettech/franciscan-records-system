import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, ExternalLink, Plus, Loader2, Paperclip } from 'lucide-react';
import { showToast } from '../../utils/toast';

interface DocumentManagerProps {
  sisterId: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ sisterId }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getSisterDocuments(sisterId);
      setDocuments(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Fetch Failed', 'Could not load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [sisterId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showToast('warning', 'File Too Large', 'Maximum file size is 10MB.');
        return;
      }
      setSelectedFile(file);
      if (!title) setTitle(file.name.split('.')[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) return;

    setUploading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // @ts-ignore
      await window.api.uploadSisterDocument({
        sisterId,
        title,
        category,
        fileName: selectedFile.name,
        buffer: uint8Array
      });
      
      showToast('success', 'Document Uploaded', 'The document has been saved successfully.');
      setShowUploadModal(false);
      setTitle('');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      console.error('[Upload] Error:', err);
      showToast('error', 'Upload Failed', err.message || 'Could not save document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) return;
    
    try {
      // @ts-ignore
      await window.api.deleteSisterDocument(id);
      showToast('success', 'Document Deleted', 'Record removed.');
      fetchDocuments();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not remove document.');
    }
  };

  const handleOpen = async (fileName: string) => {
    try {
      // @ts-ignore
      await window.api.openDocument(fileName);
    } catch (err) {
      showToast('error', 'Open Failed', 'Could not open the file.');
    }
  };

  const categories = ['Certificate', 'ID Card', 'Passport', 'Medical', 'Academic', 'Religious', 'Other'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="mt-4 text-muted">Retrieving document records...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="section-title" style={{ margin: 0 }}>Digital Archives</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Secure storage for certificates, IDs, and official records.</p>
        </div>
        <button className="btn btn-primary btn-sm ripple" onClick={() => setShowUploadModal(true)}>
          <Plus size={16} /> Add Document
        </button>
      </div>

      {documents.length > 0 ? (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card flex items-center justify-between p-4" style={{ 
              background: 'white', 
              border: '1px solid var(--border)', 
              borderRadius: '14px',
              transition: 'var(--transition)'
            }}>
              <div className="flex items-center gap-4">
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(var(--primary-rgb), 0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <FileText size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{doc.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-outline" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{doc.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="icon-btn" 
                  title="Open Document" 
                  onClick={() => handleOpen(doc.filePath)}
                  style={{ color: 'var(--info)' }}
                >
                  <ExternalLink size={18} />
                </button>
                <button 
                  className="icon-btn" 
                  title="Delete Document" 
                  onClick={() => handleDelete(doc.id)}
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '24px', background: 'rgba(var(--primary-rgb), 0.01)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <Paperclip size={32} />
          </div>
          <h5 style={{ fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--primary)' }}>No Documents Found</h5>
          <p className="text-muted" style={{ maxWidth: '300px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>Upload certificates, baptism records, and other identification documents for safe keeping.</p>
          <button className="btn btn-outline btn-sm" onClick={() => setShowUploadModal(true)}>
             <Upload size={16} /> Initial Upload
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative' }}>
            <h3 style={{ fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>Upload New Document</h3>
            <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Securely add a file to this sister's permanent record.</p>
            
            <form onSubmit={handleUpload} className="grid gap-6">
              <div className="form-group">
                <label>Document Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Birth Certificate, Masters Degree"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>File Selection</label>
                <div style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: '16px', 
                  padding: '2rem', 
                  textAlign: 'center',
                  background: 'rgba(var(--primary-rgb), 0.02)',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    required 
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                       <FileText className="text-primary" size={32} />
                       <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selectedFile.name}</span>
                       <span className="text-muted" style={{ fontSize: '0.7rem' }}>Click to change file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted">
                      <Upload size={32} />
                      <span style={{ fontWeight: 700 }}>Choose a file to upload</span>
                      <span style={{ fontSize: '0.75rem' }}>PDF, JPEG, or Word (Max 10MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={uploading || !selectedFile}>
                  {uploading ? (
                    <><Loader2 className="animate-spin" size={18} /> Uploading...</>
                  ) : (
                    <><Upload size={18} /> Confirm Upload</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
