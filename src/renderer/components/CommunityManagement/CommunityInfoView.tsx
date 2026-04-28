import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, MapPin, Users, Phone, Info, Mail, X, FileText } from 'lucide-react';
import CommunityReportManager from './CommunityReportManager';

interface CommunityInfoViewProps {
  community: any;
  onBack: () => void;
}

const CommunityInfoView: React.FC<CommunityInfoViewProps> = ({ community, onBack }) => {
  const [sisters, setSisters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSister, setSelectedSister] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'residents' | 'reports'>('residents');

  useEffect(() => {
    const fetchSisters = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        const data = await window.api.getSisters({ community: community.name });
        setSisters(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSisters();
  }, [community.name]);

  return (
    <div className="animate-fade-in">
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="icon-btn"><ArrowLeft size={20} /></button>
            <div>
              <h1>{community.name} Details</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                {community.apostolateType?.split(', ').map((ap: string) => (
                  <span key={ap} className="badge badge-info" style={{ fontSize: '0.75rem' }}>{ap}</span>
                ))}
                <span className="text-muted" style={{ fontSize: '0.9rem', marginLeft: '0.5rem' }}>• {community.location}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        <button 
          className={`tab-btn ${activeTab === 'residents' ? 'active' : ''}`}
          onClick={() => setActiveTab('residents')}
          style={{ 
            padding: '1rem 1.5rem', 
            fontWeight: 800, 
            fontSize: '0.9rem',
            borderBottom: activeTab === 'residents' ? '3px solid var(--accent)' : '3px solid transparent',
            color: activeTab === 'residents' ? 'var(--primary)' : 'var(--text-muted)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={18} /> Resident Sisters
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
          style={{ 
            padding: '1rem 1.5rem', 
            fontWeight: 800, 
            fontSize: '0.9rem',
            borderBottom: activeTab === 'reports' ? '3px solid var(--accent)' : '3px solid transparent',
            color: activeTab === 'reports' ? 'var(--primary)' : 'var(--text-muted)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText size={18} /> Community Reports
        </button>
      </div>

      {activeTab === 'residents' ? (
        <div className="grid grid-2" style={{ gap: '2.5rem', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>House Information</h3>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '14px' }}>
                <div style={{ color: 'var(--accent)' }}><Shield size={20} /></div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Co-ordinator</label>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>{community.superiorName || 'Not Appointed'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '14px' }}>
                <div style={{ color: 'var(--accent)' }}><MapPin size={20} /></div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jurisdiction</label>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>{community.diocese} Diocese</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '14px' }}>
                <div style={{ color: 'var(--accent)' }}><Users size={20} /></div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Residence Capacity</label>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>{sisters.length} Current / {community.capacity} Maximum</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '14px' }}>
                <div style={{ color: 'var(--accent)' }}><Phone size={20} /></div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>House Contact</label>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>{community.contactPhone || 'No assigned line'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Assigned Sisters</h3>
              <span className="badge badge-info">{sisters.length} Sisters</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                <p className="text-muted">Loading resident data...</p>
              ) : sisters.length > 0 ? (
                sisters.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4" style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid transparent', transition: 'var(--transition)' }}>
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 800,
                        backgroundImage: s.passportPhoto ? `url(${s.passportPhoto})` : 'none',
                        backgroundSize: 'cover'
                      }}>
                        {!s.passportPhoto && (s.religiousName?.[0] || s.fullName?.[0])}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>{s.religiousName || s.fullName}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.currentRole || 'Member'} • {s.status}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div title={s.email || 'No Email'} style={{ color: 'var(--accent)', cursor: 'help' }}><Mail size={14} /></div>
                      <div title={s.phone || 'No Phone'} style={{ color: 'var(--accent)', cursor: 'help' }}><Phone size={14} /></div>
                      <button
                        className="icon-btn"
                        onClick={() => setSelectedSister(s)}
                        style={{ color: 'var(--info)', padding: '4px' }}
                      >
                        <Info size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '16px' }}>
                  <Users size={32} className="text-muted" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>No sisters are currently registered to this house in the directory.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <CommunityReportManager communityId={community.id} />
      )}

      {selectedSister && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="glass-panel animate-scale-up" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', background: 'white', position: 'relative' }}>
            <button
              onClick={() => setSelectedSister(null)}
              className="icon-btn"
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-6 mb-8">
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '24px',
                background: 'var(--accent)',
                backgroundImage: selectedSister.passportPhoto ? `url(${selectedSister.passportPhoto})` : 'none',
                backgroundSize: 'cover'
              }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {selectedSister.religiousName || selectedSister.fullName}
                </h2>
                <p className="text-muted" style={{ fontSize: '1.1rem' }}>{selectedSister.currentRole || 'Member'}</p>
                <span className={`badge badge-${selectedSister.status === 'active' ? 'success' : 'info'}`}>
                  {selectedSister.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="info-block">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Official Name</label>
                <p style={{ fontWeight: 700, margin: '4px 0' }}>{selectedSister.fullName}</p>
              </div>
              <div className="info-block">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Nationality</label>
                <p style={{ fontWeight: 700, margin: '4px 0' }}>{selectedSister.nationality || 'N/A'}</p>
              </div>
              <div className="info-block">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Phone</label>
                <p style={{ fontWeight: 700, margin: '4px 0' }}>{selectedSister.phone || 'N/A'}</p>
              </div>
              <div className="info-block">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Email</label>
                <p style={{ fontWeight: 700, margin: '4px 0' }}>{selectedSister.email || 'N/A'}</p>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                For complete records including obediences and correspondence, please visit the <strong>Sister Directory</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityInfoView;
