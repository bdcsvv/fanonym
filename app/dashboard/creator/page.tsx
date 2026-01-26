'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatorDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [earnings, setEarnings] = useState<any>(null)
  const [pricing, setPricing] = useState<any[]>([])
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [spamMessages, setSpamMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inbox' | 'spam' | 'pricing'>('inbox')

  useEffect(() => {
    const getData = async () => {
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

      const { data: earningsData } = await supabase
        .from('earnings')
        .select('*')
        .eq('creator_id', profileData?.id)
        .single()

      const { data: pricingData } = await supabase
        .from('creator_pricing')
        .select('*')
        .eq('creator_id', profileData?.id)
        .order('duration_hours', { ascending: true })

      const { data: chatsData } = await supabase
        .from('chat_sessions')
        .select('*, sender:sender_id(id, username, full_name)')
        .eq('creator_id', profileData?.id)
        .order('started_at', { ascending: false })

      const { data: spamData } = await supabase
        .from('spam_messages')
        .select('*, sender:sender_id(id, username, full_name)')
        .eq('creator_id', profileData?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      setProfile(profileData)
      setEarnings(earningsData)
      setPricing(pricingData || [])
      setActiveChats(chatsData || [])
      setSpamMessages(spamData || [])
      setLoading(false)
    }

    getData()
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

  const updatePricing = async (id: string, newPrice: number) => {
    await supabase
      .from('creator_pricing')
      .update({ price_credits: newPrice })
      .eq('id', id)
    
    setPricing(pricing.map(p => p.id === id ? { ...p, price_credits: newPrice } : p))
  }

  const handleSpamAction = async (messageId: string, action: 'accept' | 'reject') => {
    await supabase
      .from('spam_messages')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', messageId)
    
    setSpamMessages(spamMessages.filter(m => m.id !== messageId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-teal-400">Fanonym</h1>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Halo, {profile?.full_name || profile?.username}! 👋</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Pendapatan</p>
            <p className="text-2xl font-bold text-teal-400">{earnings?.total_earned || 0} Kredit</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Saldo Tersedia</p>
            <p className="text-2xl font-bold text-green-400">{earnings?.available_balance || 0} Kredit</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Chat Aktif</p>
            <p className="text-2xl font-bold text-purple-400">{activeChats.filter(c => new Date(c.expires_at) > new Date()).length}</p>
          </div>
        </div>

        {/* Profile Link */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Link Profil Kamu</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`fanonym.vercel.app/creator/${profile?.username}`}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-300"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(`fanonym.vercel.app/creator/${profile?.username}`)}
              className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'inbox' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Inbox ({activeChats.length})
          </button>
          <button
            onClick={() => setActiveTab('spam')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'spam' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Spam ({spamMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'pricing' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Set Harga
          </button>
        </div>

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Chat Masuk</h3>
            {activeChats.length === 0 ? (
              <p className="text-gray-400">Belum ada chat masuk.</p>
            ) : (
              <div className="space-y-3">
                {activeChats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-teal-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                        {chat.sender?.full_name?.[0] || chat.sender?.username?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{chat.sender?.full_name || chat.sender?.username || 'Anonymous'}</p>
                        <p className="text-gray-400 text-sm">Bayar {chat.credits_paid} kredit</p>
                      </div>
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      new Date(chat.expires_at) < new Date()
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-teal-500/20 text-teal-400'
                    }`}>
                      ⏱ {getTimeLeft(chat.expires_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spam Tab */}
        {activeTab === 'spam' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Pesan Gratis (Spam)</h3>
            {spamMessages.length === 0 ? (
              <p className="text-gray-400">Tidak ada pesan spam.</p>
            ) : (
              <div className="space-y-3">
                {spamMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center font-bold">
                        {msg.sender?.full_name?.[0] || msg.sender?.username?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{msg.sender?.full_name || msg.sender?.username || 'Anonymous'}</p>
                        <p className="text-gray-500 text-xs">{new Date(msg.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{msg.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSpamAction(msg.id, 'accept')}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => handleSpamAction(msg.id, 'reject')}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Atur Harga Chat</h3>
            {pricing.length === 0 ? (
              <p className="text-gray-400">Belum ada pricing. Hubungi admin untuk setup.</p>
            ) : (
              <div className="space-y-4">
                {pricing.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold">{p.duration_hours} Jam</p>
                      <p className="text-gray-400 text-sm">Durasi chat</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={p.price_credits}
                        onChange={(e) => updatePricing(p.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-center"
                      />
                      <span className="text-gray-400">Kredit</span>
                    </div>
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