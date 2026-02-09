'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import ReportBlockModal from '@/app/components/ReportBlockModal'
import FanonymLoader from '@/app/components/FanonymLoader'
import Toast from '@/app/components/Toast'
import { calculateTimeLeft, getTimeWarningLevel, getTimeColorClass } from '@/app/lib/timerUtils'
import { validateImage, validateMessage } from '@/app/lib/validation'
import { compressImage } from '@/app/lib/mobileUtils'
import { handleError } from '@/app/lib/errorHandler'

export default function ChatRoom() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [timeWarningLevel, setTimeWarningLevel] = useState<'safe' | 'warning' | 'critical' | 'expired'>('safe')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDesc, setPaymentDesc] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [creatorPricing, setCreatorPricing] = useState<any[]>([])
  const [extendLoading, setExtendLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setCurrentUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setCurrentProfile(profileData)

      const { data: sessionData, error } = await supabase
        .from('chat_sessions')
        .select('*, creator:creator_id(id, username, full_name, avatar_url), sender:sender_id(id, username, full_name, avatar_url)')
        .eq('id', sessionId)
        .single()

      if (error || !sessionData) {
        alert('Chat session tidak ditemukan')
        router.back()
        return
      }

      if (sessionData.sender_id !== user.id && sessionData.creator_id !== user.id) {
        alert('Anda tidak memiliki akses ke chat ini')
        router.back()
        return
      }

      setSession(sessionData)
      setIsCreator(sessionData.creator_id === user.id)

      const { data: pricingData } = await supabase
        .from('creator_pricing')
        .select('*')
        .eq('creator_id', sessionData.creator_id)
        .order('price_credits', { ascending: true })
      
      setCreatorPricing(pricingData || [])

      const otherId = sessionData.sender_id === user.id ? sessionData.creator_id : sessionData.sender_id
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .single()
      setOtherUser(otherProfile)

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      setMessages(messagesData || [])

      setLoading(false)
    }

    init()

    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!session || !session.expires_at) return

    const updateTimer = () => {
      const { formatted, isExpired: expired } = calculateTimeLeft(session.expires_at)
      const warningLevel = getTimeWarningLevel(session.expires_at)
      
      setTimeLeft(formatted)
      setTimeWarningLevel(warningLevel)
      
      if (expired) {
        // Optionally reload or show expired UI
        setToast({ message: 'Chat session telah expired', type: 'info' })
      }
    }

    // Update immediately
    updateTimer()
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [session])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Validate message
    const validation = validateMessage(newMessage)
    if (!validation.isValid) {
      setToast({ message: Object.values(validation.errors)[0], type: 'error' })
      return
    }

    try {
      const { error } = await supabase.from('messages').insert({
        session_id: sessionId,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        is_read: false
      })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      const appError = handleError(error)
      setToast({ message: appError.userMessage, type: 'error' })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImage(file, 'message')
    if (!validation.isValid) {
      setToast({ message: Object.values(validation.errors)[0], type: 'error' })
      return
    }

    setUploading(true)

    try {
      // Compress image before upload
      const compressed = await compressImage(file, 1920, 1920, 0.8)
      
      const fileExt = compressed.name.split('.').pop()
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, compressed)

      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(fileName)

      const mediaType = file.type.startsWith('video') ? 'video' : 'image'
      const content = JSON.stringify({
        type: 'media',
        media_type: mediaType,
        url: publicUrl.publicUrl
      })

      await supabase.from('messages').insert({
        session_id: sessionId,
        sender_id: currentUser.id,
        content: content,
        is_read: false
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal upload file')
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendPaymentRequest = async () => {
    const amount = parseInt(paymentAmount)
    if (!amount || amount < 1) {
      alert('Masukkan jumlah kredit yang valid')
      return
    }

    const content = JSON.stringify({
      type: 'payment_request',
      amount: amount,
      description: paymentDesc || 'Payment request',
      status: 'pending'
    })

    await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: currentUser.id,
      content: content,
      is_read: false
    })

    setShowPaymentModal(false)
    setPaymentAmount('')
    setPaymentDesc('')
  }

  const handlePayment = async (messageId: string, amount: number) => {
    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', currentUser.id)
      .single()

    if (!credits || credits.balance < amount) {
      alert('Kredit tidak cukup! Silakan top up dulu.')
      return
    }

    await supabase
      .from('credits')
      .update({ balance: credits.balance - amount })
      .eq('user_id', currentUser.id)

    const { data: existingEarnings } = await supabase
      .from('earnings')
      .select('*')
      .eq('creator_id', session.creator_id)
      .single()

    if (existingEarnings) {
      await supabase
        .from('earnings')
        .update({
          total_earned: existingEarnings.total_earned + amount,
          available_balance: (existingEarnings.available_balance || 0) + amount
        })
        .eq('creator_id', session.creator_id)
    } else {
      await supabase
        .from('earnings')
        .insert({
          creator_id: session.creator_id,
          total_earned: amount,
          pending_balance: 0,
          available_balance: amount
        })
    }

    const { data: msgData } = await supabase
      .from('messages')
      .select('content')
      .eq('id', messageId)
      .single()

    if (msgData) {
      const content = JSON.parse(msgData.content)
      content.status = 'paid'
      await supabase
        .from('messages')
        .update({ content: JSON.stringify(content) })
        .eq('id', messageId)
    }

    alert('Pembayaran berhasil!')
  }

  const handleExtendChat = async (pricingOption: any) => {
    setExtendLoading(true)

    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', currentUser.id)
      .single()

    if (!credits || credits.balance < pricingOption.price_credits) {
      alert('Kredit tidak cukup! Silakan top up dulu.')
      setExtendLoading(false)
      return
    }

    await supabase
      .from('credits')
      .update({ balance: credits.balance - pricingOption.price_credits })
      .eq('user_id', currentUser.id)

    const newExpiry = new Date(Date.now() + pricingOption.duration_hours * 60 * 60 * 1000).toISOString()

    await supabase
      .from('chat_sessions')
      .update({
        expires_at: newExpiry,
        credits_paid: session.credits_paid + pricingOption.price_credits,
        duration_hours: session.duration_hours + pricingOption.duration_hours
      })
      .eq('id', sessionId)

    const { data: existingEarnings } = await supabase
      .from('earnings')
      .select('*')
      .eq('creator_id', session.creator_id)
      .single()

    if (existingEarnings) {
      await supabase
        .from('earnings')
        .update({
          total_earned: existingEarnings.total_earned + pricingOption.price_credits,
          available_balance: (existingEarnings.available_balance || 0) + pricingOption.price_credits
        })
        .eq('creator_id', session.creator_id)
    } else {
      await supabase
        .from('earnings')
        .insert({
          creator_id: session.creator_id,
          total_earned: pricingOption.price_credits,
          pending_balance: 0,
          available_balance: pricingOption.price_credits
        })
    }

    await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: currentUser.id,
      content: `🔄 Chat diperpanjang ${pricingOption.duration_hours} jam`,
      is_read: false
    })

    setSession({
      ...session,
      expires_at: newExpiry,
      credits_paid: session.credits_paid + pricingOption.price_credits,
      duration_hours: session.duration_hours + pricingOption.duration_hours
    })

    setExtendLoading(false)
    setShowExtendModal(false)
    alert('Chat berhasil diperpanjang!')
  }

  const renderMessage = (msg: any, index: number) => {
    let isPaymentRequest = false
    let isMedia = false
    let paymentData = null
    let mediaData = null

    try {
      const parsed = JSON.parse(msg.content)
      if (parsed.type === 'payment_request') {
        isPaymentRequest = true
        paymentData = parsed
      } else if (parsed.type === 'media') {
        isMedia = true
        mediaData = parsed
      }
    } catch {
      // Not JSON, regular message
    }

    const isFromMe = msg.sender_id === currentUser?.id
    const animationDelay = `${index * 0.05}s`

    if (isMedia && mediaData) {
      return (
        <div 
          key={msg.id} 
          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          style={{ animationDelay }}
        >
          <div className={`max-w-[70%] rounded-2xl overflow-hidden ${isFromMe ? 'bg-purple-600' : 'bg-zinc-800 border border-zinc-700'}`}>
            {mediaData.media_type === 'video' ? (
              <video src={mediaData.url} controls className="max-w-full max-h-80 rounded-lg"/>
            ) : (
              <a href={mediaData.url} target="_blank" rel="noopener noreferrer">
                <img src={mediaData.url} alt="Media" className="max-w-full max-h-80 object-cover"/>
              </a>
            )}
            <p className={`text-xs p-2 ${isFromMe ? 'text-purple-200' : 'text-zinc-500'}`}>
              {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )
    }

    if (isPaymentRequest && paymentData) {
      const isPaid = paymentData.status === 'paid'
      return (
        <div 
          key={msg.id} 
          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          style={{ animationDelay }}
        >
          <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isFromMe ? 'bg-purple-600' : 'bg-purple-900/50 border border-purple-500/30'}`}>
            <p className="text-xs text-purple-300 mb-1">💰 Payment Request</p>
            <p className="text-2xl font-bold text-white">{paymentData.amount} Kredit</p>
            <p className="text-sm text-purple-200 mb-2">{paymentData.description}</p>
            {isPaid ? (
              <div className="px-3 py-2 bg-green-500/30 rounded-lg text-green-300 text-center text-sm">✅ Sudah Dibayar</div>
            ) : !isFromMe ? (
              <button onClick={() => handlePayment(msg.id, paymentData.amount)} className="w-full px-4 py-2 bg-purple-500 rounded-lg font-semibold hover:bg-purple-400 transition-colors">Bayar Sekarang</button>
            ) : (
              <div className="px-3 py-2 bg-yellow-500/30 rounded-lg text-yellow-300 text-center text-sm">⏳ Menunggu Pembayaran</div>
            )}
            <p className="text-xs mt-2 text-purple-300">
              {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )
    }

    if (msg.content.startsWith('🔄')) {
      return (
        <div key={msg.id} className="flex justify-center animate-fadeIn" style={{ animationDelay }}>
          <div className="px-4 py-2 bg-zinc-800/50 rounded-full text-zinc-400 text-sm border border-zinc-700">{msg.content}</div>
        </div>
      )
    }

    return (
      <div 
        key={msg.id} 
        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}
        style={{ animationDelay }}
      >
        <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isFromMe ? 'bg-purple-600 rounded-tr-md' : 'bg-zinc-800 border border-zinc-700 rounded-tl-md'}`}>
          <p className="text-white">{msg.content}</p>
          <p className={`text-xs mt-1 ${isFromMe ? 'text-purple-200' : 'text-zinc-500'}`}>
            {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <FanonymLoader text="Memuat chat..." />
  }

  const isExpired = session && session.expires_at && new Date(session.expires_at) < new Date()
  const isPending = session && session.is_accepted === false

  const getProfileUrl = () => {
    if (!otherUser) return '#'
    const isOtherCreator = session?.creator_id === otherUser.id
    if (isOtherCreator) {
      return `/profile/${otherUser.username}`
    } else {
      return `/sender/${otherUser.username}`
    }
  }

  if (isPending && !isCreator) {
    return (
      <div className="min-h-screen bg-[#0c0a14] flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fadeIn">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-2">Menunggu Creator Accept</h2>
          <p className="text-zinc-400 mb-4">
            Chat kamu sudah dibayar! Menunggu {session?.creator?.full_name || 'creator'} untuk accept chat. 
            Waktu akan mulai dihitung setelah creator accept.
          </p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors">
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white flex flex-col relative">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <svg className="absolute left-8 top-1/3 w-8 h-8 text-purple-500/20 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <svg className="absolute right-12 top-1/4 w-10 h-10 text-purple-500/10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
        <div className="absolute left-1/4 bottom-1/3 w-6 h-6 border-2 border-purple-500/20 rotate-45"></div>
      </div>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 px-4 py-3 bg-[#0c0a14]/80 backdrop-blur-xl z-50 animate-fadeInDown">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-purple-600/20 text-zinc-300 hover:text-white transition-all border border-zinc-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Profile */}
            <a href={getProfileUrl()} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative">
                {otherUser?.avatar_url ? (
                  <img src={otherUser.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-purple-500/50"/>
                ) : (
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center font-bold">
                    {otherUser?.full_name?.[0] || '?'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0c0a14]"></span>
              </div>
              <div>
                <p className="font-semibold">{otherUser?.full_name || otherUser?.username}</p>
                <p className="text-xs text-zinc-400">@{otherUser?.username}</p>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
              isExpired 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isExpired ? 'Expired' : timeLeft}
            </div>

            {/* Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
              title="Laporkan / Blokir"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-[72px]"></div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full relative z-10">
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-zinc-500 mt-10 animate-fadeIn">Belum ada pesan. Mulai chat!</p>
          )}
          {messages.map((msg, index) => renderMessage(msg, index))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Expired Banner */}
      {isExpired && !isCreator && (
        <div className="border-t border-red-500/30 p-4 bg-red-500/10 animate-fadeInUp">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-400 mb-3">⏰ Chat sudah expired. Perpanjang untuk lanjut chat!</p>
            <button 
              onClick={() => setShowExtendModal(true)} 
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors"
            >
              🔄 Perpanjang Chat
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!isExpired && (
        <div className="border-t border-zinc-800 p-4 bg-[#0c0a14] animate-fadeInUp">
          <div className="max-w-4xl mx-auto">
            {isCreator && (
              <div className="mb-3">
                <button 
                  onClick={() => setShowPaymentModal(true)} 
                  className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400 text-sm hover:bg-purple-600/30 transition-colors"
                >
                  💰 Request Payment
                </button>
              </div>
            )}
            <form onSubmit={sendMessage} className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-4 py-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*,video/mp4,video/quicktime" 
                style={{ display: 'none' }}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading} 
                className="p-2 text-zinc-400 hover:text-purple-400 disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                )}
              </button>
              
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Ketik pesan anonim..." 
                className="flex-1 bg-transparent py-2 outline-none placeholder-zinc-500"
              />
              
              <button 
                type="submit" 
                disabled={!newMessage.trim()} 
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-purple-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm font-medium">Kirim</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>

            {/* Encryption Notice */}
            <p className="text-center text-xs text-zinc-600 mt-3 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Percakapan ini dienkripsi secara end-to-end
            </p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md animate-scaleIn">
            <h3 className="text-lg font-semibold mb-4">💰 Request Payment</h3>
            <div className="mb-4">
              <label className="text-sm text-zinc-400 block mb-1">Jumlah Kredit</label>
              <input 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                placeholder="10" 
                min="1" 
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-purple-500 outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm text-zinc-400 block mb-1">Deskripsi (opsional)</label>
              <input 
                type="text" 
                value={paymentDesc} 
                onChange={(e) => setPaymentDesc(e.target.value)} 
                placeholder="Nomor WA / Link / dll" 
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-purple-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPaymentModal(false)} 
                className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={sendPaymentRequest} 
                className="flex-1 px-4 py-3 bg-purple-600 rounded-xl hover:bg-purple-500 font-semibold transition-colors"
              >
                Kirim Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md animate-scaleIn">
            <h3 className="text-lg font-semibold mb-4">🔄 Perpanjang Chat</h3>
            <p className="text-zinc-400 text-sm mb-4">Pilih durasi perpanjangan:</p>
            {creatorPricing.length > 0 ? (
              <div className="space-y-3 mb-4">
                {creatorPricing.map((pricing) => (
                  <button 
                    key={pricing.id} 
                    onClick={() => handleExtendChat(pricing)} 
                    disabled={extendLoading} 
                    className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-purple-500 transition-colors flex justify-between items-center disabled:opacity-50"
                  >
                    <span className="font-semibold">{pricing.duration_hours} Jam</span>
                    <span className="text-purple-400 font-bold">{pricing.price_credits} Kredit</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-center mb-4">Creator belum set harga.</p>
            )}
            <button 
              onClick={() => setShowExtendModal(false)} 
              className="w-full px-4 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportBlockModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUserId={otherUser?.id || ''}
        targetUsername={otherUser?.username || ''}
        sessionId={sessionId}
        currentUserId={currentUser?.id || ''}
        mode="both"
      />
      
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
