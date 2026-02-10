'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FanonymLoader from '@/app/components/FanonymLoader'
import HelpButton from '@/app/components/HelpButton'
import GalaxyBackground from '@/app/components/GalaxyBackground'
import Toast from '@/app/components/Toast'
import NotificationBadge from '@/app/components/NotificationBadge'
import { handleError } from '@/app/lib/errorHandler'

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
  const [navTab, setNavTab] = useState<'dashboard' | 'analytics' | 'history'>('dashboard')
  const [newDuration, setNewDuration] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [earningsFilter, setEarningsFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [filteredEarnings, setFilteredEarnings] = useState(0)
  const [copied, setCopied] = useState(false)
  const [acceptingChatId, setAcceptingChatId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  // Notifications
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  
  // Analytics stats
  const [analyticsData, setAnalyticsData] = useState<{
    today: number
    week: number
    month: number
    todayChats: number
    weekChats: number
    monthChats: number
  }>({ today: 0, week: 0, month: 0, todayChats: 0, weekChats: 0, monthChats: 0 })
  
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
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        // If auth error or no user, redirect to login
        if (authError || !user) {
          console.error('Auth error:', authError)
          await supabase.auth.signOut() // Clear bad session
          router.push('/auth/login')
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError || !profileData) {
          console.error('Profile error:', profileError)
          await supabase.auth.signOut()
          router.push('/auth/login')
          return
        }

        if (profileData.user_type !== 'creator') {
          router.push('/dashboard/sender')
          return
        }

        setProfile(profileData)

        // Get earnings
        const { data: earningsData } = await supabase
          .from('earnings')
          .select('*')
          .eq('creator_id', user.id)
          .single()
        
        setEarnings(earningsData)
        setFilteredEarnings(earningsData?.total_earned || 0)

        // Get pricing
        const { data: pricingData } = await supabase
        .from('creator_pricing')
        .select('*')
        .eq('creator_id', user.id)
        .order('duration_hours', { ascending: true })
      
      setPricing(pricingData || [])

      // Get chat sessions with messages for unread detection
      const { data: chatsData } = await supabase
        .from('chat_sessions')
        .select('*, sender:sender_id(id, username, full_name, avatar_url), messages(id, sender_id, created_at)')
        .eq('creator_id', user.id)
        .order('started_at', { ascending: false })

      console.log('RAW Chats data:', chatsData)

      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      // Pending = is_accepted is falsy AND credits_paid > 0
      // Show ALL pending chats (not filtered by 24h for display, but mark expired ones)
      const allPending = (chatsData || []).filter((c: any) => {
        return !c.is_accepted && c.credits_paid > 0
      })
      
      // Check which pending chats are expired (older than 24h)
      const expiredPendingIds = allPending
        .filter((c: any) => new Date(c.created_at) < twentyFourHoursAgo)
        .map((c: any) => c.id)
      
      // For now, show all pending chats to creator (they can still accept within reason)
      const pending = allPending
      
      // Active = is_accepted is truthy AND not expired
      const active = (chatsData || []).filter((c: any) => {
        if (!c.is_accepted) return false
        if (!c.expires_at) return true
        return new Date(c.expires_at) > now
      })
      
      // Expired = is_accepted is truthy AND expired
      const expired = (chatsData || []).filter((c: any) => {
        if (!c.is_accepted) return false
        if (!c.expires_at) return false
        return new Date(c.expires_at) <= now
      })
      
      console.log('Pending count:', pending.length)
      console.log('Active count:', active.length)
      console.log('Expired count:', expired.length)

      setPendingChats(pending)
      setActiveChats(active)
      setExpiredChats(expired)

      // Get spam messages
      const { data: spamData } = await supabase
        .from('spam_messages')
        .select('*, sender:sender_id(id, username, full_name, avatar_url)')
        .eq('creator_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      setSpamMessages(spamData || [])

      // Get withdrawals
      const { data: withdrawData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      setWithdrawals(withdrawData || [])

      // Build notifications
      const notifs: any[] = []
      
      // Withdrawal notifications
      ;(withdrawData || []).slice(0, 5).forEach((w: any) => {
        if (w.status === 'completed') {
          notifs.push({
            id: `w-${w.id}`,
            type: 'withdraw_success',
            message: `Withdraw ${w.amount} kredit berhasil!`,
            time: w.updated_at || w.created_at
          })
        } else if (w.status === 'rejected') {
          notifs.push({
            id: `w-${w.id}`,
            type: 'withdraw_failed',
            message: `Withdraw ${w.amount} kredit ditolak`,
            time: w.updated_at || w.created_at
          })
        }
      })
      
      // Unread messages notifications
      const unreadChats = (chatsData || []).filter((c: any) => {
        if (!c.is_accepted || !c.messages || c.messages.length === 0) return false
        const sortedMsgs = [...c.messages].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        return sortedMsgs[0]?.sender_id !== user.id
      })
      
      unreadChats.slice(0, 5).forEach((c: any) => {
        notifs.push({
          id: `c-${c.id}`,
          type: 'unread_message',
          message: `Pesan belum dibalas dari ${c.sender?.full_name || 'Anonim'}`,
          time: c.messages?.[0]?.created_at || c.created_at
        })
      })
      
      setNotifications(notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()))

      // Calculate analytics data (reuse 'now' from above)
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Filter ONLY accepted chats (credits_transferred) for earnings
      const acceptedChats = (chatsData || []).filter((c: any) => c.is_accepted && c.credits_transferred !== false)
      
      const todayChats = acceptedChats.filter((c: any) => new Date(c.accepted_at || c.created_at) >= todayStart)
      const weekChats = acceptedChats.filter((c: any) => new Date(c.accepted_at || c.created_at) >= weekStart)
      const monthChats = acceptedChats.filter((c: any) => new Date(c.accepted_at || c.created_at) >= monthStart)

      const todayEarnings = todayChats.reduce((sum: number, c: any) => sum + (c.credits_paid || 0), 0)
      const weekEarnings = weekChats.reduce((sum: number, c: any) => sum + (c.credits_paid || 0), 0)
      const monthEarnings = monthChats.reduce((sum: number, c: any) => sum + (c.credits_paid || 0), 0)

      setAnalyticsData({
        today: todayEarnings,
        week: weekEarnings,
        month: monthEarnings,
        todayChats: todayChats.length,
        weekChats: weekChats.length,
        monthChats: monthChats.length
      })

      // Count unique senders
      const uniqueSenders = new Set((chatsData || []).map((c: any) => c.sender_id))
      setTotalAnons(uniqueSenders.size)

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
      // Don't redirect on error, just show empty state
    }
  }

    getData()
  }, [router])

  // Helper function to check if chat has unread messages
  const hasUnreadMessages = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) return false
    const sortedMessages = [...chat.messages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const latestMessage = sortedMessages[0]
    return latestMessage.sender_id !== profile?.id
  }

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

  const handleAcceptChat = async (chatId: string, durationHours: number, creditsPaid: number, senderId: string) => {
    setAcceptingChatId(chatId)
    
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + durationHours)

    try {
      // First, verify the chat session hasn't been accepted already
      const { data: existingChat, error: chatCheckError } = await supabase
        .from('chat_sessions')
        .select('is_accepted, credits_transferred')
        .eq('id', chatId)
        .single()

      if (chatCheckError) throw chatCheckError

      if (existingChat.is_accepted || existingChat.credits_transferred) {
        setToast({ message: 'Chat ini sudah di-accept sebelumnya!', type: 'error' })
        // Refresh data
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: chatsData } = await supabase
            .from('chat_sessions')
            .select('*, sender:sender_id(id, username, full_name, avatar_url), messages(id, sender_id, created_at)')
            .eq('creator_id', user.id)
            .order('started_at', { ascending: false })
          
          const pending = (chatsData || []).filter((c: any) => !c.is_accepted && c.credits_paid > 0)
          setPendingChats(pending)
        }
        return
      }

      // 1. Verify sender has enough credits
      const { data: senderCredits, error: creditsCheckError } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', senderId)
        .single()

      if (creditsCheckError) throw creditsCheckError

      if (!senderCredits || senderCredits.balance < creditsPaid) {
        setToast({ message: 'Error: Sender tidak memiliki cukup kredit!', type: 'error' })
        return
      }

      // 2. Deduct credits from sender
      const { error: deductError } = await supabase
        .from('credits')
        .update({ balance: senderCredits.balance - creditsPaid })
        .eq('user_id', senderId)

      if (deductError) {
        console.error('Failed to deduct credits:', deductError)
        throw new Error('Gagal mengurangi kredit sender')
      }

      // 3. Add credits to creator earnings
      const { data: currentEarnings } = await supabase
        .from('earnings')
        .select('*')
        .eq('creator_id', profile.id)
        .single()

      if (currentEarnings) {
        const { error: updateEarningsError } = await supabase
          .from('earnings')
          .update({ 
            total_earned: (currentEarnings.total_earned || 0) + creditsPaid,
            available_balance: (currentEarnings.available_balance || 0) + creditsPaid
          })
          .eq('creator_id', profile.id)
        
        if (updateEarningsError) {
          console.error('Failed to update earnings:', updateEarningsError)
          // Try to refund sender
          await supabase
            .from('credits')
            .update({ balance: senderCredits.balance })
            .eq('user_id', senderId)
          throw new Error('Gagal update earnings, kredit dikembalikan')
        }
      } else {
        const { error: insertEarningsError } = await supabase
          .from('earnings')
          .insert({
            creator_id: profile.id,
            total_earned: creditsPaid,
            available_balance: creditsPaid,
            withdrawn: 0
          })
        
        if (insertEarningsError) {
          console.error('Failed to insert earnings:', insertEarningsError)
          // Try to refund sender
          await supabase
            .from('credits')
            .update({ balance: senderCredits.balance })
            .eq('user_id', senderId)
          throw new Error('Gagal create earnings, kredit dikembalikan')
        }
      }

      // 4. Update chat session - mark as accepted AND credits_transferred
      const { error: updateChatError } = await supabase
        .from('chat_sessions')
        .update({ 
          is_accepted: true,
          accepted_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          credits_transferred: true,
          status: 'active'
        })
        .eq('id', chatId)

      if (updateChatError) {
        console.error('Failed to update chat session:', updateChatError)
        throw new Error('Gagal update chat session')
      }

      setToast({ message: 'Chat diterima! Kredit sudah ditransfer.', type: 'success' })
      
      // Refresh data after short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (err: any) {
      const appError = handleError(err)
      setToast({ message: appError.userMessage, type: 'error' })
    } finally {
      setAcceptingChatId(null)
    }
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

  const updatePricing = (id: string, newPriceValue: number) => {
    setPricing(pricing.map(p => p.id === id ? { ...p, price_credits: newPriceValue } : p))
  }

  const savePricing = async () => {
    try {
      for (const p of pricing) {
        const { error } = await supabase
          .from('creator_pricing')
          .update({ price_credits: p.price_credits })
          .eq('id', p.id)
        if (error) throw error
      }
      alert('✅ Harga berhasil disimpan!')
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message)
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
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          sender_id: senderId,
          creator_id: profile?.id,
          duration_hours: 0,
          credits_paid: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          is_accepted: true,
          accepted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!error && session) {
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

    await supabase
      .from('spam_messages')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', messageId)

    setSpamMessages(spamMessages.filter(m => m.id !== messageId))

    if (action === 'accept') {
      alert('Pesan diterima! Chat 10 menit telah dibuat.')
      window.location.reload()
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
      .update({ available_balance: availableBalance - amount })
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

  const handleDeleteExpiredChat = async (chatId: string) => {
    if (!confirm('Hapus chat ini?')) return
    await supabase.from('chat_sessions').delete().eq('id', chatId)
    setExpiredChats(prev => prev.filter(c => c.id !== chatId))
  }

  const copyProfileLink = () => {
    const link = `${window.location.origin}/profile/${profile?.username}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pending</span>
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Completed</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">{status}</span>
    }
  }

  if (loading) {
    return <FanonymLoader text="Memuat dashboard..." />
  }

  const withdrawCalc = withdrawAmount ? calculateWithdraw(parseFloat(withdrawAmount)) : null

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white relative">
      {/* Galaxy Background */}
      <GalaxyBackground />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard/creator" className="font-black text-2xl bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>

          {/* Center Tabs */}
          <div className="hidden md:flex items-center bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-full p-1">
            <button 
              onClick={() => setNavTab('dashboard')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                navTab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setNavTab('analytics')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                navTab === 'analytics' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setNavTab('history')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                navTab === 'history' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              History
            </button>
          </div>

          {/* Right - Notification */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-zinc-800/50 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <svg className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <NotificationBadge 
                count={pendingChats.length + unreadInboxCount + notifications.length}
                size="sm"
                color="red"
              />
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-zinc-700 flex justify-between items-center">
                  <h4 className="font-semibold">Notifikasi</h4>
                  <button onClick={() => setShowNotifications(false)} className="text-zinc-500 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && pendingChats.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8 text-sm">Tidak ada notifikasi</p>
                  ) : (
                    <div className="divide-y divide-zinc-800">
                      {pendingChats.length > 0 && (
                        <div className="p-3 hover:bg-zinc-800/50 cursor-pointer" onClick={() => { setNavTab('dashboard'); setActiveTab('pending'); setShowNotifications(false); }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                              <span className="text-yellow-400 text-sm">💬</span>
                            </div>
                            <div>
                              <p className="text-sm">{pendingChats.length} pesan pending</p>
                              <p className="text-xs text-zinc-500">Menunggu response</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-3 hover:bg-zinc-800/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              notif.type === 'withdraw_success' ? 'bg-green-500/20' :
                              notif.type === 'withdraw_failed' ? 'bg-red-500/20' :
                              'bg-purple-500/20'
                            }`}>
                              <span className="text-sm">
                                {notif.type === 'withdraw_success' ? '✅' :
                                 notif.type === 'withdraw_failed' ? '❌' : '💬'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm">{notif.message}</p>
                              <p className="text-xs text-zinc-500">
                                {new Date(notif.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Analytics Tab */}
        {navTab === 'analytics' && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">📊 Analytics Pendapatan</h2>
            
            {/* Period Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Today */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400 text-sm">Hari Ini</span>
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-400 mb-1">{analyticsData.today}</p>
                <p className="text-zinc-500 text-sm">Kredit</p>
                <p className="text-zinc-600 text-xs mt-2">≈ Rp {(analyticsData.today * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-zinc-500 text-sm">{analyticsData.todayChats} chat sessions</p>
                </div>
              </div>

              {/* This Week */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400 text-sm">7 Hari Terakhir</span>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-400 mb-1">{analyticsData.week}</p>
                <p className="text-zinc-500 text-sm">Kredit</p>
                <p className="text-zinc-600 text-xs mt-2">≈ Rp {(analyticsData.week * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-zinc-500 text-sm">{analyticsData.weekChats} chat sessions</p>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400 text-sm">30 Hari Terakhir</span>
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-yellow-400 mb-1">{analyticsData.month}</p>
                <p className="text-zinc-500 text-sm">Kredit</p>
                <p className="text-zinc-600 text-xs mt-2">≈ Rp {(analyticsData.month * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-zinc-500 text-sm">{analyticsData.monthChats} chat sessions</p>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">💰 Ringkasan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-xs mb-1">Total Pendapatan</p>
                  <p className="text-xl font-bold text-white">{earnings?.total_earned || 0}</p>
                  <p className="text-zinc-600 text-xs">Kredit</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-xs mb-1">Saldo Tersedia</p>
                  <p className="text-xl font-bold text-green-400">{earnings?.available_balance || 0}</p>
                  <p className="text-zinc-600 text-xs">Kredit</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-xs mb-1">Total Withdrawn</p>
                  <p className="text-xl font-bold text-purple-400">{earnings?.withdrawn || 0}</p>
                  <p className="text-zinc-600 text-xs">Kredit</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-xs mb-1">Total Anon</p>
                  <p className="text-xl font-bold text-white">{totalAnons}</p>
                  <p className="text-zinc-600 text-xs">Senders</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {navTab === 'history' && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">📜 Riwayat Withdraw</h2>
            
            {withdrawals.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">💸</div>
                <p className="text-zinc-400">Belum ada riwayat withdraw</p>
                <button 
                  onClick={() => { setNavTab('dashboard'); setActiveTab('withdraw'); }}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors"
                >
                  Tarik Saldo Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((w) => (
                  <div key={w.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          w.status === 'completed' ? 'bg-green-500/20' :
                          w.status === 'pending' ? 'bg-yellow-500/20' :
                          'bg-red-500/20'
                        }`}>
                          {w.status === 'completed' ? (
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : w.status === 'pending' ? (
                            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{w.amount} Kredit</p>
                          <p className="text-zinc-500 text-sm">{w.bank_name} • {w.account_number}</p>
                        </div>
                      </div>
                      {getStatusBadge(w.status)}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                      <p className="text-zinc-500 text-sm">
                        {new Date(w.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        ≈ Rp {(w.amount * KREDIT_TO_IDR * (1 - PLATFORM_FEE)).toLocaleString('id-ID')} (setelah fee 20%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dashboard Tab */}
        {navTab === 'dashboard' && (
          <>
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            {/* Avatar with online indicator */}
            <div className="relative">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/50"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {profile?.full_name?.[0] || profile?.username?.[0] || '?'}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0c0a14]"></span>
            </div>

            {/* Name & Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <span className="text-purple-400">Halo,</span> {profile?.full_name || profile?.username}!
                {profile?.is_verified && (
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-zinc-400 text-sm">@{profile?.username}</span>
                <span className="text-zinc-600">•</span>
                {profile?.bio && (
                  <span className="px-3 py-0.5 bg-zinc-800 text-zinc-300 rounded-full text-xs border border-zinc-700">
                    {profile.bio}
                  </span>
                )}
                {profile?.is_verified && (
                  <span className="px-3 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
                    VERIFIED CREATOR
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              href={`/profile/${profile?.username}`}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors border border-zinc-700"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <Link 
              href="/settings"
              className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors border border-zinc-700"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors border border-zinc-700"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Creator Mode Toggle */}
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-zinc-700">
              <div className="text-right">
                <p className="text-sm font-medium">Creator Mode</p>
                <p className="text-xs text-green-400">ACTIVE</p>
              </div>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Pendapatan */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute right-4 top-4 text-zinc-800">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Pendapatan</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{filteredEarnings}</p>
            <p className="text-xs text-zinc-500 mt-1">Kredit</p>
          </div>

          {/* Saldo */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute right-4 top-4 text-zinc-800">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Saldo</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{earnings?.available_balance || 0}</p>
            <p className="text-xs text-zinc-500 mt-1">≈ Rp {((earnings?.available_balance || 0) * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
          </div>

          {/* Chat Aktif */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute right-4 top-4 text-zinc-800">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Chat Aktif</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{activeChats.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Sessions</p>
          </div>

          {/* Total Anon */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute right-4 top-4 text-zinc-800">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Anon</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{totalAnons}</p>
            <p className="text-xs text-zinc-500 mt-1">Unique senders</p>
          </div>
        </div>

        {/* Profile Link Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Link Profil Kamu</h3>
                <p className="text-sm text-zinc-400">Bagikan link ini ke fans untuk menerima pesan anonim & dukungan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-purple-400 font-mono bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
                fanonym.vercel.app/profile/{profile?.username}
              </span>
              <button
                onClick={copyProfileLink}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Pending
            {pendingChats.length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingChats.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'inbox'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Inbox
            {unreadInboxCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadInboxCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'expired'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Expired
            <span className="text-xs opacity-60">{expiredChats.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('spam')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'spam'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Spam
            <span className="text-xs opacity-60">{spamMessages.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Set Harga
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'withdraw'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-semibold text-purple-400">Chat Menunggu Accept</h3>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
                      Action Required
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Accept chat untuk memulai countdown waktu. Keamanan pesan tetap anonim sampai Anda merespons. 
                    Jangan biarkan fans menunggu terlalu lama!
                  </p>
                </div>
              </div>

              {pendingChats.length === 0 ? (
                <div className="flex items-center gap-2 text-yellow-400/70 bg-yellow-500/10 px-4 py-3 rounded-xl border border-yellow-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">Tidak ada chat pending saat ini. Anda akan menerima notifikasi jika ada pesan baru.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingChats.map((chat) => {
                    const senderName = chat.sender?.full_name || chat.sender?.username || 'Anonim'
                    return (
                      <div key={chat.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {chat.sender?.avatar_url ? (
                              <img src={chat.sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                                <span className="text-purple-400 font-medium">{senderName[0]?.toUpperCase()}</span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{senderName}</p>
                              <p className="text-xs text-zinc-500">
                                {chat.duration_hours}jam • {chat.credits_paid} kredit
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAcceptChat(chat.id, chat.duration_hours, chat.credits_paid, chat.sender_id)}
                            disabled={acceptingChatId === chat.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {acceptingChatId === chat.id ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Accepting...
                              </>
                            ) : (
                              'Accept Chat'
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Inbox Tab */}
          {activeTab === 'inbox' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Chat Aktif</h3>
              {activeChats.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Tidak ada chat aktif</p>
              ) : (
                <div className="space-y-3">
                  {activeChats.map((chat) => {
                    const isUnread = hasUnreadMessages(chat)
                    const senderName = chat.sender?.full_name || chat.sender?.username || 'Anonim'
                    return (
                      <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        className={`block bg-zinc-800/50 border rounded-xl p-4 hover:bg-zinc-800 transition-colors ${
                          isUnread ? 'border-green-500/50' : 'border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {chat.sender?.avatar_url ? (
                                <img src={chat.sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                                  <span className="text-purple-400 font-medium">{senderName[0]?.toUpperCase()}</span>
                                </div>
                              )}
                              {isUnread && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px]">
                                  💬
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {senderName}
                                {isUnread && (
                                  <span className="text-xs text-green-400">• Pesan baru</span>
                                )}
                              </p>
                              <p className="text-xs text-zinc-500">
                                ⏱️ {getTimeLeft(chat.expires_at)} tersisa
                              </p>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Expired Tab */}
          {activeTab === 'expired' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Chat Expired</h3>
              {expiredChats.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Tidak ada chat expired</p>
              ) : (
                <div className="space-y-3">
                  {expiredChats.map((chat) => {
                    const senderName = chat.sender?.full_name || chat.sender?.username || 'Anonim'
                    return (
                      <div key={chat.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {chat.sender?.avatar_url ? (
                              <img src={chat.sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover opacity-50" />
                            ) : (
                              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                                <span className="text-zinc-500 font-medium">{senderName[0]?.toUpperCase()}</span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-zinc-400">{senderName}</p>
                              <p className="text-xs text-zinc-600">{chat.duration_hours}jam • {chat.credits_paid} kredit</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/chat/${chat.id}`}
                              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                            >
                              Lihat
                            </Link>
                            <button
                              onClick={() => handleDeleteExpiredChat(chat.id)}
                              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Spam Tab */}
          {activeTab === 'spam' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Pesan Spam (Gratis)</h3>
              {spamMessages.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Tidak ada pesan spam</p>
              ) : (
                <div className="space-y-3">
                  {spamMessages.map((msg) => (
                    <div key={msg.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                      <p className="text-sm mb-3">{msg.content}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpamAction(msg.id, msg.sender_id, 'accept')}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          ✓ Terima (Chat 10 menit)
                        </button>
                        <button
                          onClick={() => handleSpamAction(msg.id, msg.sender_id, 'reject')}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-lg transition-colors"
                        >
                          ✕ Tolak
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
            <div>
              <h3 className="text-lg font-semibold mb-4">Pengaturan Harga Chat</h3>
              
              <div className="space-y-3 mb-6">
                {pricing.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                    <div className="flex-1">
                      <p className="font-medium">{p.duration_hours} Jam</p>
                    </div>
                    <input
                      type="number"
                      value={p.price_credits}
                      onChange={(e) => updatePricing(p.id, parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-center"
                    />
                    <span className="text-zinc-400 text-sm">Kredit</span>
                    <button
                      onClick={() => deletePricing(p.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700">
                <input
                  type="number"
                  placeholder="Durasi (jam)"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-32 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Harga (kredit)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-32 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg"
                />
                <button
                  onClick={addPricing}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
                >
                  + Tambah
                </button>
              </div>

              {pricing.length > 0 && (
                <button
                  onClick={savePricing}
                  className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
                >
                  💾 Simpan Harga
                </button>
              )}
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Tarik Saldo</h3>
              
              <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-300">
                  Saldo tersedia: <span className="font-bold text-purple-400">{earnings?.available_balance || 0} Kredit</span>
                  <span className="text-purple-400/60 ml-2">
                    (≈ Rp {((earnings?.available_balance || 0) * KREDIT_TO_IDR).toLocaleString('id-ID')})
                  </span>
                </p>
              </div>

              <div className="grid gap-4 mb-6">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Jumlah Kredit</label>
                  <input
                    type="number"
                    placeholder={`Min. ${MIN_WITHDRAW} kredit`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Nama Bank</label>
                  <input
                    type="text"
                    placeholder="BCA, Mandiri, BNI, dll"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    placeholder="Nama sesuai buku rekening"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              {withdrawCalc && (
                <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Jumlah withdraw</span>
                    <span>{withdrawAmount} Kredit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Platform fee (20%)</span>
                    <span className="text-red-400">- Rp {(parseFloat(withdrawAmount) * KREDIT_TO_IDR * PLATFORM_FEE).toLocaleString('id-ID')}</span>
                  </div>
                  {withdrawCalc.fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Biaya transfer</span>
                      <span className="text-red-400">- Rp {withdrawCalc.fee.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-zinc-700 font-medium">
                    <span>Total diterima</span>
                    <span className="text-green-400">Rp {withdrawCalc.netAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
              >
                {withdrawLoading ? 'Memproses...' : 'Request Withdraw'}
              </button>

              {/* Link to History */}
              {withdrawals.length > 0 && (
                <button 
                  onClick={() => setNavTab('history')}
                  className="w-full mt-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lihat Riwayat Withdraw ({withdrawals.length})
                </button>
              )}
            </div>
          )}
        </div>
          </>
        )}
      </main>

      {/* Help Button */}
      <HelpButton subject="Butuh Bantuan - Creator Dashboard" />
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
