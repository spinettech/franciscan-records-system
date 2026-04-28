import React, { useState, useEffect } from 'react'
import {
  User,
  Lock,
  Database,
  Monitor,
  Save,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Palette,
  CloudLightning,
  ChevronRight,
  Server
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

  useEffect(() => {
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
    { id: 'profile', label: 'My Profile', desc: 'Personal details', icon: User },
    { id: 'security', label: 'Security', desc: 'Password & access', icon: Lock },
    { id: 'preferences', label: 'Preferences', desc: 'App appearance', icon: Palette },
    { id: 'database', label: 'Data & Backup', desc: 'Storage management', icon: Server },
    { id: 'updates', label: 'System Updates', desc: 'Software versions', icon: CloudLightning },
  ]

  return (
    <div className="animate-fade-in p-8" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2rem', minHeight: '85vh' }}>

      {/* Sidebar Navigation */}
      <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.2)' }}>
            {user.fullName?.[0]}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>{user.fullName}</h2>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role} Admin</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Settings Menu</h4>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`ripple ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-main)',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: '12px',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(var(--primary-rgb), 0.05)',
                  color: isActive ? 'white' : 'var(--primary)'
                }}>
                  <tab.icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{tab.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: isActive ? 0.8 : 0.6, fontWeight: 600 }}>{tab.desc}</div>
                </div>
                {isActive && <ChevronRight size={18} style={{ opacity: 0.8 }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ flex: 1, padding: '3.5rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative Background Blur */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '16px', color: 'var(--primary)' }}>
                  <User size={32} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>Administrative Profile</h3>
                  <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Manage your personal identity and system credentials.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid gap-8" style={{ maxWidth: '800px' }}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Full Name</label>
                    <input
                      style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                      value={profile.fullName}
                      onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                      required
                      placeholder="e.g. Sister Mary Francis"
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Username</label>
                    <input
                      style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                      value={profile.username}
                      onChange={e => setProfile({ ...profile, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Email Address</label>
                  <input
                    type="email"
                    style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    placeholder="secretary@fsic.org"
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 600 }}>We will use this email for critical notifications and account recovery.</p>
                </div>

                <div className="flex gap-4 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <button type="submit" className="btn btn-primary ripple" style={{ padding: '1rem 2.5rem', borderRadius: '12px' }} disabled={loading}>
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                  <button type="button" className="btn btn-outline" style={{ borderRadius: '12px' }} onClick={() => setProfile({ username: user.username, fullName: user.fullName, email: user.email })}>
                    Discard Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1rem', background: 'rgba(249, 115, 22, 0.05)', borderRadius: '16px', color: 'var(--accent)' }}>
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>Security & Access</h3>
                  <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Ensure your account remains highly secure and protected.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="grid gap-6" style={{ maxWidth: '600px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Password</label>
                  <input
                    type="password"
                    style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={passwords.old}
                    onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Secure Password</label>
                  <input
                    type="password"
                    style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm New Password</label>
                  <input
                    type="password"
                    style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-6">
                  <button type="submit" className="btn ripple" style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, var(--accent), #f97316)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800 }} disabled={loading}>
                    <Lock size={18} /> Update Security Credentials
                  </button>
                  <div className="flex items-center gap-3" style={{ padding: '1rem', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5', fontSize: '0.85rem', color: '#9a3412', fontWeight: 600 }}>
                    <RefreshCw size={16} />
                    Passwords should be at least 8 characters long and contain a mix of letters, numbers, and symbols.
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '16px', color: '#0ea5e9' }}>
                  <Palette size={32} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>System Preferences</h3>
                  <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Personalize your app experience and interface look.</p>
                </div>
              </div>

              <div className="grid gap-6" style={{ maxWidth: '800px' }}>
                <div className="flex justify-between items-center p-6" style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 800, fontSize: '1.1rem' }}>Interface Theme</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Choose your preferred color palette for the application.</p>
                  </div>
                  <div className="flex gap-2 p-1" style={{ background: '#f1f5f9', borderRadius: '12px' }}>
                    <button className="btn btn-sm" style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'var(--primary)', fontWeight: 800, padding: '0.5rem 1rem' }}>Light</button>
                    <button className="btn btn-sm text-muted" style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>Dark</button>
                    <button className="btn btn-sm text-muted" style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>System</button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-6" style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 800, fontSize: '1.1rem' }}>Compact Data Density</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Show more records on screen by reducing whitespace.</p>
                  </div>
                  <div style={{ width: 50, height: 26, background: 'var(--border)', borderRadius: '13px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: 'white', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', color: '#10b981' }}>
                  <Database size={32} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>Data Maintenance</h3>
                  <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Manage automated backups and system data integrity.</p>
                </div>
              </div>

              <div className="grid gap-6" style={{ maxWidth: '800px' }}>
                <div className="flex items-center gap-6 p-6" style={{ background: 'linear-gradient(to right, white, #f8fafc)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '16px', color: '#10b981' }}>
                    <HardDrive size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 900, fontSize: '1.1rem' }}>Automated Daily Backup</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Last successful snapshot: Today, 03:00 AM</p>
                  </div>
                  <button className="btn ripple" onClick={() => showToast('success', 'Backup Initiated', 'Database snapshot is being created.')} style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
                    <RefreshCw size={18} className="text-primary" /> Run Manual Backup
                  </button>
                </div>

                <div className="flex items-center gap-6 p-6" style={{ background: 'linear-gradient(to right, white, #f8fafc)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '16px', color: '#3b82f6' }}>
                    <Server size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 900, fontSize: '1.1rem' }}>Database Optimization</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Re-index local database to drastically improve search performance.</p>
                  </div>
                  <button className="btn ripple" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
                    Optimize Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '16px', color: '#8b5cf6' }}>
                  <CloudLightning size={32} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>System Updates</h3>
                  <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Keep your application updated with the newest features.</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-16 text-center" style={{ background: 'linear-gradient(135deg, #f8fafc, white)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 12px 24px rgba(var(--primary-rgb), 0.3)',
                  marginBottom: '2rem'
                }}>
                  <RefreshCw size={48} className={updateStatus.status === 'checking' || updateStatus.status === 'downloading' ? 'animate-spin' : ''} />
                </div>

                <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--primary)' }}>{updateStatus.message}</h4>
                <p className="text-muted mb-8" style={{ maxWidth: '400px', fontSize: '1.1rem', fontWeight: 500 }}>
                  Franciscan System Version: <strong style={{ color: 'var(--text-main)' }}>v1.0.0</strong><br />
                  {updateStatus.status === 'downloading' && <span style={{ color: 'var(--accent)' }}>Download Progress: {Math.round(updateStatus.progress?.percent || 0)}%</span>}
                </p>

                <div className="flex gap-4">
                  {updateStatus.status === 'downloaded' ? (
                    <button className="btn btn-primary ripple" onClick={handleRestart} style={{ padding: '1.25rem 3rem', borderRadius: '16px', fontSize: '1.1rem', boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.3)' }}>
                      Restart & Install Update Now
                    </button>
                  ) : (
                    <button className="btn btn-primary ripple" onClick={handleCheckUpdates} disabled={updateStatus.status === 'checking' || updateStatus.status === 'downloading'} style={{ padding: '1.25rem 3rem', borderRadius: '16px', fontSize: '1.1rem', boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.3)' }}>
                      {updateStatus.status === 'checking' ? 'Connecting to Server...' : 'Check for Latest Updates'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsManager

