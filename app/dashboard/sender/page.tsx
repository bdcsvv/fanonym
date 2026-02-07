'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FanonymLoader from '@/app/components/FanonymLoader'

const KREDIT_TO_IDR = 10000

export default function SenderDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [pendingChats, setPendingChats] = useState<any[]>([])
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [expiredChats, setExpiredChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'expired'>('active')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: creditsData } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const { data: chatsData, error: chatsError } = await supabase
        .from('chat_sessions')
        .select('*, creator:creator_id(id, username, full_name, avatar_url), messages(id, sender_id, created_at)')
        .eq('sender_id', profileData?.id)
        .order('started_at', { ascending: false })

      console.log('Sender Dashboard - Raw chats:', chatsData)
      console.log('Sender Dashboard - Chats error:', chatsError)
      console.log('Sender Dashboard - Profile ID:', profileData?.id)

      // Separate pending, active and expired
      const now = new Date()
      
      // Pending = is_accepted is falsy (false/null/undefined) AND has paid credits
      const pending = (chatsData || []).filter(c => {
        const notAccepted = !c.is_accepted // falsy check instead of strict comparison
        const isPaid = c.credits_paid > 0
        console.log('Pending check:', c.id, 'is_accepted:', c.is_accepted, 'credits_paid:', c.credits_paid, 'result:', notAccepted && isPaid)
        return notAccepted && isPaid
      })
      
      // Active = is_accepted is truthy AND not expired
      const active = (chatsData || []).filter(c => {
        if (!c.is_accepted) return false // truthy check instead of strict === true
        if (!c.expires_at) return true
        const isActive = new Date(c.expires_at) > now
        console.log('Active check:', c.id, 'is_accepted:', c.is_accepted, 'expires_at:', c.expires_at, 'result:', isActive)
        return isActive
      })
      
      // Expired = is_accepted is truthy AND expired
      const expired = (chatsData || []).filter(c => {
        if (!c.is_accepted) return false
        if (!c.expires_at) return false
        return new Date(c.expires_at) <= now
      })

      console.log('Sender Dashboard - Pending:', pending.length, 'Active:', active.length, 'Expired:', expired.length)

      setProfile(profileData)
      setCredits(creditsData)
      setPendingChats(pending)
      setActiveChats(active)
      setExpiredChats(expired)
      setLoading(false)
    }

    getProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Hapus chat ini?')) return
    await supabase.from('chat_sessions').delete().eq('id', chatId)
    setExpiredChats(prev => prev.filter(c => c.id !== chatId))
  }

  const getTimeLeft = (chat: any) => {
    // If not accepted yet, show "Menunggu approve"
    if (chat.is_accepted !== true) {
      return 'Menunggu approve'
    }
    
    const now = new Date().getTime()
    const expires = new Date(chat.expires_at).getTime()
    const diff = expires - now
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}j ${minutes}m`
  }

  // Check if chat has unread messages from creator
  const hasUnreadMessages = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) return false
    // Get the latest message
    const sortedMessages = [...chat.messages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const latestMessage = sortedMessages[0]
    // If latest message is from creator (not sender), it's "unread"
    return latestMessage.sender_id !== profile?.id
  }

  // Count unread chats
  const unreadCount = activeChats.filter(chat => hasUnreadMessages(chat)).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/explore')
    }
  }

  if (loading) {
    return <FanonymLoader text="Memuat dashboard..." />
  }

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#0c0a14]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard/sender" className="flex items-center gap-2 animate-fadeIn">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              f
            </div>
            <span className="text-xl font-bold">fanonym</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link 
              href={`/sender/${profile?.username}`} 
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-5 mb-10 animate-fadeInDown">
          <div className="relative">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-3xl font-bold">
                {profile?.full_name?.[0] || profile?.username?.[0] || '?'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-white">Halo,</span>{' '}
              <span className="text-purple-400">{profile?.full_name || profile?.username}!</span>
            </h1>
            <p className="text-zinc-400 mt-1">Welcome back to your anonymous messaging hub.</p>
          </div>
        </div>

        {/* Credits & Top Up Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Credits Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-fadeInUp stagger-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                Premium Account
              </span>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Saldo Kredit</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-purple-400">{credits?.balance || 0}</span>
              <span className="text-zinc-400">Credits</span>
            </div>
            <p className="text-purple-400/70 text-sm mt-2">≈ Rp {((credits?.balance || 0) * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
          </div>

          {/* Top Up Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center animate-fadeInUp stagger-2">
            <h3 className="text-xl font-semibold mb-2">Butuh lebih banyak kredit?</h3>
            <p className="text-zinc-400 text-sm mb-5">
              Top up sekarang untuk terus terhubung dengan creator favoritmu secara anonim.
            </p>
            <Link 
              href="/topup" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Top Up Sekarang
            </Link>
          </div>
        </div>

        {/* Search Creator Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8 animate-fadeInUp stagger-3">
          <div className="flex items-center gap-2 text-purple-400 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Cari Creator</h3>
          </div>
          <form onSubmit={handleSearch}>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari creator favorit kamu..."
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500 outline-none transition-colors"
            />
          </form>
        </div>

        {/* Tabs */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-2 mb-6 inline-flex gap-2 animate-fadeIn stagger-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'pending' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pending ({pendingChats.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all relative ${
              activeTab === 'active' 
                ? 'bg-purple-600 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Chat Aktif ({activeChats.length})
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'expired' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Expired ({expiredChats.length})
          </button>
        </div>

        {/* Chat Lists */}
        <div className="space-y-3 animate-fadeInUp stagger-5">
          {/* Pending Chats */}
          {activeTab === 'pending' && (
            <>
              {pendingChats.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
                  <p className="text-zinc-500">Tidak ada chat yang menunggu approve.</p>
                </div>
              ) : (
                pendingChats.map((chat, index) => (
                  <Link 
                    key={chat.id} 
                    href={`/chat/${chat.id}`} 
                    className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-yellow-500/30 transition-all animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      {chat.creator?.avatar_url ? (
                        <img src={chat.creator.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover"/>
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center font-bold text-lg">
                          {chat.creator?.full_name?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg">{chat.creator?.full_name || chat.creator?.username}</p>
                        <p className="text-zinc-500 text-sm">@{chat.creator?.username}</p>
                      </div>
                    </div>
                    <div className="text-sm px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      Menunggu approve
                    </div>
                  </Link>
                ))
              )}
            </>
          )}

          {/* Active Chats */}
          {activeTab === 'active' && (
            <>
              {activeChats.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
                  <p className="text-zinc-500">Belum ada chat aktif.</p>
                </div>
              ) : (
                activeChats.map((chat, index) => {
                  const isUnread = hasUnreadMessages(chat)
                  return (
                    <Link 
                      key={chat.id} 
                      href={`/chat/${chat.id}`} 
                      className={`flex items-center justify-between p-4 bg-zinc-900/50 border rounded-2xl transition-all animate-fadeIn ${
                        isUnread ? 'border-green-500/30 bg-green-500/5' : 'border-zinc-800 hover:border-purple-500/30'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {chat.creator?.avatar_url ? (
                            <img src={chat.creator.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover"/>
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center font-bold text-lg">
                              {chat.creator?.full_name?.[0] || '?'}
                            </div>
                          )}
                          {isUnread && (
                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0c0a14]"></span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-lg flex items-center gap-2">
                            {chat.creator?.full_name || chat.creator?.username}
                            {isUnread && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                Pesan Baru
                              </span>
                            )}
                          </p>
                          <p className="text-zinc-500 text-sm">@{chat.creator?.username}</p>
                        </div>
                      </div>
                      <div className="text-sm px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {getTimeLeft(chat)}
                      </div>
                    </Link>
                  )
                })
              )}
            </>
          )}

          {/* Expired Chats */}
          {activeTab === 'expired' && (
            <>
              {expiredChats.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
                  <p className="text-zinc-500">Tidak ada chat expired.</p>
                </div>
              ) : (
                expiredChats.map((chat, index) => (
                  <div 
                    key={chat.id} 
                    className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl opacity-60 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Link href={`/chat/${chat.id}`} className="flex items-center gap-4 flex-1">
                      {chat.creator?.avatar_url ? (
                        <img src={chat.creator.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover grayscale"/>
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-zinc-600 to-zinc-700 rounded-full flex items-center justify-center font-bold text-lg">
                          {chat.creator?.full_name?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg">{chat.creator?.full_name || chat.creator?.username}</p>
                        <p className="text-zinc-600 text-sm">Expired: {new Date(chat.expires_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      className="text-sm px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
