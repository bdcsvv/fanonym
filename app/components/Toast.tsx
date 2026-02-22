'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  message: string
  title?: string
  type: ToastType
}

const configs = {
  success: {
    bg: '#071a09',
    border: 'rgba(74,222,128,0.2)',
    iconBg: 'rgba(74,222,128,0.12)',
    iconColor: '#4ade80',
    titleColor: '#86efac',
    barColor: '#4ade80',
    icon: '✓',
  },
  error: {
    bg: '#1a0707',
    border: 'rgba(248,113,113,0.2)',
    iconBg: 'rgba(248,113,113,0.12)',
    iconColor: '#f87171',
    titleColor: '#fca5a5',
    barColor: '#f87171',
    icon: '✕',
  },
  warning: {
    bg: '#1a1207',
    border: 'rgba(251,191,36,0.2)',
    iconBg: 'rgba(251,191,36,0.12)',
    iconColor: '#fbbf24',
    titleColor: '#fde68a',
    barColor: '#fbbf24',
    icon: '!',
  },
  info: {
    bg: '#07091a',
    border: 'rgba(167,139,250,0.2)',
    iconBg: 'rgba(167,139,250,0.12)',
    iconColor: '#a78bfa',
    titleColor: '#c4b5fd',
    barColor: '#6700e8',
    icon: 'i',
  },
}

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const c = configs[toast.type]

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 20)
    const hide = setTimeout(() => {
      setLeaving(true)
      setTimeout(onRemove, 350)
    }, 4500)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  const close = () => {
    setLeaving(true)
    setTimeout(onRemove, 350)
  }

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '16px',
        minWidth: '300px',
        maxWidth: '360px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.97)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Progress bar */}
      <div style={{
        height: '2px',
        background: c.barColor,
        opacity: 0.7,
        animation: 'toast-shrink 4.5s linear forwards',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px' }}>
        {/* Icon */}
        <div style={{
          flexShrink: 0,
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: c.iconBg,
          color: c.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '900',
          fontStyle: toast.type === 'info' ? 'italic' : 'normal',
        }}>
          {c.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
          {toast.title && (
            <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: c.titleColor }}>
              {toast.title}
            </p>
          )}
          <p style={{ margin: 0, fontSize: '13px', color: '#9898b8', lineHeight: '1.5' }}>
            {toast.message}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={close}
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            color: '#3a3a5a',
            cursor: 'pointer',
            padding: '2px',
            fontSize: '16px',
            lineHeight: 1,
            marginTop: '2px',
          }}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  // Track active toast keys to prevent spam across re-renders
  const activeToastKeys = useRef<Set<string>>(new Set())

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const key = `${type}:${message}`
    // If this exact toast is already showing, skip
    if (activeToastKeys.current.has(key)) return
    activeToastKeys.current.add(key)
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, title }])
    // Remove key after toast disappears (4.5s display + 350ms animation)
    setTimeout(() => {
      activeToastKeys.current.delete(key)
    }, 5000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useMemo(() => ({
    success: (message: string, title?: string) => showToast(message, 'success', title),
    error: (message: string, title?: string) => showToast(message, 'error', title),
    warning: (message: string, title?: string) => showToast(message, 'warning', title),
    info: (message: string, title?: string) => showToast(message, 'info', title),
  }), [showToast])

  const ToastContainer = useMemo(() => () => (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastCard toast={t} onRemove={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  ), [toasts, removeToast])

  return { toast, ToastContainer }
}

// Legacy default export
export default function Toast({ message, type = 'info', onClose }: {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}) {
  const c = configs[type]
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(() => onClose?.(), 300) }, 3000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '14px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    }}>
      <span style={{ color: c.iconColor, fontWeight: 900, fontSize: '14px' }}>{c.icon}</span>
      <p style={{ margin: 0, color: '#e0e0f0', fontSize: '14px' }}>{message}</p>
    </div>
  )
}
