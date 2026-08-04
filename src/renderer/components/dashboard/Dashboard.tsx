import React from 'react'
import {
  Users,
  Mail,
  MapPin,
  ArrowRightLeft,
  Heart,
  Plus,
  ChevronRight,
  Bell,
  Calendar,
  Award,
  BookOpen,
  Skull,
  UserMinus,
  GraduationCap,
  LogOut,
  BarChart3,
  PieChart,
  Globe
} from 'lucide-react'

const Dashboard = ({ stats, notifications, user, onAddSister, onAddCircular, onViewObediences }: any) => {
  const total = stats.total || 1; // Prevent divide by zero

  // Calculate Status Percentages
  const statusItems = [
    { label: 'Active Serving', count: stats.active || 0, color: 'var(--success)' },
    { label: 'In Formation', count: stats.formation || 0, color: '#6366f1' },
    { label: 'Foreign Mission', count: stats.mission || 0, color: 'var(--info)' },
    { label: 'Exclaustration', count: stats.exclaustration || 0, color: 'var(--warning)' },
    { label: 'Departure', count: stats.departure || 0, color: '#f43f5e' },
    { label: 'Deceased', count: stats.deceased || 0, color: '#64748b' },
    { label: 'Dismissed', count: stats.dismissed || 0, color: 'var(--danger)' }
  ];

  // Age Breakdown Items
  const ageData = stats.ageBreakdown || { under30: 0, age30to50: 0, age51to70: 0, over70: 0, ageUnknown: 0 };
  const ageItems = [
    { label: 'Under 30 Yrs', count: ageData.under30, color: '#0ea5e9' },
    { label: '30 – 50 Yrs', count: ageData.age30to50, color: '#10b981' },
    { label: '51 – 70 Yrs', count: ageData.age51to70, color: '#f59e0b' },
    { label: '70+ Yrs (Elders)', count: ageData.over70, color: '#8b5cf6' }
  ];

  const totalVows = (stats.finallyProfessed || 0) + (stats.notFinallyProfessed || 0) || 1;
  const perpetualPct = Math.round(((stats.finallyProfessed || 0) / totalVows) * 100);
  const tempPct = 100 - perpetualPct;

  const totalActive = (stats.active || 0) + (stats.mission || 0);
  const activeRatePct = total > 0 ? Math.round((totalActive / total) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <header className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user?.fullName || 'Sister Secretary'}. Pax et Bonum!</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary ripple" onClick={onAddSister}><Plus size={16} /> New Profile</button>
          <button className="btn btn-primary ripple" onClick={onAddCircular}><Mail size={16} /> New Circular</button>
        </div>
      </header>

      {/* TOP HERO SECTION: PROVINCIAL ANALYTICS CHARTS */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-3 mb-4">
          <div style={{ padding: '0.45rem', background: 'rgba(var(--primary-rgb), 0.08)', borderRadius: '10px', color: 'var(--primary)' }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 850, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              Provincial Analytics & Visual Intelligence
            </h3>
            <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0.1rem 0 0' }}>
              Real-time statistical breakdown of membership distribution, regional postings, and age demographics.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* Chart 1: Membership Status Breakdown */}
          <div className="glass-panel" style={{ padding: '1.35rem', background: 'white', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-accent" />
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: 'var(--primary)' }}>Membership Distribution</h4>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{stats.total} Sisters Total</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {statusItems.map((item) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                        {item.label}
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>
                        {item.count} <span style={{ fontWeight: 500, fontSize: '0.72rem' }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: item.color,
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Regional Assignments */}
          <div className="glass-panel" style={{ padding: '1.35rem', background: 'white', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-info" />
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: 'var(--primary)' }}>Regional Postings</h4>
              </div>
              <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>By Region</span>
            </div>

            {stats.regionBreakdown?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats.regionBreakdown.map((reg: any) => (
                  <div key={reg.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                        {reg.name}
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--accent)' }}>
                        {reg.count} <span style={{ fontWeight: 500, fontSize: '0.72rem', color: 'var(--text-muted)' }}>({reg.percentage}%)</span>
                      </span>
                    </div>
                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${reg.percentage}%`,
                          background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No regional data recorded.
              </div>
            )}
          </div>

          {/* Chart 3: Religious Vows & Age Groups */}
          <div className="glass-panel" style={{ padding: '1.35rem', background: 'white', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Award size={16} style={{ color: '#8b5cf6' }} />
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: 'var(--primary)' }}>Vows Ratio & Demographics</h4>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Age & Vows</span>
            </div>

            {/* Vows Bar */}
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                <span style={{ color: '#8b5cf6' }}>Perpetual Vows ({perpetualPct}%)</span>
                <span style={{ color: '#0ea5e9' }}>Temporary Vows ({tempPct}%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${perpetualPct}%`, background: '#8b5cf6' }} title={`Perpetual: ${stats.finallyProfessed}`} />
                <div style={{ width: `${tempPct}%`, background: '#0ea5e9' }} title={`Temporary: ${stats.notFinallyProfessed}`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <span>{stats.finallyProfessed || 0} Sisters</span>
                <span>{stats.notFinallyProfessed || 0} Sisters</span>
              </div>
            </div>

            {/* Age Groups List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Age Demographics
              </span>
              {ageItems.map((item) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color }} />
                      {item.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '70px', height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: item.color }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
                        {item.count} <span style={{ fontWeight: 500, fontSize: '0.68rem' }}>({pct}%)</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* PROVINCIAL SUMMARY KPI STRIP */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">Total Sisters</div>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>{stats.total}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', background: 'rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', borderRadius: '10px', color: 'var(--primary)', height: 'fit-content' }}>
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">Active Serving</div>
              <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{activeRatePct}%</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: 'var(--success)', height: 'fit-content' }}>
              <MapPin size={20} />
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">In Formation</div>
              <div className="stat-value" style={{ fontSize: '1.4rem', color: '#6366f1' }}>{stats.formation || 0}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', color: '#6366f1', height: 'fit-content' }}>
              <GraduationCap size={20} />
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">Foreign Mission</div>
              <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--info)' }}>{stats.mission || 0}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--info)', height: 'fit-content' }}>
              <ArrowRightLeft size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel main-panel">
          <div className="panel-header">
            <h3>Recent FSIC Obediences</h3>
            <button className="text-btn" onClick={onViewObediences}>View Full Registry <ChevronRight size={14} /></button>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Religious Name</th>
                  <th>Community</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSisters?.length > 0 ? (
                  stats.recentSisters.map((s: any) => (
                    <tr key={s.id}>
                      <td className="font-semibold">
                        <div>{s.religiousName || s.fullName}</div>
                        {s.religiousName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.fullName}</div>}
                      </td>
                      <td>{s.currentCommunity || 'Pending Obedience'}</td>
                      <td>
                        <span className={`badge badge-${
                          s.status === 'Active' ? 'success' : 
                          s.status === 'on Mission' ? 'info' : 
                          s.status === 'in Formation' || s.status === 'Formation' ? 'primary' :
                          s.status === 'Exclaustration' ? 'warning' : 
                          s.status === 'Departure' || s.status === 'Dismissed' ? 'danger' : 
                          'secondary'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No recent records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel side-panel">
          <div className="panel-header">
            <h3>Reminders & Notifications</h3>
          </div>
          <div className="reminder-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active reminders.
              </div>
            ) : (
              notifications.map((n: any) => {
                let icon = <Bell size={20} />;
                let colorClass = 'info';

                if (n.type === 'health') colorClass = 'danger';
                if (n.type === 'warning' || n.type === 'jubilee') colorClass = 'warning';
                if (n.type === 'birthday') {
                  icon = <Calendar size={20} />;
                  colorClass = 'info';
                }
                if (n.type === 'jubilee' || n.type === 'anniversary') {
                  icon = <Calendar size={20} />;
                  if (n.type === 'jubilee') colorClass = 'warning';
                }
                if (n.type === 'transfer') {
                  icon = <ArrowRightLeft size={20} />;
                  colorClass = 'success';
                }

                return (
                  <div key={n.id} className={`reminder-item reminder-${colorClass}`}>
                    {icon}
                    <div className="reminder-content">
                      <p className="reminder-title">{n.title}</p>
                      <p className="reminder-desc">{n.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
