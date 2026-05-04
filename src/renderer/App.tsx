import React, { useState, useEffect } from 'react'
import {
  Users,
  Home,
  Mail,
  MapPin,
  Menu,
  ChevronLeft,
  DollarSign,
  ArrowRightLeft,
  Award
} from 'lucide-react'

// Main Page Components (Moved to components folder)
import SisterDirectory from './components/SisterDirectory'
import Correspondence from './components/Correspondence'
import ObedienceManagement from './components/Obedience/ObedienceManagement'
import CommunityManagement from './components/CommunityManagement'
import Finance from './components/Finance'
import LeadershipManager from './components/Leadership/LeadershipManager'

// Sub Components
import Login from './components/auth/Login'
import Dashboard from './components/dashboard/Dashboard'
import SettingsManager from './components/settings/SettingsManager'
import TopBar from './components/layout/TopBar'
import NavItem from './components/layout/NavItem'
import ToastContainer from './components/layout/ToastContainer'

// Utilities
import { showToast } from './utils/toast'

// Export showToast so it remains accessible if imported from App (though utils/toast is preferred)
export { showToast }

const logoImg = './logo.jpg'

const App = () => {
  const [user, setUser] = useState<any>(null)
  const [view, setView] = useState('dashboard')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, active: 0, mission: 0, retired: 0 })
  const [notifications, setNotifications] = useState([])
  const [isAddingSister, setIsAddingSister] = useState(false)
  const [isAddingCircular, setIsAddingCircular] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (user) {
      // @ts-ignore
      window.api.getDashboardStats().then(setStats)
      // @ts-ignore
      window.api.getNotifications().then(setNotifications)
    }
  }, [user, view])

  const navigateTo = (newView: string, id: string | null = null) => {
    setView(newView)
    setSelectedId(id)
    setIsAddingSister(false)
    setIsAddingCircular(false)
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="app-container">
      <aside className={`sidebar${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className={`logo-container flex items-center gap-2 mb-10${sidebarCollapsed ? ' logo-collapsed' : ''}`}>
          <div className="sidebar-brand-logo">
            <img src={logoImg} alt="Logo" className="brand-image" />
          </div>
          {!sidebarCollapsed && (
            <div className="nav-brand-text">
              <h2>FSIC</h2>
              <span>Sister&apos;s Registry</span>
            </div>
          )}
        </div>
        <nav className="nav-links">
          <NavItem icon={Home} label="Dashboard" active={view === 'dashboard'} onClick={() => navigateTo('dashboard')} collapsed={sidebarCollapsed} />
          <NavItem icon={Users} label="Directory" active={view === 'directory'} onClick={() => navigateTo('directory')} collapsed={sidebarCollapsed} />
          <NavItem icon={ArrowRightLeft} label="Obediences" active={view === 'obediences'} onClick={() => navigateTo('obediences')} collapsed={sidebarCollapsed} />
          <NavItem icon={Mail} label="Correspondence" active={view === 'letters'} onClick={() => navigateTo('letters')} collapsed={sidebarCollapsed} />
          <NavItem icon={MapPin} label="Community Houses" active={view === 'communities'} onClick={() => navigateTo('communities')} collapsed={sidebarCollapsed} />
          <NavItem icon={Award} label="Leadership" active={view === 'leadership'} onClick={() => navigateTo('leadership')} collapsed={sidebarCollapsed} />
          {/* <NavItem icon={DollarSign} label="Finance" active={view === 'finance'} onClick={() => navigateTo('finance')} collapsed={sidebarCollapsed} /> */}
        </nav>
      </aside>

      <main className="main-content">
        <TopBar user={user} onNavigate={navigateTo} onLogout={() => setUser(null)} />

        <div className="content-frame">
          {view === 'dashboard' && (
            <Dashboard
              stats={stats} notifications={notifications} user={user}
              onAddSister={() => { setView('directory'); setIsAddingSister(true); }}
              onAddCircular={() => { setView('letters'); setIsAddingCircular(true); }}
              onViewObediences={() => setView('obediences')}
            />
          )}
          {view === 'directory' && <SisterDirectory initialAddMode={isAddingSister} preSelectedId={selectedId} onModeReset={() => { setIsAddingSister(false); setSelectedId(null); }} />}
          {view === 'letters' && <Correspondence initialUploadMode={isAddingCircular} preSelectedId={selectedId} onModeReset={() => { setIsAddingCircular(false); setSelectedId(null); }} />}
          {view === 'obediences' && <ObedienceManagement />}
          {view === 'communities' && <CommunityManagement preSelectedId={selectedId} onModeReset={() => setSelectedId(null)} />}
          {view === 'leadership' && <LeadershipManager />}
          {view === 'finance' && <Finance />}
          {view === 'settings' && <SettingsManager user={user} onUserUpdate={setUser} />}
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

export default App
