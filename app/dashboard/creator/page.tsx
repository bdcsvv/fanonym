'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FanonymLoader from '@/app/components/FanonymLoader'
import HelpButton from '@/app/components/HelpButton'
import GalaxyBackground from '@/app/components/GalaxyBackground'
import Toast, { useToast } from '@/app/components/Toast'
import NotificationBadge from '@/app/components/NotificationBadge'
import NotificationBell from '@/app/components/NotificationBell'
import { handleError } from '@/app/lib/errorHandler'
import { sendNotification } from '@/app/lib/notifications'
import { sendEmail } from '@/app/lib/email'

export default function CreatorDashboard() {
  const router = useRouter()
  const { toast, ToastContainer } = useToast()
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
  
  // Notifications
  const [notifications, setNotifications] = useState<any[]>([])
  
  // Analytics stats
  const [analyticsData, setAnalyticsData] = useState<{
    today: number
    week: number
    month: number
    todayChats: number
    weekChats: number
    monthChats: number
    todayPayments: number
    weekPayments: number
    monthPayments: number
    topSenders: { name: string; avatar?: string; username: string; totalCredits: number; chatCount: number }[]
    avgPerChat: number
    acceptRate: number
  }>({ today: 0, week: 0, month: 0, todayChats: 0, weekChats: 0, monthChats: 0, todayPayments: 0, weekPayments: 0, monthPayments: 0, topSenders: [], avgPerChat: 0, acceptRate: 0 })
  
  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [selectedExpired, setSelectedExpired] = useState<string[]>([])

  const KREDIT_TO_IDR = 10000
  const PLATFORM_FEE = 0.04
  const TRANSFER_FEE = 3500
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
        .select('*, sender:sender_id(id, username, full_name, avatar_url), messages(id, sender_id, is_read, created_at)')
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

      // Calculate in-chat payment earnings from messages
      let todayPayments = 0, weekPayments = 0, monthPayments = 0
      acceptedChats.forEach((c: any) => {
        (c.messages || []).forEach((m: any) => {
          try {
            const parsed = JSON.parse(m.content)
            if (parsed.type === 'payment_request' && parsed.status === 'paid') {
              const msgDate = new Date(m.created_at)
              const amount = parsed.amount || 0
              if (msgDate >= todayStart) todayPayments += amount
              if (msgDate >= weekStart) weekPayments += amount
              if (msgDate >= monthStart) monthPayments += amount
            }
          } catch {}
        })
      })

      // Top senders - aggregate by sender
      const senderMap: Record<string, { name: string; avatar?: string; username: string; totalCredits: number; chatCount: number }> = {}
      acceptedChats.forEach((c: any) => {
        const sid = c.sender_id
        if (!senderMap[sid]) {
          senderMap[sid] = {
            name: c.sender?.full_name || c.sender?.username || 'Anonim',
            avatar: c.sender?.avatar_url,
            username: c.sender?.username || '',
            totalCredits: 0,
            chatCount: 0,
          }
        }
        senderMap[sid].totalCredits += (c.credits_paid || 0)
        senderMap[sid].chatCount += 1
      })
      const topSenders = Object.values(senderMap)
        .sort((a, b) => b.totalCredits - a.totalCredits)
        .slice(0, 5)

      // Accept rate
      const totalRequests = (chatsData || []).filter((c: any) => c.credits_paid > 0).length
      const acceptRate = totalRequests > 0 ? Math.round((acceptedChats.length / totalRequests) * 100) : 0

      // Average per chat
      const totalFromChats = acceptedChats.reduce((sum: number, c: any) => sum + (c.credits_paid || 0), 0)
      const avgPerChat = acceptedChats.length > 0 ? Math.round(totalFromChats / acceptedChats.length) : 0

      setAnalyticsData({
        today: todayEarnings + todayPayments,
        week: weekEarnings + weekPayments,
        month: monthEarnings + monthPayments,
        todayChats: todayChats.length,
        weekChats: weekChats.length,
        monthChats: monthChats.length,
        todayPayments,
        weekPayments,
        monthPayments,
        topSenders,
        avgPerChat,
        acceptRate,
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

    // Real-time subscription for new messages
    const messagesChannel = supabase
      .channel('creator-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as any
          // Update the active chats to show "Pesan baru"
          setActiveChats(prev => prev.map(chat => {
            if (chat.id === newMsg.session_id) {
              return {
                ...chat,
                messages: [...(chat.messages || []), newMsg]
              }
            }
            return chat
          }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_sessions' },
        () => {
          // New chat request - reload pending
          getData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
    }
  }, [router])

  // Helper function to check if chat has unread messages
  // True if there are messages from sender (not creator) that are unread
  const hasUnreadMessages = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) return false
    return chat.messages.some((m: any) => m.sender_id !== profile?.id && m.is_read === false)
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
        toast.error('Chat ini sudah di-accept sebelumnya!')
        // Refresh data
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: chatsData } = await supabase
            .from('chat_sessions')
            .select('*, sender:sender_id(id, username, full_name, avatar_url), messages(id, sender_id, is_read, created_at)')
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
        toast.error('Error: Sender tidak memiliki cukup kredit!')
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

      toast.success('Chat diterima! Kredit sudah ditransfer.')

      // Notify sender that chat was accepted
      await sendNotification({
        userId: senderId,
        type: 'chat_accepted',
        title: 'Chat diterima! 🎉',
        message: `${profile?.full_name || profile?.username} menerima chat kamu. Mulai chat sekarang!`,
        link: `/chat/${chatId}`,
      })

      // Email sender
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('email, full_name, username')
        .eq('id', senderId)
        .single()

      if (senderProfile?.email) {
        await sendEmail({
          to: senderProfile.email,
          type: 'chat_accepted',
          data: {
            name: senderProfile.full_name || senderProfile.username,
            creatorName: profile?.full_name || profile?.username,
            chatUrl: `${window.location.origin}/chat/${chatId}`,
          },
        })
      }
      
      // Refresh data after short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (err: any) {
      const appError = handleError(err)
      toast.error(appError.userMessage)
    } finally {
      setAcceptingChatId(null)
    }
  }

  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
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
      toast.success('Harga berhasil disimpan')
    } catch (err: any) {
      toast.error('Gagal menyimpan harga')
    }
  }

  const addPricing = async () => {
    const duration = parseInt(newDuration)
    const price = parseInt(newPrice)
    
    if (!duration || !price) {
      toast.warning('Isi durasi dan harga terlebih dahulu')
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
      toast.success('Pesan diterima!', 'Chat 10 menit telah dibuat')
      window.location.reload()
    }
  }

  const calculateWithdraw = (kredits: number) => {
    const grossAmount = kredits * KREDIT_TO_IDR * (1 - PLATFORM_FEE)
    const fee = TRANSFER_FEE
    const netAmount = grossAmount - fee
    return { grossAmount, fee, netAmount }
  }

  const handleWithdraw = async () => {
    // Check if creator is verified
    if (!profile?.is_verified) {
      toast.warning('Verifikasi diperlukan', 'Verifikasi KTP dan selfie di menu Settings → Keamanan')
      return
    }

    const amount = parseFloat(withdrawAmount)
    
    if (!amount || amount < MIN_WITHDRAW) {
      toast.warning(`Minimal withdraw ${MIN_WITHDRAW} kredit`)
      return
    }

    if (!bankName || !accountNumber || !accountName) {
      toast.warning('Lengkapi semua data rekening')
      return
    }

    const availableBalance = earnings?.available_balance || 0
    if (amount > availableBalance) {
      toast.warning('Saldo tidak cukup')
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
      toast.error('Gagal membuat request withdraw')
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

    // Notify admin via email
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'rizkinurulloh1124@gmail.com',
          type: 'admin_withdraw_alert',
          data: {
            username: profile?.username,
            amount: amount,
            bank: bankName,
            time: new Date().toLocaleString('id-ID')
          }
        })
      })
    } catch (e) { /* silent fail */ }

    toast.success('Withdraw Berhasil!', `Rp ${netAmount.toLocaleString('id-ID')} akan diproses 1-3 hari kerja`)
  }

  const handleDeleteExpiredChat = async (chatId: string) => {
    if (!confirm('Hapus chat ini?')) return
    await supabase.from('chat_sessions').delete().eq('id', chatId)
    setExpiredChats(prev => prev.filter(c => c.id !== chatId))
  }

  const copyProfileLink = () => {
    const link = `${window.location.origin}/${profile?.username}`
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

  // Combine navTab and activeTab into single menu system
  const [menuItem, setMenuItem] = useState<string>('pending')

  // Map old tabs to new menu
  const handleMenuClick = (item: string) => {
    setMenuItem(item)
    // Keep backward compat with existing tab logic
    if (['pending', 'inbox', 'expired', 'spam', 'pricing', 'withdraw'].includes(item)) {
      setActiveTab(item as any)
      setNavTab('dashboard')
    } else if (item === 'analytics') {
      setNavTab('analytics')
    } else if (item === 'history') {
      setNavTab('history')
    }
  }

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white relative">
      <ToastContainer />
      <GalaxyBackground />

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0e0c18]/95 backdrop-blur-xl border-r border-zinc-800/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          {/* Logo */}
          <div className="p-5 border-b border-zinc-800/60">
            <Link href="/dashboard/creator" className="font-black italic text-2xl bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]">
              fanonym
            </Link>
          </div>

          {/* Profile Mini */}
          <div className="p-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {profile?.full_name?.[0] || profile?.username?.[0] || '?'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0e0c18]"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{profile?.full_name || profile?.username}</p>
                <p className="text-xs text-zinc-500 truncate">@{profile?.username}</p>
              </div>
              {profile?.is_verified && (
                <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold px-3 pt-2 pb-1">Pesan</p>
            
            <button onClick={() => { handleMenuClick('pending'); setSidebarOpen(false) }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${menuItem === 'pending' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              <div className="flex items-center gap-3">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Pending</span>
              </div>
              {pendingChats.length > 0 && <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1.5">{pendingChats.length}</span>}
            </button>

            <button onClick={() => { handleMenuClick('inbox'); setSidebarOpen(false) }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${menuItem === 'inbox' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              <div className="flex items-center gap-3">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <span>Inbox</span>
              </div>
              {unreadInboxCount > 0 && <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1.5">{unreadInboxCount}</span>}
            </button>

            <button onClick={() => { handleMenuClick('expired'); setSidebarOpen(false) }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${menuItem === 'expired' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              <div className="flex items-center gap-3">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span>Expired</span>
              </div>
              {expiredChats.length > 0 && <span className="text-xs text-zinc-500">{expiredChats.length}</span>}
            </button>

            <button onClick={() => { handleMenuClick('spam'); setSidebarOpen(false) }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${menuItem === 'spam' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              <div className="flex items-center gap-3">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                <span>Spam</span>
              </div>
              {spamMessages.length > 0 && <span className="text-xs text-zinc-500">{spamMessages.length}</span>}
            </button>

            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold px-3 pt-4 pb-1">Keuangan</p>

            <button onClick={() => { handleMenuClick('pricing'); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${menuItem === 'pricing' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              <span>Set Harga</span>
            </button>

            <button onClick={() => { handleMenuClick('withdraw'); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${menuItem === 'withdraw' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span>Withdraw</span>
            </button>

            <button onClick={() => { handleMenuClick('history'); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${menuItem === 'history' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Riwayat</span>
            </button>

            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold px-3 pt-4 pb-1">Lainnya</p>

            <button onClick={() => { handleMenuClick('analytics'); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${menuItem === 'analytics' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span>Analytics</span>
            </button>

            <Link href={`/profile/${profile?.username}`} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span>Profil Saya</span>
            </Link>

            <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>Settings</span>
            </Link>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-zinc-800/60">
            <button 
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 min-h-screen md:ml-0">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 bg-[#0c0a14]/80 backdrop-blur-xl border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-zinc-800 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="text-lg font-semibold capitalize">
                {menuItem === 'pricing' ? 'Set Harga' : menuItem === 'withdraw' ? 'Withdraw' : menuItem === 'history' ? 'Riwayat' : menuItem}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Profile Link Copy */}
              <button
                onClick={copyProfileLink}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg border border-zinc-700 transition-colors"
              >
                <span className="text-purple-400 font-mono">fanonym.id/{profile?.username}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                {copied && <span className="text-green-400">Copied!</span>}
              </button>
              <NotificationBell userId={profile?.id} />
            </div>
          </div>

          <div className="p-6 max-w-5xl">
            {/* Stats Cards - Show on main pages */}
            {['pending', 'inbox', 'expired', 'spam'].includes(menuItem) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute right-3 top-3 text-zinc-800">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Total Pendapatan</span>
                  <p className="text-2xl font-bold text-purple-400 mt-1">{filteredEarnings}</p>
                  <p className="text-xs text-zinc-500">Kredit</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute right-3 top-3 text-zinc-800">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Saldo</span>
                  <p className="text-2xl font-bold text-purple-400 mt-1">{earnings?.available_balance || 0}</p>
                  <p className="text-xs text-zinc-500">≈ Rp {((earnings?.available_balance || 0) * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute right-3 top-3 text-zinc-800">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Chat Aktif</span>
                  <p className="text-2xl font-bold text-purple-400 mt-1">{activeChats.length}</p>
                  <p className="text-xs text-zinc-500">Sessions</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute right-3 top-3 text-zinc-800">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Total Anon</span>
                  <p className="text-2xl font-bold text-purple-400 mt-1">{totalAnons}</p>
                  <p className="text-xs text-zinc-500">Unique senders</p>
                </div>
              </div>
            )}

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
                  {analyticsData.todayPayments > 0 && (
                    <p className="text-zinc-600 text-xs mt-1">💸 +{analyticsData.todayPayments} dari in-chat payments</p>
                  )}
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
                  {analyticsData.weekPayments > 0 && (
                    <p className="text-zinc-600 text-xs mt-1">💸 +{analyticsData.weekPayments} dari in-chat payments</p>
                  )}
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
                  {analyticsData.monthPayments > 0 && (
                    <p className="text-zinc-600 text-xs mt-1">💸 +{analyticsData.monthPayments} dari in-chat payments</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
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

            {/* Extra Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs">Accept Rate</p>
                    <p className="text-2xl font-bold text-blue-400">{analyticsData.acceptRate}%</p>
                  </div>
                </div>
                <p className="text-zinc-600 text-xs">Persentase chat request yang diterima</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg">💎</span>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs">Rata-rata per Chat</p>
                    <p className="text-2xl font-bold text-orange-400">{analyticsData.avgPerChat}</p>
                  </div>
                </div>
                <p className="text-zinc-600 text-xs">Kredit rata-rata dari unlock chat</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg">💸</span>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs">In-Chat Payments (30h)</p>
                    <p className="text-2xl font-bold text-pink-400">{analyticsData.monthPayments}</p>
                  </div>
                </div>
                <p className="text-zinc-600 text-xs">Kredit dari payment request di chat</p>
              </div>
            </div>

            {/* Top Senders */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">🏆 Top Senders</h3>
              {analyticsData.topSenders.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-6">Belum ada data sender</p>
              ) : (
                <div className="space-y-3">
                  {analyticsData.topSenders.map((sender, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 text-sm font-bold text-purple-400 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-shrink-0">
                        {sender.avatar ? (
                          <img src={sender.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-400 font-medium">
                            {sender.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sender.name}</p>
                        <p className="text-zinc-500 text-xs">@{sender.username} • {sender.chatCount} chat{sender.chatCount > 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-green-400">{sender.totalCredits}</p>
                        <p className="text-zinc-600 text-xs">Kredit</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                        ≈ Rp {(w.amount * KREDIT_TO_IDR * (1 - PLATFORM_FEE)).toLocaleString('id-ID')} (setelah fee 4%)
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
              {expiredChats.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Tidak ada chat expired</p>
              ) : (
                <>
                  {/* Select All Bar */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div
                        onClick={() => {
                          const allIds = expiredChats.map(c => c.id)
                          setSelectedExpired(prev => prev.length === allIds.length ? [] : allIds)
                        }}
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer transition-colors ${
                          selectedExpired.length === expiredChats.length && expiredChats.length > 0
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-zinc-600 hover:border-purple-500'
                        }`}
                      >
                        {selectedExpired.length === expiredChats.length && expiredChats.length > 0 && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-zinc-400">
                        {selectedExpired.length > 0 ? `${selectedExpired.length} dipilih` : `Pilih Semua (${expiredChats.length})`}
                      </span>
                    </label>
                    {selectedExpired.length > 0 && (
                      <button
                        onClick={async () => {
                          if (!confirm(`Hapus ${selectedExpired.length} chat?`)) return
                          await Promise.all(selectedExpired.map(id => supabase.from('chat_sessions').delete().eq('id', id)))
                          setExpiredChats(prev => prev.filter(c => !selectedExpired.includes(c.id)))
                          setSelectedExpired([])
                        }}
                        className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                      >
                        Hapus {selectedExpired.length} Chat
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {expiredChats.map((chat) => {
                      const senderName = chat.sender?.full_name || chat.sender?.username || 'Anonim'
                      const isSelected = selectedExpired.includes(chat.id)
                      return (
                        <div key={chat.id} className={`bg-zinc-800/50 border rounded-xl p-4 transition-colors ${isSelected ? 'border-purple-500/40 bg-purple-600/5' : 'border-zinc-700'}`}>
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <div
                              onClick={() => setSelectedExpired(prev => isSelected ? prev.filter(id => id !== chat.id) : [...prev, chat.id])}
                              className={`w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer flex-shrink-0 transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-zinc-600 hover:border-purple-500'}`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                              {chat.sender?.avatar_url ? (
                                <img src={chat.sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover opacity-50" />
                              ) : (
                                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-zinc-500 font-medium">{senderName[0]?.toUpperCase()}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-zinc-400">{senderName}</p>
                                <p className="text-xs text-zinc-600">{chat.duration_hours}jam • {chat.credits_paid} kredit</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/chat/${chat.id}`} className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors">Lihat</Link>
                              <button onClick={() => handleDeleteExpiredChat(chat.id)} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-colors">Hapus</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Spam Tab */}
          {activeTab === 'spam' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <span className="text-lg">📨</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pesan Gratis</h3>
                  <p className="text-xs text-zinc-500">Pesan tanpa bayar dari fans</p>
                </div>
              </div>
              {spamMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-4">
                    <span className="text-2xl">📭</span>
                  </div>
                  <p className="text-zinc-400 font-medium mb-1">Belum ada pesan gratis</p>
                  <p className="text-zinc-600 text-sm">Pesan dari fans yang dikirim tanpa kredit akan muncul di sini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {spamMessages.map((msg) => (
                    <div key={msg.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 hover:border-purple-500/20 transition-colors">
                      <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{msg.content}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpamAction(msg.id, msg.sender_id, 'accept')}
                          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-xl transition-colors"
                        >
                          ✓ Terima
                        </button>
                        <button
                          onClick={() => handleSpamAction(msg.id, msg.sender_id, 'reject')}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl transition-colors"
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
                    <div className="text-right">
                      <span className="text-zinc-400 text-sm">Kredit</span>
                      <p className="text-zinc-500 text-xs">≈ Rp {(p.price_credits * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
                    </div>
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
                  className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
                >
                  Simpan Harga
                </button>
              )}
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Tarik Saldo</h3>

              {!profile?.is_verified && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-yellow-400 font-medium text-sm mb-1">Verifikasi Diperlukan</p>
                      <p className="text-zinc-400 text-sm">Anda harus verifikasi KTP dan selfie sebelum bisa withdraw. Fitur lain seperti set harga dan terima pesan tetap bisa digunakan.</p>
                      <Link href="/settings" className="text-purple-400 text-sm hover:text-purple-300 mt-2 inline-block">
                        → Verifikasi Sekarang
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
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
                    <span className="text-zinc-400">Platform fee (4%)</span>
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
                  onClick={() => { handleMenuClick('history') }}
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
          </div>
        </main>
      </div>

      {/* Help Button */}
      <HelpButton subject="Butuh Bantuan - Creator Dashboard" />
    </div>
  )
}
