import React from 'react'
import { Users, Mail, MapPin, ArrowRightLeft, Heart, Plus, ChevronRight, Bell, Calendar, Award, BookOpen } from 'lucide-react'

const Dashboard = ({ stats, notifications, user, onAddSister, onAddCircular, onViewObediences }: any) => (
  <div className="animate-fade-in">
    <header className="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.fullName || 'Sister Secretary'}. Pax et Bonum!</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-secondary ripple" onClick={onAddSister}><Plus size={18} /> New Profile</button>
        <button className="btn btn-primary ripple" onClick={onAddCircular}><Mail size={18} /> New Circular</button>
      </div>
    </header>

    <div className="stats-grid">
      <div className="stat-card">
        <div className="flex justify-between items-start">
          <div>
            <div className="stat-label">Total Sisters</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', borderRadius: '12px', color: 'var(--primary)', height: 'fit-content' }}>
            <Users size={24} />
          </div>
        </div>
        <div className="stat-trend positive">Central Registry</div>
      </div>
      <div className="stat-card">
        <div className="flex justify-between items-start">
          <div>
            <div className="stat-label">Active</div>
            <div className="stat-value">{stats.active}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)', height: 'fit-content' }}>
            <MapPin size={24} />
          </div>
        </div>
        <div className="stat-trend positive">Serving Communities</div>
      </div>
      <div className="stat-card">
        <div className="flex justify-between items-start">
          <div>
            <div className="stat-label">Foreign Mission</div>
            <div className="stat-value">{stats.mission}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--info)', height: 'fit-content' }}>
            <ArrowRightLeft size={24} />
          </div>
        </div>
        <div className="stat-trend info">Cross-border missions</div>
      </div>
      <div className="stat-card">
        <div className="flex justify-between items-start">
          <div>
            <div className="stat-label">Exclaustration</div>
            <div className="stat-value">{stats.exclaustration}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)', height: 'fit-content' }}>
            <Heart size={24} />
          </div>
        </div>
        <div className="stat-trend warning">On Leave of Absence</div>
      </div>
      <div className="stat-card">
        <div className="flex justify-between items-start">
          <div>
            <div className="stat-label">Finally Professed</div>
            <div className="stat-value">{stats.finallyProfessed}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6', height: 'fit-content' }}>
            <Award size={24} />
          </div>
        </div>
        <div className="stat-trend info">Perpetual Vows</div>
      </div>
      <div className="stat-card">
        <div className="flex justify-between items-start">
          <div>
            <div className="stat-label">Temporary Vows</div>
            <div className="stat-value">{stats.notFinallyProfessed}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px', color: '#0ea5e9', height: 'fit-content' }}>
            <BookOpen size={24} />
          </div>
        </div>
        <div className="stat-trend info">Initial Formation</div>
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
                <th>Sister Name</th>
                <th>Community</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSisters?.length > 0 ? (
                stats.recentSisters.map((s: any) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.fullName}</td>
                    <td>{s.currentCommunity || 'Pending Obedience'}</td>
                    <td>
                      <span className={`badge badge-${
                        s.status === 'Active' ? 'success' : 
                        s.status === 'on Mission' ? 'info' : 
                        s.status === 'Exclaustration' ? 'warning' : 
                        s.status === 'Dismissed' ? 'danger' : 
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

export default Dashboard
