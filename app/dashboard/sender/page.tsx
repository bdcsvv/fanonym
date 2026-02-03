'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/app/components/Logo'

export default function SenderDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

      setProfile(profileData)
      setCredits(creditsData)
      setActiveChats(chatsData || [])
      setLoading(false)
    }

    getProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
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
      {/* Background gradient orbs - same as landing page */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute top-3/4 left-1/4 h-[250px] w-[250px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <nav className="border-b border-gray-800/50 p-4 relative z-10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Logo variant="mask" size="md" linkTo="/" />
          <div className="flex items-center gap-4">
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
            <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"/>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
              {profile?.full_name?.[0] || profile?.username?.[0] || '?'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">Halo, {profile?.full_name || profile?.username}! 👋</h2>
            {profile?.bio && <p className="text-gray-400 text-sm">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Saldo Kredit</p>
            <p className="text-3xl font-bold text-teal-400">{credits?.balance || 0} Kredit</p>
          </div>
          <div className="bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/50 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Butuh lebih banyak kredit?</p>
              <p className="text-gray-400 text-sm">Top up sekarang!</p>
            </div>
            <Link href="/topup" className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600 font-semibold">Top Up</Link>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Cari Creator</h3>
          <Link href="/explore" className="block w-full p-4 bg-gray-900 border border-gray-600 rounded-lg text-gray-400 hover:border-teal-500 transition-colors">
            🔍 Cari creator favorit kamu...
          </Link>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Chat Aktif</h3>
          {activeChats.length === 0 ? (
            <p className="text-gray-400">Belum ada chat aktif.</p>
          ) : (
            <div className="space-y-3">
              {activeChats.map((chat) => (
                <Link key={chat.id} href={`/chat/${chat.id}`} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-teal-500 transition-colors">
                  <div className="flex items-center gap-3">
                    {chat.creator?.avatar_url ? (
                      <img src={chat.creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover"/>
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                        {chat.creator?.full_name?.[0] || chat.creator?.username?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{chat.creator?.full_name || chat.creator?.username || 'Creator'}</p>
                      <p className="text-gray-400 text-sm">@{chat.creator?.username || 'unknown'}</p>
                    </div>
                  </div>
                  <div className={`text-sm px-3 py-1 rounded-full ${new Date(chat.expires_at) < new Date() ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'}`}>
                    ⏱ {getTimeLeft(chat.expires_at)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}