import React, { useState } from 'react'

const logoImg = './logo.jpg'
const francisImg = './francis.jpg'

const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // @ts-ignore
      const res = await window.api.login({ username, password })
      if (res.success) {
        onLogin(res.user)
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError('Connection failed: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card glass-panel no-padding overflow-hidden">
        <div className="login-hero-container">
          <img src={francisImg} alt="St. Francis" className="login-hero-image" />
          <div className="login-logo-overlay">
            <img src={logoImg} alt="FSIC Logo" className="login-logo-image" />
          </div>
        </div>
        
        <div style={{ padding: '3rem 2rem 2rem' }}>
          <div className="logo-section mb-8 text-center">
            <div className="logo-text" style={{ fontSize: '1.75rem' }}>FSIC</div>
            <div className="logo-subtext">FRANCISCAN SISTERS OF THE <br/> IMMACULATE CONCEPTION</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Secretary Username"
                required
              />
            </div>
            <div className="form-group mb-4">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #6b7280)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
            {error && <div className="error-text mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
            <button type="submit" className="btn btn-primary w-full ripple" disabled={loading}>
              {loading ? 'Verifying Credentials...' : 'Sign In'}
            </button>
          </form>
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            FSIC Institutional Records System v1.1.0
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
