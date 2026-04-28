import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  ChevronRight,
  Briefcase,
  ExternalLink,
  History,
  TrendingUp,
  Globe,
  Plus,
  Download
} from 'lucide-react';
import { showToast } from '../../utils/toast';
import ObedienceTimeline from './ObedienceTimeline';

const ObedienceManagement = () => {
  const [sisters, setSisters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSisterId, setSelectedSisterId] = useState<string | null>(null);
  const [selectedSisterName, setSelectedSisterName] = useState<string>('');
  const [stats, setStats] = useState({
    totalObediences: 0,
    activeMissions: 0,
    recentTransfers: 0,
    uniqueCommunities: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getSisters();
      setSisters(data);

      // Calculate basic stats - Use 'Obediences' as named in Prisma schema
      const allObediences = data.flatMap(s => s.Obediences || []);
      const uniqueComms = new Set(allObediences.map(a => a.communityName)).size;
      const recent = allObediences.filter(a => {
        const date = new Date(a.startDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo;
      }).length;

      setStats({
        totalObediences: allObediences.length,
        activeMissions: data.filter(s => s.status === 'mission' || s.status === 'active').length,
        recentTransfers: recent,
        uniqueCommunities: uniqueComms
      });
    } catch (err) {
      console.error(err);
      showToast('error', 'Fetch Failed', 'Could not load Obedience records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSisters = sisters.filter(s =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.religiousName && s.religiousName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedSisterId) {
    return (
      <div className="animate-fade-in">
        <header className="page-header" style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => setSelectedSisterId(null)}>
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem' }}>{selectedSisterName}</h1>
              <p style={{ fontSize: '0.9rem' }}>Obedience history and mission timeline.</p>
            </div>
          </div>
        </header>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <ObedienceTimeline
            sisterId={selectedSisterId}
            sisterName={selectedSisterName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header className="page-header" style={{ alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900 }}>Mission & Obediences</h1>
          <p style={{ fontSize: '1rem', opacity: 0.8 }}>Manage transfers and community postings across the province.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={fetchData}><History size={18} /> Refresh</button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="stats-grid" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem', border: 'none', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
          <div className="stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Postings</div>
          <div className="stat-value" style={{ color: 'white', fontSize: '2rem' }}>{stats.totalObediences}</div>
          <div className="stat-trend" style={{ color: 'var(--accent)' }}>Province History</div>
          <ArrowRightLeft size={48} style={{ position: 'absolute', right: '1rem', bottom: '1rem', opacity: 0.1 }} />
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div className="stat-label">Active Missions</div>
          <div className="stat-value" style={{ fontSize: '2rem' }}>{stats.activeMissions}</div>
          <div className="stat-trend positive">Current Field Staff</div>
          <Globe size={48} className="text-success" style={{ position: 'absolute', right: '1rem', bottom: '1rem', opacity: 0.05 }} />
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div className="stat-label">Recent Transfers</div>
          <div className="stat-value" style={{ fontSize: '2rem' }}>{stats.recentTransfers}</div>
          <div className="stat-trend warning">Last 30 Days</div>
          <TrendingUp size={48} className="text-warning" style={{ position: 'absolute', right: '1rem', bottom: '1rem', opacity: 0.05 }} />
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div className="stat-label">Mission Stations</div>
          <div className="stat-value" style={{ fontSize: '2rem' }}>{stats.uniqueCommunities}</div>
          <div className="stat-trend info">Unique Locations</div>
          <MapPin size={48} className="text-info" style={{ position: 'absolute', right: '1rem', bottom: '1rem', opacity: 0.05 }} />
        </div>
      </div>

      {/* Tools & Actions ABOVE the table */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <div className="flex items-center gap-6">
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.25rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Common tasks and reporting tools.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary btn-sm" onClick={() => showToast('info', 'Province Transfer', 'Please select a sister from the list below to initiate a transfer.')}>
              <ArrowRightLeft size={16} /> New Obedience
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => showToast('info', 'Coming Soon', 'Report generation is being updated.')}>
              <TrendingUp size={16} className="text-accent" /> Monthly Summary
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => showToast('info', 'Coming Soon', 'Global mission maps are in development.')}>
              <Globe size={16} className="text-info" /> View Mission Map
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4" style={{ paddingLeft: '2rem', borderLeft: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            <History size={16} className="text-accent" />
            <span>History is auto-chained.</span>
          </div>
        </div>
      </div>

      <div className="main-panel">
        <div className="glass-panel no-padding overflow-hidden" style={{ borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.5rem', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="search-box" style={{ maxWidth: '400px', flex: 1 }}>
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search by name or religious name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              <Filter size={16} />
              <span>Showing {filteredSisters.length} Sisters</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ color: 'white', padding: '1.25rem 1.5rem' }}>Sister Information</th>
                  <th style={{ color: 'white', padding: '1.25rem 1.5rem' }}>Current Obedience</th>
                  <th style={{ color: 'white', padding: '1.25rem 1.5rem' }}>Status</th>
                  <th style={{ color: 'white', padding: '1.25rem 1.5rem' }}>Last Transfer</th>
                  <th style={{ color: 'white', padding: '1.25rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ padding: '6rem' }}>
                      <div className="animate-pulse">Loading province records...</div>
                    </td>
                  </tr>
                ) : filteredSisters.length > 0 ? (
                  filteredSisters.map(sister => {
                    // Use 'Obediences' as named in Prisma schema
                    const current = (sister.Obediences || [])
                      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

                    return (
                      <tr key={sister.id} className="hover-row">
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div className="flex items-center gap-4">
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: '14px',
                                backgroundImage: sister.passportPhoto ? `url(${sister.passportPhoto})` : 'none',
                                backgroundColor: sister.passportPhoto ? 'transparent' : 'var(--primary)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                              }}
                            >
                              {!sister.passportPhoto && sister.fullName.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{sister.fullName}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sister.religiousName || 'No Religious Name'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div className="flex items-center gap-2" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                              <MapPin size={14} className="text-accent" />
                              <span>{sister.currentCommunity || 'Unassigned'}</span>
                            </div>
                            <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <Briefcase size={13} />
                              <span>{sister.currentRole || 'Member'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span className={`badge badge-${sister.status === 'active' ? 'success' : sister.status === 'mission' ? 'info' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                            {sister.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          {current ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                                {new Date(current.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Effective Date</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-outline btn-sm ripple"
                            onClick={() => {
                              setSelectedSisterId(sister.id);
                              setSelectedSisterName(sister.fullName);
                            }}
                            style={{ borderRadius: '10px' }}
                          >
                            Manage <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ padding: '5rem' }}>
                      <Search size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                      <p className="text-muted">No sister found matching "<strong>{searchTerm}</strong>"</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObedienceManagement;
