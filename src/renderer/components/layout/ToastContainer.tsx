import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X as XIcon } from 'lucide-react'

type ToastItem = { id: number; type: string; title: string; message: string; leaving: boolean }

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (e: any) => {
      const { type = 'info', title = '', message = '' } = e.detail
      const id = Date.now() + Math.random()
      setToasts(prev => [...prev, { id, type, title, message, leaving: false }])

      // Auto-dismiss after 4.5 s (matches progress bar)
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320)
      }, 4500)
    }
    window.addEventListener('fsic-toast', handler)
    return () => window.removeEventListener('fsic-toast', handler)
  }, [])

  const dismiss = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320)
  }

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={18} />,
    error:   <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info:    <Info size={18} />,
  }

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}${t.leaving ? ' toast-leaving' : ''}`}>
          <div className="toast-icon">{icons[t.type]}</div>
          <div className="toast-body">
            {t.title   && <div className="toast-title">{t.title}</div>}
            {t.message && <div className="toast-message">{t.message}</div>}
          </div>
          <button className="toast-close" onClick={() => dismiss(t.id)}>
            <XIcon size={14} />
          </button>
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
