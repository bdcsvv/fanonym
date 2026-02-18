'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/app/lib/supabase'
import NotificationBadge from './NotificationBadge'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

const NOTIF_ICONS: Record<string, { icon: string; bg: string }> = {
  chat_new: { icon: '💬', bg: 'bg-purple-500/20' },
  chat_accepted: { icon: '✅', bg: 'bg-green-500/20' },
  chat_expired: { icon: '⏰', bg: 'bg-yellow-500/20' },
  payment_request: { icon: '💰', bg: 'bg-orange-500/20' },
  payment_received: { icon: '💸', bg: 'bg-green-500/20' },
  topup_approved: { icon: '✅', bg: 'bg-green-500/20' },
  topup_rejected: { icon: '❌', bg: 'bg-red-500/20' },
  withdraw_success: { icon: '🏦', bg: 'bg-green-500/20' },
  withdraw_rejected: { icon: '❌', bg: 'bg-red-500/20' },
  free_chat: { icon: '📨', bg: 'bg-blue-500/20' },
  rating_received: { icon: '⭐', bg: 'bg-yellow-500/20' },
  verification_approved: { icon: '🎉', bg: 'bg-green-500/20' },
  verification_rejected: { icon: '😔', bg: 'bg-red-500/20' },
  default: { icon: '🔔', bg: 'bg-zinc-500/20' },
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Fetch notifications
  useEffect(() => {
    if (!userId) return

    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      setNotifications(data || [])
      setLoading(false)
    }

    fetchNotifs()

    // Real-time subscription
    const channel = supabase
      .channel(`notifs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notif.id)

      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
    }

    if (notif.link) {
      window.location.href = notif.link
    }
    setShowDropdown(false)
  }

  const getIcon = (type: string) => NOTIF_ICONS[type] || NOTIF_ICONS.default

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins} mnt lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    const days = Math.floor(hours / 24)
    return `${days} hari lalu`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-zinc-800/50 rounded-full transition-all"
      >
        <svg className="w-6 h-6 text-zinc-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <NotificationBadge count={unreadCount} size="sm" color="red" />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3 border-b border-zinc-700 flex justify-between items-center">
            <h4 className="font-semibold text-sm">Notifikasi</h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Tandai semua dibaca
                </button>
              )}
              <button onClick={() => setShowDropdown(false)} className="text-zinc-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center">
                <svg className="animate-spin w-6 h-6 text-purple-400 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <span className="text-3xl block mb-2">🔔</span>
                <p className="text-zinc-500 text-sm">Belum ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {notifications.map(notif => {
                  const { icon, bg } = getIcon(notif.type)
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`p-3 hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                        !notif.is_read ? 'bg-purple-500/5 border-l-2 border-purple-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                          <span className="text-sm">{icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notif.is_read ? 'text-white font-medium' : 'text-zinc-300'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5 truncate">{notif.message}</p>
                          <p className="text-xs text-zinc-600 mt-1">{timeAgo(notif.created_at)}</p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
