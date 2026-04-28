import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, ExternalLink, Paperclip, Loader2 } from 'lucide-react';
import { showToast } from '../../utils/toast';

interface ReportDocumentManagerProps {
  reportId: string;
}

const ReportDocumentManager: React.FC<ReportDocumentManagerProps> = ({ reportId }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getReportDocuments(reportId);
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [reportId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        showToast('warning', 'File Too Large', 'Maximum file size is 10MB.');
        return;
      }

      setUploading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // @ts-ignore
        await window.api.uploadReportDocument({
          reportId,
          title: file.name.split('.')[0],
          category: 'Report Attachment',
          fileName: file.name,
          buffer: uint8Array
        });
        
        showToast('success', 'Document Attached', 'The file has been linked to this report.');
        fetchDocuments();
      } catch (err: any) {
        showToast('error', 'Upload Failed', err.message || 'Could not attach document.');
      } finally {
        setUploading(false);
      }
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

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this attachment?')) return;
    try {
      // @ts-ignore
      await window.api.deleteSisterDocument(id); // Using the same delete handler as it's generic for Documents
      showToast('success', 'Attachment Removed', 'Record updated.');
      fetchDocuments();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not remove attachment.');
    }
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '1.75rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="flex justify-between items-center mb-6">
        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Paperclip size={20} className="text-accent" /> Attachments
          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 8px', borderRadius: '6px', marginLeft: '0.75rem' }}>{documents.length}</span>
        </h4>
        <div style={{ position: 'relative' }}>
          <input 
            type="file" 
            onChange={handleFileUpload} 
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', zIndex: 2 }}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
          <button className="btn btn-sm ripple" style={{ 
            fontSize: '0.75rem', 
            padding: '8px 16px', 
            borderRadius: '10px',
            border: '1px solid var(--accent)',
            color: 'white',
            background: 'var(--accent)',
            boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)'
          }} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" size={14} /> : <><Upload size={14} /> Add File</>}
          </button>
        </div>
      </div>

      {documents.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '1rem', 
          overflowY: 'auto', 
          maxHeight: '450px', 
          paddingRight: '0.5rem' 
        }}>
          {documents.map((doc) => (
            <div key={doc.id} className="attachment-tile" style={{ 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '16px', 
              padding: '1rem 1.5rem', 
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between', // Push actions to the end
              transition: 'all 0.2s ease',
            }}>
              <div className="flex items-center gap-4" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: 'rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)',
                  flexShrink: 0
                }}>
                  <FileText size={20} />
                </div>
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: '#f1f5f9',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {doc.fileName}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                    {(doc.fileSize / 1024).toFixed(0)} KB • {doc.fileType?.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4" style={{ flexShrink: 0 }}>
                <button 
                  className="icon-btn" 
                  onClick={() => handleOpen(doc.filePath)} 
                  style={{ 
                    color: 'white', 
                    background: 'rgba(255,255,255,0.05)', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  title="View File"
                >
                  <ExternalLink size={14} />
                </button>
                <button 
                  className="icon-btn" 
                  onClick={() => handleDelete(doc.id)} 
                  style={{ 
                    color: '#ef4444', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '2rem', 
          border: '2px dashed #f1f5f9', 
          borderRadius: '20px',
          color: '#94a3b8'
        }}>
          <Paperclip size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
          <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>No files attached</p>
        </div>
      )}
    </div>
  );
};

export default ReportDocumentManager;
