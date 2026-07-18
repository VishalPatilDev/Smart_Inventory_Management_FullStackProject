// src/context/ToastContext.jsx
// Global toast notification system.
// Wrap your app in <ToastProvider> and call useToast() anywhere to show a toast.
//
// Usage:
//   const { toast } = useToast()
//   toast.success('Product saved!')
//   toast.error('SKU already exists')
//   toast.warning('Stock below threshold')
//   toast.info('Transfer complete')

import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

// Toast types and their visual config
const TOAST_CONFIG = {
  success: { icon: '✓', bg: 'var(--success)',  text: '#fff', border: '#27833a' },
  error:   { icon: '✕', bg: 'var(--danger)',   text: '#fff', border: '#a82323' },
  warning: { icon: '⚠', bg: 'var(--warning)',  text: '#fff', border: '#c25c00' },
  info:    { icon: 'ℹ', bg: 'var(--info)',     text: '#fff', border: '#1461a0' },
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    // Mark as leaving first (triggers slide-out animation)
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  const addToast = useCallback((type, message, duration = 3500) => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, type, message, leaving: false }])
    // Auto-dismiss after duration
    setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  const toast = {
    success: (msg, dur) => addToast('success', msg, dur),
    error:   (msg, dur) => addToast('error',   msg, dur || 5000), // errors stay longer
    warning: (msg, dur) => addToast('warning', msg, dur),
    info:    (msg, dur) => addToast('info',    msg, dur),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — fixed top-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 360,
          width: '100%',
          pointerEvents: 'none', // let clicks pass through the container
        }}
      >
        {toasts.map(t => {
          const config = TOAST_CONFIG[t.type] || TOAST_CONFIG.info
          return (
            <div
              key={t.id}
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 14px',
                background: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                color: config.text,
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.4,
                pointerEvents: 'all',
                // Slide in from right, slide out to right
                transform: t.leaving ? 'translateX(110%)' : 'translateX(0)',
                opacity: t.leaving ? 0 : 1,
                transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease',
                animation: t.leaving ? 'none' : 'toastIn 0.28s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Icon */}
              <span style={{
                fontSize: 15, fontWeight: 700, flexShrink: 0,
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
              }}>
                {config.icon}
              </span>

              {/* Message */}
              <span style={{ flex: 1 }}>{t.message}</span>

              {/* Close button */}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: config.text,
                  cursor: 'pointer',
                  borderRadius: 4,
                  width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, flexShrink: 0, padding: 0,
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* Keyframe for slide-in */}
      <style>{`
        @keyframes toastIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}