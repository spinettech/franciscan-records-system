import React, { useState } from 'react'
import { 
  Settings, 
  ShieldAlert, 
  User, 
  Lock, 
  Bell, 
  Database, 
  Monitor, 
  Save, 
  RefreshCw,
  LogOut,
  ChevronRight,
  UserCheck,
  HardDrive
} from 'lucide-react'
import { showToast } from '../../utils/toast'

const SettingsManager = ({ user, onUserUpdate }: { user: any, onUserUpdate: (u: any) => void }) => {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    username: user.username || '',
    fullName: user.fullName || '',
    email: user.email || ''
  })
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<any>({ status: 'idle', message: 'System is ready.' })

  React.useEffect(() => {
    // @ts-ignore
    window.api.onUpdateStatus((data: any) => {
      setUpdateStatus(data)
    })
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // @ts-ignore
      await window.api.updateUser(user.id, profile)
      onUserUpdate({ ...user, ...profile })
      showToast('success', 'Profile Updated', 'Your administrative information has been updated.')
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      showToast('error', 'Match Error', 'New passwords do not match.')
      return
    }
    setLoading(true)
    try {
      // @ts-ignore
      const res = await window.api.changePassword(user.id, passwords.old, passwords.new)
      if (res.success) {
        showToast('success', 'Security Updated', 'Your password has been changed successfully.')
        setPasswords({ old: '', new: '', confirm: '' })
      } else {
        showToast('error', 'Update Failed', res.message)
      }
    } catch (err: any) {
      showToast('error', 'Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckUpdates = () => {
    // @ts-ignore
    window.api.checkForUpdates()
  }

  const handleRestart = () => {
    // @ts-ignore
    window.api.quitAndInstall()
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
    { id: 'database', label: 'Backup & Data', icon: Database },
    { id: 'updates', label: 'Updates', icon: RefreshCw },
  ]

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>System Configuration</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Personalize your experience and manage provincial security.</p>
        </div>
        <div className="flex items-center gap-4" style={{ marginBottom: '0.5rem' }}>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{user.fullName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{user.role?.toUpperCase()}</div>
           </div>
           <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
             {user.fullName?.[0]}
           </div>
        </div>
      </header>

      {/* Top Tabs Navigation */}
      <div className="glass-panel" style={{ padding: '0.5rem', marginBottom: '2.5rem', display: 'flex', gap: '0.5rem', background: 'white' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="main-panel">
        {activeTab === 'profile' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '3rem' }}>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>Administrative Profile</h3>
                <p className="text-muted">This information is used for identification within the registry.</p>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '16px' }}>
                <User size={32} className="text-primary" />
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="grid gap-8">
              <div className="grid grid-2">
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Administrative Name</label>
                  <input 
                    style={{ marginTop: '0.5rem' }}
                    value={profile.fullName} 
                    onChange={e => setProfile({...profile, fullName: e.target.value})} 
                    required 
                    placeholder="e.g. FSIC Provincial Secretary"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Username</label>
                  <input 
                    style={{ marginTop: '0.5rem' }}
                    value={profile.username} 
                    onChange={e => setProfile({...profile, username: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Email Address</label>
                <input 
                  type="email" 
                  style={{ marginTop: '0.5rem' }}
                  value={profile.email} 
                  onChange={e => setProfile({...profile, email: e.target.value})} 
                  placeholder="secretary@fsic.org"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Used for notifications and account recovery.</p>
              </div>

              <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                 <button type="submit" className="btn btn-primary ripple" style={{ padding: '1rem 2rem' }} disabled={loading}>
                   <Save size={18} /> {loading ? 'Saving...' : 'Update Profile Information'}
                 </button>
                 <button type="button" className="btn btn-outline" onClick={() => setProfile({ username: user.username, fullName: user.fullName, email: user.email })}>
                   Reset Changes
                 </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '3rem' }}>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>Security & Access</h3>
                <p className="text-muted">Ensure your account remains protected with a strong password.</p>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(249, 115, 22, 0.05)', borderRadius: '16px' }}>
                <Lock size={32} style={{ color: 'var(--accent)' }} />
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="grid gap-6" style={{ maxWidth: '600px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Password</label>
                <input 
                  type="password" 
                  style={{ marginTop: '0.5rem' }}
                  value={passwords.old} 
                  onChange={e => setPasswords({...passwords, old: e.target.value})} 
                  required 
                />
              </div>
              
              <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Secret Password</label>
                <input 
                  type="password" 
                  style={{ marginTop: '0.5rem' }}
                  value={passwords.new} 
                  onChange={e => setPasswords({...passwords, new: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  style={{ marginTop: '0.5rem' }}
                  value={passwords.confirm} 
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-4" style={{ marginTop: '1.5rem' }}>
                 <button type="submit" className="btn btn-primary ripple" style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, var(--accent), #f97316)', border: 'none' }} disabled={loading}>
                   <ShieldAlert size={18} /> Update Security Credentials
                 </button>
                 <div className="flex items-center gap-3" style={{ padding: '1rem', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5', fontSize: '0.85rem', color: '#9a3412' }}>
                    <RefreshCw size={16} />
                    Passwords must be at least 8 characters long and contain symbols.
                 </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '3rem' }}>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>System Preferences</h3>
             <p className="text-muted mb-10">Customize the look and behavior of the registry application.</p>
             
             <div className="grid gap-10">
                <div className="flex justify-between items-center">
                   <div>
                      <h4 style={{ margin: 0, fontWeight: 800 }}>Interface Theme</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Switch between light, dark, and system modes.</p>
                   </div>
                   <div className="flex gap-2 p-1 background-muted" style={{ background: '#f1f5f9', borderRadius: '12px' }}>
                      <button className="btn btn-sm" style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Light</button>
                      <button className="btn btn-sm text-muted">Dark</button>
                      <button className="btn btn-sm text-muted">System</button>
                   </div>
                </div>

                <div className="flex justify-between items-center">
                   <div>
                      <h4 style={{ margin: 0, fontWeight: 800 }}>Compact Mode</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Show more records on screen with reduced spacing.</p>
                   </div>
                   <div style={{ width: 50, height: 26, background: 'var(--border)', borderRadius: '13px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: 'white', borderRadius: '50%' }} />
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'database' && (
           <div className="glass-panel animate-fade-in" style={{ padding: '3rem' }}>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>Data Maintenance</h3>
             <p className="text-muted mb-10">Manage database backups and system integrity.</p>

             <div className="grid gap-6">
                <div className="flex items-center gap-6 p-6" style={{ background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                   <div style={{ padding: '1rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                      <HardDrive size={32} className="text-primary" />
                   </div>
                   <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontWeight: 800 }}>Daily Backup Strategy</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last backup completed: Today, 03:00 AM</p>
                   </div>
                   <button className="btn btn-outline" onClick={() => showToast('success', 'Backup Initiated', 'Database snapshot is being created.')}>
                      <RefreshCw size={18} /> Run Manual Backup
                   </button>
                </div>

                <div className="flex items-center gap-6 p-6" style={{ background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                   <div style={{ padding: '1rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                      <Database size={32} className="text-accent" />
                   </div>
                   <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontWeight: 800 }}>Optimization & Indexing</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Re-index database to improve search performance.</p>
                   </div>
                   <button className="btn btn-outline">
                      Optimize Now
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'updates' && (
           <div className="glass-panel animate-fade-in" style={{ padding: '3rem' }}>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>System Updates</h3>
             <p className="text-muted mb-10">Keep the FSIC Records System updated with the latest features and security patches.</p>

             <div className="flex flex-col items-center justify-center py-10 text-center" style={{ background: 'rgba(var(--primary-rgb), 0.02)', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '24px', 
                  background: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--primary)',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '1.5rem'
                }}>
                  <RefreshCw size={40} className={updateStatus.status === 'checking' || updateStatus.status === 'downloading' ? 'animate-spin' : ''} />
                </div>
                
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{updateStatus.message}</h4>
                <p className="text-muted mb-8" style={{ maxWidth: '400px' }}>
                  Current Version: v1.0.0<br/>
                  {updateStatus.status === 'downloading' && `Progress: ${Math.round(updateStatus.progress?.percent || 0)}%`}
                </p>

                <div className="flex gap-4">
                  {updateStatus.status === 'downloaded' ? (
                    <button className="btn btn-primary ripple" onClick={handleRestart} style={{ padding: '1rem 2.5rem' }}>
                      Restart and Install Update
                    </button>
                  ) : (
                    <button className="btn btn-primary ripple" onClick={handleCheckUpdates} disabled={updateStatus.status === 'checking' || updateStatus.status === 'downloading'} style={{ padding: '1rem 2.5rem' }}>
                      {updateStatus.status === 'checking' ? 'Checking...' : 'Check for Updates'}
                    </button>
                  )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsManager
