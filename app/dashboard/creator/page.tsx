'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FanonymLoader from '@/app/components/FanonymLoader'


export default function CreatorDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [earnings, setEarnings] = useState<any>(null)
  const [pricing, setPricing] = useState<any[]>([])
  const [pendingChats, setPendingChats] = useState<any[]>([])
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [expiredChats, setExpiredChats] = useState<any[]>([])
  const [spamMessages, setSpamMessages] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [totalAnons, setTotalAnons] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'inbox' | 'expired' | 'spam' | 'pricing' | 'withdraw'>('pending')
  const [newDuration, setNewDuration] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [earningsFilter, setEarningsFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [filteredEarnings, setFilteredEarnings] = useState(0)
  
  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const KREDIT_TO_IDR = 10000
  const PLATFORM_FEE = 0.2
  const TRANSFER_FEE = 30000
  const FREE_TRANSFER_MIN = 1000000
  const MIN_WITHDRAW = 10

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

      if (!profileData) {
        setLoading(false)
        return
      }

      const { data: earningsData } = await supabase
        .from('earnings')
        .select('*')
        .eq('creator_id', profileData.id)
        .single()

      const { data: pricingData } = await supabase
        .from('creator_pricing')
        .select('*')
        .eq('creator_id', profileData.id)
        .order('duration_hours', { ascending: true })

      const { data: chatsData, error: chatsError } = await supabase
        .from('chat_sessions')
        .select('*, sender:sender_id(id, username, full_name, avatar_url), messages(id, sender_id, created_at)')
        .eq('creator_id', profileData.id)
        .order('started_at', { ascending: false })

      console.log('RAW Chats data:', chatsData)
      console.log('Chats error:', chatsError)

      // Separate pending, active and expired chats
      const now = new Date()
      
      // Pending = is_accepted is falsy AND credits_paid > 0
      const pending = (chatsData || []).filter(c => {
        console.log('Chat:', c.id, 'is_accepted:', c.is_accepted, 'type:', typeof c.is_accepted, 'credits_paid:', c.credits_paid)
        return !c.is_accepted && c.credits_paid > 0
      })
      
      // Active = is_accepted is truthy AND not expired
      const active = (chatsData || []).filter(c => {
        if (!c.is_accepted) return false
        if (!c.expires_at) return true
        return new Date(c.expires_at) > now
      })
      
      // Expired = is_accepted is truthy AND expired
      const expired = (chatsData || []).filter(c => {
        if (!c.is_accepted) return false
        if (!c.expires_at) return false
        return new Date(c.expires_at) <= now
      })

      console.log('Pending count:', pending.length)
      console.log('Active count:', active.length)
      console.log('Expired count:', expired.length)

      // Count unique senders (total anons)
      const uniqueSenders = new Set((chatsData || []).map(c => c.sender_id))

      const { data: spamData } = await supabase
        .from('spam_messages')
        .select('*, sender:sender_id(id, username, full_name, avatar_url)')
        .eq('creator_id', profileData.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('creator_id', profileData.id)
        .order('created_at', { ascending: false })

      setProfile(profileData)
      setEarnings(earningsData)
      setPricing(pricingData || [])
      setPendingChats(pending)
      setActiveChats(active)
      setExpiredChats(expired)
      setTotalAnons(uniqueSenders.size)
      setSpamMessages(spamData || [])
      setWithdrawals(withdrawalsData || [])
      setFilteredEarnings(earningsData?.total_earned || 0)
      setLoading(false)
    }

    getData()
  }, [router])

  // Check if chat has unread messages from sender (for creator view)
  const hasUnreadMessages = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) return false
    if (!profile) return false
    
    // Get the latest message
    const sortedMessages = [...chat.messages].sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const latestMessage = sortedMessages[0]
    
    // If latest message is from sender (not creator), it's "unread"
    return latestMessage.sender_id !== profile.id
  }

  // Count unread chats in inbox
  const unreadInboxCount = activeChats.filter(chat => hasUnreadMessages(chat)).length

  // Calculate filtered earnings
  const calculateFilteredEarnings = async (filter: 'all' | 'today' | 'week' | 'month') => {
    if (!profile) return
    
    if (filter === 'all') {
      setFilteredEarnings(earnings?.total_earned || 0)
      return
    }

    const now = new Date()
    let startDate = new Date()
    
    if (filter === 'today') {
      startDate.setHours(0, 0, 0, 0)
    } else if (filter === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (filter === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    }

    const { data: filteredChats } = await supabase
      .from('chat_sessions')
      .select('credits_paid, created_at')
      .eq('creator_id', profile.id)
      .gte('created_at', startDate.toISOString())

    const total = (filteredChats || []).reduce((sum, chat) => sum + (chat.credits_paid || 0), 0)
    setFilteredEarnings(total)
  }

  useEffect(() => {
    calculateFilteredEarnings(earningsFilter)
  }, [earningsFilter, profile, earnings])

  // Handle accept chat
  const handleAcceptChat = async (chatId: string, durationHours: number) => {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + durationHours)

    const { error } = await supabase
      .from('chat_sessions')
      .update({ 
        is_accepted: true,
        accepted_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('id', chatId)

    if (error) {
      alert('Error accepting chat: ' + error.message)
      return
    }

    // Refresh data
    window.location.reload()
  }

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

  const updatePricing = async (id: string, newPriceValue: number) => {
    const { error } = await supabase
      .from('creator_pricing')
      .update({ price_credits: newPriceValue })
      .eq('id', id)
    
    if (!error) {
      setPricing(pricing.map(p => p.id === id ? { ...p, price_credits: newPriceValue } : p))
    }
  }

  const savePricing = async (id: string) => {
    const priceItem = pricing.find(p => p.id === id)
    if (!priceItem) return

    const { error } = await supabase
      .from('creator_pricing')
      .update({ price_credits: priceItem.price_credits })
      .eq('id', id)
    
    if (!error) {
      alert('Harga berhasil disimpan!')
    } else {
      alert('Error: ' + error.message)
    }
  }

  const addPricing = async () => {
    const duration = parseInt(newDuration)
    const price = parseInt(newPrice)
    
    if (!duration || !price) {
      alert('Isi durasi dan harga!')
      return
    }

    const { data, error } = await supabase
      .from('creator_pricing')
      .insert({
        creator_id: profile?.id,
        duration_hours: duration,
        price_credits: price,
        is_active: true
      })
      .select()
      .single()
    
    if (!error && data) {
      setPricing([...pricing, data])
      setNewDuration('')
      setNewPrice('')
    }
  }

  const deletePricing = async (id: string) => {
    await supabase.from('creator_pricing').delete().eq('id', id)
    setPricing(pricing.filter(p => p.id !== id))
  }

  const handleSpamAction = async (messageId: string, senderId: string, action: 'accept' | 'reject') => {
    if (action === 'accept') {
      // Bikin chat session 10 menit gratis - langsung accepted karena dari spam
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          sender_id: senderId,
          creator_id: profile?.id,
          duration_hours: 0,
          credits_paid: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          is_accepted: true, // FIXED: use is_accepted instead of is_active
          accepted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!error && session) {
        // Copy pesan spam ke chat room
        const spamMsg = spamMessages.find(m => m.id === messageId)
        if (spamMsg) {
          await supabase.from('messages').insert({
            session_id: session.id,
            sender_id: senderId,
            content: spamMsg.content,
            is_read: false
          })
        }
      }
    }

    // Update status spam message
    await supabase
      .from('spam_messages')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', messageId)

    setSpamMessages(spamMessages.filter(m => m.id !== messageId))

    if (action === 'accept') {
      alert('Pesan diterima! Chat 10 menit telah dibuat.')
      // Refresh active chats - FIXED: properly filter by is_accepted
      const { data: chatsData } = await supabase
        .from('chat_sessions')
        .select('*, sender:sender_id(id, username, full_name, avatar_url)')
        .eq('creator_id', profile?.id)
        .order('created_at', { ascending: false })
      
      // Re-filter active chats (is_accepted = true AND not expired)
      const now = new Date()
      const active = (chatsData || []).filter(c => {
        if (c.is_accepted !== true) return false
        if (!c.expires_at) return true
        return new Date(c.expires_at) > now
      })
      setActiveChats(active)
    }
  }

  const calculateWithdraw = (kredits: number) => {
    const grossAmount = kredits * KREDIT_TO_IDR * (1 - PLATFORM_FEE)
    const fee = grossAmount < FREE_TRANSFER_MIN ? TRANSFER_FEE : 0
    const netAmount = grossAmount - fee
    return { grossAmount, fee, netAmount }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    
    if (!amount || amount < MIN_WITHDRAW) {
      alert(`Minimal withdraw ${MIN_WITHDRAW} kredit!`)
      return
    }

    if (!bankName || !accountNumber || !accountName) {
      alert('Lengkapi semua data rekening!')
      return
    }

    const availableBalance = earnings?.available_balance || 0
    if (amount > availableBalance) {
      alert('Saldo tidak cukup!')
      return
    }

    setWithdrawLoading(true)

    const { grossAmount, fee, netAmount } = calculateWithdraw(amount)

    const { data: withdrawal, error: withdrawError } = await supabase
      .from('withdrawals')
      .insert({
        creator_id: profile?.id,
        amount: amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        status: 'pending'
      })
      .select()
      .single()

    if (withdrawError) {
      alert('Gagal membuat request withdraw!')
      setWithdrawLoading(false)
      return
    }

    await supabase
      .from('earnings')
      .update({
        available_balance: availableBalance - amount
      })
      .eq('creator_id', profile?.id)

    setEarnings({ ...earnings, available_balance: availableBalance - amount })
    setWithdrawals([withdrawal, ...withdrawals])
    
    setWithdrawAmount('')
    setBankName('')
    setAccountNumber('')
    setAccountName('')
    setWithdrawLoading(false)

    alert(`Request withdraw berhasil!\n\nJumlah: ${amount} Kredit\nDiterima: Rp ${netAmount.toLocaleString('id-ID')}${fee > 0 ? `\n(Fee transfer: Rp ${fee.toLocaleString('id-ID')})` : ' (FREE transfer)'}\n\nAkan diproses dalam 1-3 hari kerja.`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Pending</span>
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Completed</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{status}</span>
    }
  }

  if (loading) {
    return <FanonymLoader text="Memuat dashboard..." />
  }

  const withdrawCalc = withdrawAmount ? calculateWithdraw(parseFloat(withdrawAmount)) : null

  const handleDeleteExpiredChat = async (chatId: string) => {
    if (!confirm('Hapus chat ini?')) return
    await supabase.from('chat_sessions').delete().eq('id', chatId)
    setExpiredChats(prev => prev.filter(c => c.id !== chatId))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative page-transition">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <nav className="border-b border-purple-500/20 p-4 relative z-10 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/dashboard/creator" className="text-2xl font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>
          <div className="flex items-center gap-4 text-sm">
  <Link href={`/profile/${profile?.username}`} className="text-gray-400 hover:text-white">
    👤 Profile
  </Link>
  <Link href="/settings" className="text-gray-400 hover:text-white">
    ⚙️ Settings
  </Link>
  <button onClick={handleLogout} className="text-gray-400 hover:text-white">
    Logout
  </button>
</div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="flex items-center gap-4 mb-6">
  {profile?.avatar_url ? (
    <img 
      src={profile.avatar_url} 
      alt="Avatar" 
      className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/50"
    />
  ) : (
    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-xl font-bold">
      {profile?.full_name?.[0] || profile?.username?.[0] || '?'}
    </div>
  )}
  <div>
    <h2 className="text-xl font-bold flex items-center gap-2">
      Halo, {profile?.full_name || profile?.username}!
      {profile?.is_verified && <span className="text-[#1da1f2] text-base">✓</span>}
    </h2>
    {profile?.bio && <p className="text-gray-400 text-sm">{profile.bio}</p>}
  </div>
</div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-1">
              <p className="text-gray-400 text-xs">Total Pendapatan</p>
              <select 
                value={earningsFilter}
                onChange={(e) => setEarningsFilter(e.target.value as any)}
                className="text-xs bg-gray-700 border-none rounded px-1 py-0.5 text-gray-300"
              >
                <option value="all">Semua</option>
                <option value="today">Hari ini</option>
                <option value="week">Minggu ini</option>
                <option value="month">Bulan ini</option>
              </select>
            </div>
            <p className="text-2xl font-bold text-white">{filteredEarnings}</p>
            <p className="text-gray-500 text-xs">Kredit</p>
          </div>
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">Saldo</p>
            <p className="text-2xl font-bold text-white">{earnings?.available_balance || 0}</p>
            <p className="text-gray-500 text-xs">≈ Rp {((earnings?.available_balance || 0) * KREDIT_TO_IDR * (1 - PLATFORM_FEE)).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">Chat Aktif</p>
            <p className="text-2xl font-bold text-white">{activeChats.length}</p>
            <p className="text-gray-500 text-xs">Sessions</p>
          </div>
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">Total Anon</p>
            <p className="text-2xl font-bold text-white">{totalAnons}</p>
            <p className="text-gray-500 text-xs">Unique senders</p>
          </div>
        </div>

        {/* Profile Link */}
        <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">Link Profil Kamu</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`fanonym.vercel.app/profile/${profile?.username}`}
              className="flex-1 px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-300 text-sm"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(`fanonym.vercel.app/profile/${profile?.username}`)}
              className="px-4 py-2.5 bg-purple-500 rounded-xl hover:bg-purple-600 text-sm font-medium"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${
              activeTab === 'pending' ? 'bg-yellow-500 text-black' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            🔔 Pending ({pendingChats.length})
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm relative ${
              activeTab === 'inbox' ? 'bg-purple-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Inbox ({activeChats.length})
            {unreadInboxCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {unreadInboxCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${
              activeTab === 'expired' ? 'bg-purple-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Expired ({expiredChats.length})
          </button>
          <button
            onClick={() => setActiveTab('spam')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${
              activeTab === 'spam' ? 'bg-purple-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Spam ({spamMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${
              activeTab === 'pricing' ? 'bg-purple-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Set Harga
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${
              activeTab === 'withdraw' ? 'bg-green-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Pending Tab - Chat yang belum di-accept */}
        {activeTab === 'pending' && (
          <div className="bg-gray-800/30 border border-yellow-500/20 rounded-2xl p-5">
            <h3 className="text-base font-semibold mb-4 text-yellow-400">🔔 Chat Menunggu Accept</h3>
            <p className="text-gray-400 text-sm mb-4">Accept chat untuk memulai countdown waktu.</p>
            {pendingChats.length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada chat pending.</p>
            ) : (
              <div className="space-y-3">
                {pendingChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 border border-yellow-500/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {chat.sender?.avatar_url ? (
                        <img src={chat.sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                          {chat.sender?.full_name?.[0] || chat.sender?.username?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{chat.sender?.full_name || chat.sender?.username || 'Anonymous'}</p>
                        <p className="text-yellow-400 text-sm">
                          💰 {chat.credits_paid} kredit • {chat.duration_hours} jam
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptChat(chat.id, chat.duration_hours)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl font-semibold text-sm transition-colors"
                    >
                      ✓ Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            <h3 className="text-base font-semibold mb-4 text-gray-200">Chat Aktif</h3>
            {activeChats.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada chat aktif.</p>
            ) : (
              <div className="space-y-3">
                {activeChats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className={`flex items-center justify-between p-4 bg-gray-900/50 border rounded-xl hover:border-purple-500/50 transition-colors ${
                      hasUnreadMessages(chat) ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {chat.sender?.avatar_url ? (
                          <img src={chat.sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                            {chat.sender?.full_name?.[0] || chat.sender?.username?.[0] || '?'}
                          </div>
                        )}
                        {hasUnreadMessages(chat) && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-[10px]">💬</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {chat.sender?.full_name || chat.sender?.username || 'Anonymous'}
                          {hasUnreadMessages(chat) && (
                            <span className="text-xs text-green-400 font-normal">• Pesan baru</span>
                          )}
                        </p>
                        <p className="text-purple-400 text-sm">
                          💰 {chat.credits_paid} kredit
                        </p>
                      </div>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      ⏱ {getTimeLeft(chat.expires_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expired Tab */}
        {activeTab === 'expired' && (
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            <h3 className="text-base font-semibold mb-4 text-gray-200">Chat Expired</h3>
            {expiredChats.length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada chat expired.</p>
            ) : (
              <div className="space-y-3">
                {expiredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl opacity-70"
                  >
                    <Link href={`/chat/${chat.id}`} className="flex items-center gap-3 flex-1">
                      {chat.sender?.avatar_url ? (
                        <img src={chat.sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {chat.sender?.full_name?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{chat.sender?.full_name || chat.sender?.username || 'Anonymous'}</p>
                        <p className="text-gray-500 text-xs">
                          Expired: {new Date(chat.expires_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDeleteExpiredChat(chat.id)}
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

        {/* Spam Tab */}
        {activeTab === 'spam' && (
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
            <h3 className="text-base font-semibold mb-2 text-gray-200">Pesan Gratis (Spam)</h3>
            <p className="text-gray-500 text-xs mb-4">Jika diterima, chat 10 menit akan dibuat otomatis.</p>
            {spamMessages.length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada pesan spam.</p>
            ) : (
              <div className="space-y-3">
                {spamMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      {msg.sender?.avatar_url ? (
                        <img src={msg.sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {msg.sender?.full_name?.[0] || msg.sender?.username?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{msg.sender?.full_name || msg.sender?.username || 'Anonymous'}</p>
                        <p className="text-gray-500 text-xs">{new Date(msg.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{msg.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSpamAction(msg.id, msg.sender_id, 'accept')}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 text-sm"
                      >
                        ✓ Terima
                      </button>
                      <button
                        onClick={() => handleSpamAction(msg.id, msg.sender_id, 'reject')}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 text-sm"
                      >
                        ✗ Tolak
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
            
            <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <p className="text-sm text-gray-400 mb-3">Tambah Durasi Baru</p>
              <div className="flex gap-3 items-end flex-wrap">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Durasi (jam)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Harga (kredit)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="5"
                    min="1"
                    className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-center"
                  />
                </div>
                <button
                  onClick={addPricing}
                  className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 font-semibold"
                >
                  Tambah
                </button>
              </div>
            </div>

            {pricing.length === 0 ? (
              <p className="text-gray-400">Belum ada pricing. Tambah di atas!</p>
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
                      <button
                        onClick={() => savePricing(p.id)}
                        className="ml-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => deletePricing(p.id)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Tarik Saldo</h3>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm">Saldo kamu:</p>
                <p className="text-2xl font-bold text-green-400">{earnings?.available_balance || 0} Kredit</p>
                <p className="text-gray-400 text-xs mt-1">≈ Rp {((earnings?.available_balance || 0) * KREDIT_TO_IDR * (1 - PLATFORM_FEE)).toLocaleString('id-ID')} (setelah potongan 20%)</p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-300 mb-2">📋 Ketentuan Withdraw:</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Minimal withdraw: <span className="text-white">{MIN_WITHDRAW} Kredit</span></li>
                  <li>• Potongan platform: <span className="text-white">20%</span></li>
                  <li>• Di bawah Rp 1.000.000: <span className="text-yellow-400">Fee Rp 30.000</span></li>
                  <li>• Rp 1.000.000 ke atas: <span className="text-green-400">FREE transfer</span></li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Jumlah Kredit</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Min. ${MIN_WITHDRAW}`}
                    min={MIN_WITHDRAW}
                    max={earnings?.available_balance || 0}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Bank / E-Wallet</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BCA, Mandiri, GoPay, OVO, dll"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Nomor Rekening / HP</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Nama Pemilik</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Nama sesuai rekening"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              {withdrawCalc && parseFloat(withdrawAmount) >= MIN_WITHDRAW && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Rincian:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Jumlah</span>
                      <span>{withdrawAmount} Kredit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nilai (setelah potongan 20%)</span>
                      <span>Rp {withdrawCalc.grossAmount.toLocaleString('id-ID')}</span>
                    </div>
                    {withdrawCalc.fee > 0 && (
                      <div className="flex justify-between text-yellow-400">
                        <span>Fee transfer</span>
                        <span>- Rp {withdrawCalc.fee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-green-400 pt-2 border-t border-gray-700">
                      <span>Yang diterima</span>
                      <span>Rp {withdrawCalc.netAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) < MIN_WITHDRAW || parseFloat(withdrawAmount) > (earnings?.available_balance || 0)}
                className="w-full py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawLoading ? 'Processing...' : 'Request Withdraw'}
              </button>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Riwayat Withdraw</h3>
              
              {withdrawals.length === 0 ? (
                <p className="text-gray-400">Belum ada riwayat withdraw.</p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w) => {
                    const calc = calculateWithdraw(w.amount)
                    return (
                      <div key={w.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg">
                        <div>
                          <p className="font-semibold">{w.amount} Kredit</p>
                          <p className="text-gray-400 text-sm">{w.bank_name} - {w.account_number}</p>
                          <p className="text-gray-500 text-xs">{new Date(w.created_at).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(w.status)}
                          <p className="text-gray-400 text-sm mt-1">Rp {calc.netAmount.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}