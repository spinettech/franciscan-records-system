import React, { useState } from 'react'
import { Search, Bell, ChevronDown, Settings, LogOut } from 'lucide-react'

const TopBar = ({ user, onNavigate, onLogout }: any) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <div className="top-bar-wrap">
      <div className="top-bar-content glass-panel no-padding">
        <div className="top-bar-inner">
          <div className="search-field" style={{ flex: 1, borderRight: '1px solid var(--border)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Global system search..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
          </div>
          
          <div className="flex items-center gap-6 px-6">
            <div className="notification-icon ripple">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </div>
            
            <div className="top-user-pill ripple" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="user-avatar-small">
                {user.fullName?.[0] || user.username?.[0]}
              </div>
              <div className="user-details-mini">
                <span className="user-name-mini">{user.fullName || user.username}</span>
                <span className="user-role-mini">{user.role.toUpperCase()}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />

              {dropdownOpen && (
                <div className="user-dropdown animate-fade-in glass-panel no-padding" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-info">
                    <strong>{user.fullName}</strong>
                    <span>{user.email || 'No email set'}</span>
                  </div>
                  <div className="dropdown-links">
                    <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); onNavigate('settings'); setDropdownOpen(false); }}>
                      <Settings size={16} /> My Settings
                    </div>
                    <div className="dropdown-item text-danger" onClick={(e) => { e.stopPropagation(); onLogout(); }}>
                      <LogOut size={16} /> Sign Out
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar
