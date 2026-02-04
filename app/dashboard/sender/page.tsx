'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SenderDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [expiredChats, setExpiredChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active')

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

      const { data: chatsData } = await supabase
        .from('chat_sessions')
        .select('*, creator:creator_id(id, username, full_name, avatar_url)')
        .eq('sender_id', profileData?.id)
        .order('started_at', { ascending: false })

      // Separate active and expired
      const now = new Date()
      const active = (chatsData || []).filter(c => new Date(c.expires_at) > now)
      const expired = (chatsData || []).filter(c => new Date(c.expires_at) <= now)

      setProfile(profileData)
      setCredits(creditsData)
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

  const getTimeLeft = (expiresAt: string) => {
    const now = new Date().getTime()
    const expires = new Date(expiresAt).getTime()
    const diff = expires - now
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}j ${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <nav className="border-b border-purple-500/20 p-4 relative z-10 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href={`/sender/${profile?.username}`} className="text-gray-400 hover:text-white">👤 Profile</Link>
            <Link href="/settings" className="text-gray-400 hover:text-white">⚙️ Settings</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 relative z-10">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/50"/>
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-xl font-bold">
              {profile?.full_name?.[0] || profile?.username?.[0] || '?'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">Halo, {profile?.full_name || profile?.username}!</h2>
            {profile?.bio && <p className="text-gray-400 text-sm">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">Saldo Kredit</p>
            <p className="text-3xl font-bold text-white">{credits?.balance || 0}</p>
            <p className="text-gray-500 text-xs">Kredit</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">Butuh lebih banyak kredit?</p>
              <p className="text-gray-400 text-xs">Top up sekarang!</p>
            </div>
            <Link href="/topup" className="px-4 py-2 bg-purple-500 rounded-xl hover:bg-purple-600 font-medium text-sm">Top Up</Link>
          </div>
        </div>

        <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-200">🔍 Cari Creator</h3>
          <Link href="/explore" className="block w-full p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl text-gray-400 hover:border-purple-500/50 transition-colors text-sm">
            Cari creator favorit kamu...
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
              activeTab === 'active' ? 'bg-purple-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Chat Aktif ({activeChats.length})
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
              activeTab === 'expired' ? 'bg-purple-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Expired ({expiredChats.length})
          </button>
        </div>

        {/* Active Chats */}
        {activeTab === 'active' && (
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            {activeChats.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada chat aktif.</p>
            ) : (
              <div className="space-y-3">
                {activeChats.map((chat) => (
                  <Link key={chat.id} href={`/chat/${chat.id}`} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {chat.creator?.avatar_url ? (
                        <img src={chat.creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover"/>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {chat.creator?.full_name?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{chat.creator?.full_name || chat.creator?.username}</p>
                        <p className="text-gray-500 text-xs">@{chat.creator?.username}</p>
                      </div>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      {getTimeLeft(chat.expires_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expired Chats */}
        {activeTab === 'expired' && (
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            {expiredChats.length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada chat expired.</p>
            ) : (
              <div className="space-y-3">
                {expiredChats.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl opacity-70">
                    <Link href={`/chat/${chat.id}`} className="flex items-center gap-3 flex-1">
                      {chat.creator?.avatar_url ? (
                        <img src={chat.creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover"/>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {chat.creator?.full_name?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{chat.creator?.full_name || chat.creator?.username}</p>
                        <p className="text-gray-500 text-xs">Expired: {new Date(chat.expires_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}