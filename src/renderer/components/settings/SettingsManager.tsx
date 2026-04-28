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
  Server,
  Briefcase,
  Trash2,
  Plus
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
  const [apostolates, setApostolates] = useState<any[]>([])
  const [newApostolate, setNewApostolate] = useState('')

  useEffect(() => {
    // @ts-ignore
    window.api.onUpdateStatus((data: any) => {
      setUpdateStatus(data)
      if (data.status === 'error') {
        showToast('error', 'Update Error', data.message || 'Failed to check for updates.')
      } else if (data.status === 'downloaded') {
        showToast('success', 'Update Ready', 'A new version has been downloaded and is ready to install.')
      }
    })

    fetchApostolates()
  }, [])

  const fetchApostolates = async () => {
    try {
      // @ts-ignore
      const data = await window.api.getApostolates()
      setApostolates(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddApostolate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newApostolate.trim()) return
    setLoading(true)
    try {
      // @ts-ignore
      await window.api.upsertApostolate(null, newApostolate.trim())
      setNewApostolate('')
      fetchApostolates()
      showToast('success', 'Apostolate Added', 'The new category has been added to the registry.')
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message || 'Could not add apostolate.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteApostolate = async (id: string) => {
    if (!confirm('Permanently remove this apostolate type? This will not affect existing records but will remove it from future selections.')) return
    try {
      // @ts-ignore
      await window.api.deleteApostolate(id)
      fetchApostolates()
      showToast('success', 'Apostolate Removed', 'The category has been deleted.')
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message)
    }
  }

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
    { id: 'apostolates', label: 'Apostolates', desc: 'Ministry categories', icon: Briefcase },
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

          {activeTab === 'apostolates' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '16px', color: 'var(--primary)' }}>
                  <Briefcase size={32} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>Ministry & Apostolates</h3>
                  <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Manage the list of apostolate types used across the system.</p>
                </div>
              </div>

              <div style={{ maxWidth: '800px' }}>
                <form onSubmit={handleAddApostolate} className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'rgba(var(--primary-rgb), 0.02)', border: '1px dashed var(--border)' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add New Apostolate Type</label>
                  <div className="flex gap-3 mt-3">
                    <input 
                      style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'white' }}
                      value={newApostolate}
                      onChange={e => setNewApostolate(e.target.value)}
                      placeholder="e.g. Education, Health Care, Social Work..."
                    />
                    <button type="submit" className="btn btn-primary ripple" style={{ borderRadius: '12px', padding: '0 2rem' }} disabled={loading}>
                      <Plus size={18} /> Add Category
                    </button>
                  </div>
                </form>

                <div className="grid gap-3">
                  {apostolates.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '20px', color: 'var(--text-muted)' }}>
                      No apostolates defined. Use the form above to add one.
                    </div>
                  ) : apostolates.map(ap => (
                    <div key={ap.id} className="flex items-center justify-between p-4" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.05)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Briefcase size={18} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>{ap.name}</span>
                      </div>
                      <button 
                        className="icon-btn text-danger ripple" 
                        onClick={() => handleDeleteApostolate(ap.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.05)', width: '38px', height: '38px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
                  <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Maintain peak performance with the latest software patches.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                {/* Left Side: Status Card */}
                <div className="glass-panel" style={{ 
                  padding: '3rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.5))',
                  border: '1px solid var(--border)',
                  minHeight: '450px'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '35px',
                    background: updateStatus.status === 'error' 
                      ? 'linear-gradient(135deg, #ef4444, #b91c1c)' 
                      : (updateStatus.status === 'downloaded' ? 'linear-gradient(135deg, #10b981, #047857)' : 'linear-gradient(135deg, var(--primary), #6366f1)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: updateStatus.status === 'error' 
                      ? '0 20px 40px rgba(239, 68, 68, 0.25)' 
                      : (updateStatus.status === 'downloaded' ? '0 20px 40px rgba(16, 185, 129, 0.25)' : '0 20px 40px rgba(var(--primary-rgb), 0.25)'),
                    marginBottom: '2.5rem',
                    position: 'relative'
                  }}>
                    <RefreshCw size={56} className={updateStatus.status === 'checking' || updateStatus.status === 'downloading' ? 'animate-spin' : ''} />
                    {updateStatus.status === 'downloaded' && (
                      <div style={{ position: 'absolute', top: -10, right: -10, background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900, border: '4px solid white' }}>READY</div>
                    )}
                  </div>

                  <h4 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 900, 
                    marginBottom: '0.75rem', 
                    color: updateStatus.status === 'error' ? '#ef4444' : 'var(--primary)',
                    letterSpacing: '-0.02em'
                  }}>
                    {updateStatus.message}
                  </h4>
                  
                  <div className="flex flex-col items-center gap-2 mb-10">
                    <div style={{ padding: '0.5rem 1.25rem', background: '#f1f5f9', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Current Version: <span style={{ color: 'var(--primary)' }}>v1.0.0</span>
                    </div>
                    {updateStatus.status === 'downloading' && (
                      <div style={{ width: '100%', maxWidth: '280px', marginTop: '1rem' }}>
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${updateStatus.progress?.percent || 0}%`, 
                            background: 'var(--accent)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'between', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)' }}>
                          <span>DOWNLOADING...</span>
                          <span style={{ marginLeft: 'auto' }}>{Math.round(updateStatus.progress?.percent || 0)}%</span>
                        </div>
                      </div>
                    )}
                    {updateStatus.status === 'error' && updateStatus.error && (
                      <div style={{ maxWidth: '300px', marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
                        {updateStatus.error}
                      </div>
                    )}
                  </div>

                  <div className="w-full flex gap-4 justify-center">
                    {updateStatus.status === 'downloaded' ? (
                      <button className="btn btn-primary ripple" onClick={handleRestart} style={{ padding: '1.25rem 3rem', borderRadius: '20px', fontSize: '1.05rem', fontWeight: 900, width: '100%', boxShadow: '0 10px 20px rgba(var(--primary-rgb), 0.2)' }}>
                        Install Update & Restart
                      </button>
                    ) : (
                      <button className="btn btn-primary ripple" onClick={handleCheckUpdates} disabled={updateStatus.status === 'checking' || updateStatus.status === 'downloading'} style={{ padding: '1.25rem 3rem', borderRadius: '20px', fontSize: '1.05rem', fontWeight: 900, width: '100%', boxShadow: '0 10px 20px rgba(var(--primary-rgb), 0.2)' }}>
                        {updateStatus.status === 'checking' ? 'Establishing Connection...' : 'Check for System Updates'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Release Notes / History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '2rem', flex: 1, border: '1px solid var(--border)' }}>
                    <h5 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>
                      <RefreshCw size={20} className="text-accent" /> Recent Version History
                    </h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { version: 'v1.0.0', date: 'Initial Release', note: 'Standard deployment of the FSIC Records System.' },
                        { version: 'v0.9.8', date: 'Beta Stable', note: 'Added Sister Profiles and Basic Financial Tracking.' },
                        { version: 'v0.9.5', date: 'Core Alpha', note: 'Database architecture and schema optimization.' }
                      ].map((v, i) => (
                        <div key={i} style={{ padding: '1rem', background: i === 0 ? 'rgba(var(--primary-rgb), 0.03)' : 'transparent', borderRadius: '16px', border: i === 0 ? '1px solid rgba(var(--primary-rgb), 0.1)' : '1px dashed var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: i === 0 ? 'var(--primary)' : 'var(--text-main)' }}>{v.version}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{v.date}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{v.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem 2rem', border: '1px solid var(--border)', background: 'linear-gradient(to right, #fff7ed, white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <ShieldCheck size={24} style={{ color: 'var(--accent)' }} />
                      <div>
                        <h6 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>Auto-Update Status</h6>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Automatic background checks are active.</p>
                      </div>
                      <div style={{ marginLeft: 'auto', width: '40px', height: '22px', background: 'var(--accent)', borderRadius: '11px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 3, right: 3, width: 16, height: 16, background: 'white', borderRadius: '50%' }} />
                      </div>
                    </div>
                  </div>
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

