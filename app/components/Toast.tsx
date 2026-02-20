'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  message: string
  title?: string
  type: ToastType
}

const configs = {
  success: {
    bg: 'bg-[#071a09]',
    border: 'border-green-500/25',
    iconBg: 'bg-green-500/15',
    iconColor: 'text-green-400',
    titleColor: 'text-green-300',
    bar: 'bg-green-500',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  },
  error: {
    bg: 'bg-[#1a0707]',
    border: 'border-red-500/25',
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
    bar: 'bg-red-500',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  },
  warning: {
    bg: 'bg-[#1a1207]',
    border: 'border-yellow-500/25',
    iconBg: 'bg-yellow-500/15',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-300',
    bar: 'bg-yellow-500',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  },
  info: {
    bg: 'bg-[#07091a]',
    border: 'border-purple-500/25',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    titleColor: 'text-purple-300',
    bar: 'bg-purple-500',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
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
    <div className={`
      relative overflow-hidden rounded-2xl border ${c.bg} ${c.border}
      shadow-2xl shadow-black/60 backdrop-blur-md
      min-w-[300px] max-w-[360px] w-full
      transform transition-all duration-350 ease-out
      ${visible && !leaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'}
    `}>
      {/* animated progress bar */}
      <div className={`absolute top-0 left-0 h-[2px] ${c.bar} opacity-70`}
        style={{ animation: 'toast-shrink 4.5s linear forwards' }} />

      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${c.iconBg} ${c.iconColor}`}>
          {c.icon}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && <p className={`font-bold text-sm mb-0.5 ${c.titleColor}`}>{toast.title}</p>}
          <p className="text-zinc-300 text-sm leading-snug">{toast.message}</p>
        </div>
        <button onClick={close} className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = (message: string, type: ToastType = 'info', title?: string) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, title }])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const toast = {
    success: (message: string, title?: string) => showToast(message, 'success', title),
    error: (message: string, title?: string) => showToast(message, 'error', title),
    warning: (message: string, title?: string) => showToast(message, 'warning', title),
    info: (message: string, title?: string) => showToast(message, 'info', title),
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onRemove={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  )

  return { toast, ToastContainer }
}

// Legacy default export for backward compat
export default function Toast({ message, type = 'info', onClose }: { message: string; type?: ToastType; duration?: number; onClose?: () => void }) {
  const c = configs[type]
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(() => onClose?.(), 300) }, 3000)
    return () => clearTimeout(t)
  }, [])

  return visible ? (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 ${c.bg} border ${c.border} px-5 py-4 rounded-2xl shadow-2xl`}>
      <div className={`${c.iconBg} ${c.iconColor} w-8 h-8 rounded-xl flex items-center justify-center`}>{c.icon}</div>
      <p className="text-white text-sm font-medium">{message}</p>
    </div>
  ) : null
}
