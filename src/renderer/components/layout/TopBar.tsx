import React, { useState, useEffect, useRef } from 'react'
import { Search, Bell, ChevronDown, Settings, LogOut, Users, MapPin, FileText, Loader2 } from 'lucide-react'

const TopBar = ({ user, onNavigate, onLogout }: any) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true)
        try {
          // @ts-ignore
          const data = await window.api.globalSearch(query)
          setResults(data)
          setShowResults(true)
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults(null)
        setShowResults(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const handleResultClick = (view: string, id: string | null = null) => {
    onNavigate(view, id)
    setShowResults(false)
    setQuery('')
  }

  const hasResults = results && (results.sisters.length > 0 || results.communities.length > 0 || results.documents.length > 0)

  return (
    <div className="top-bar-wrap">
      <div className="top-bar-content glass-panel no-padding">
        <div className="top-bar-inner">
          <div className="search-field" ref={searchRef} style={{ flex: 1, borderRight: '1px solid var(--border)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            {loading ? <Loader2 size={18} className="text-primary animate-spin" /> : <Search size={18} className="text-muted" />}
            <input 
              type="text" 
              placeholder="Search sisters, communities, or records..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 600 }} 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowResults(true)}
            />

            {showResults && (
              <div className="global-results-dropdown glass-panel no-padding animate-slide-up" style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: '1rem',
                right: '1rem',
                maxHeight: '450px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
                padding: '1rem'
              }}>
                {!hasResults ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>No records found for "{query}"</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Try a different name or category.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {results.sisters.length > 0 && (
                      <section>
                        <h6 style={{ margin: '0 0 0.5rem 0', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Congregation Sisters</h6>
                        <div className="flex flex-col gap-1">
                          {results.sisters.map((s: any) => (
                            <div key={s.id} className="search-result-item ripple" onClick={() => handleResultClick('directory', s.id)}>
                              {s.passportPhoto ? (
                                <div 
                                  className="result-icon" 
                                  style={{ 
                                    backgroundImage: `url("${s.passportPhoto}")`, 
                                    backgroundSize: 'cover', 
                                    backgroundPosition: 'center' 
                                  }} 
                                />
                              ) : (
                                <div className="result-icon bg-primary-soft text-primary">
                                  <Users size={14} />
                                </div>
                              )}
                              <div className="result-info">
                                <span className="result-title">{s.religiousName || s.fullName}</span>
                                {s.religiousName && <span className="result-subtitle">{s.fullName}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {results.communities.length > 0 && (
                      <section>
                        <h6 style={{ margin: '0 0 0.5rem 0', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Communities & Houses</h6>
                        <div className="flex flex-col gap-1">
                          {results.communities.map((c: any) => (
                            <div key={c.id} className="search-result-item ripple" onClick={() => handleResultClick('communities', c.id)}>
                              <div className="result-icon bg-accent-soft text-accent"><MapPin size={14} /></div>
                              <div className="result-info">
                                <span className="result-title">{c.name}</span>
                                <span className="result-subtitle">{c.location}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {results.documents.length > 0 && (
                      <section>
                        <h6 style={{ margin: '0 0 0.5rem 0', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Records</h6>
                        <div className="flex flex-col gap-1">
                          {results.documents.map((d: any) => (
                            <div 
                              key={d.id} 
                              className="search-result-item ripple" 
                              onClick={() => {
                                if (d.sisterId) handleResultClick('directory', d.sisterId);
                                else if (d.reportId) handleResultClick('communities', d.reportId);
                                else handleResultClick('letters', d.title);
                              }}
                            >
                              <div className="result-icon bg-secondary-soft text-secondary"><FileText size={14} /></div>
                              <div className="result-info">
                                <span className="result-title">{d.title}</span>
                                <span className="result-subtitle">{d.subtitle}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            )}
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
