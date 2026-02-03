'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDesc, setPaymentDesc] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [creatorPricing, setCreatorPricing] = useState<any[]>([])
  const [extendLoading, setExtendLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

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
  }, [sessionId, router])

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  useEffect(() => {
    if (!session?.expires_at) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expires = new Date(session.expires_at).getTime()
      const diff = expires - now

      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${hours}j ${minutes}m ${seconds}d`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [session])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || !session) return

    if (new Date(session.expires_at) < new Date()) {
      alert('Chat session sudah expired!')
      return
    }

    const { error } = await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: currentUser.id,
      content: newMessage.trim(),
      is_read: false
    })

    if (!error) {
      setNewMessage('')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser || !session) return

    if (new Date(session.expires_at) < new Date()) {
      alert('Chat session sudah expired!')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File terlalu besar! Maksimal 10MB')
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung! Gunakan JPG, PNG, GIF, WEBP, atau MP4')
      return
    }

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${sessionId}/${currentUser.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file)

    if (uploadError) {
      alert('Gagal upload: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName)

    // Determine media type
    const isVideo = file.type.startsWith('video/')
    const mediaData = {
      type: 'media',
      media_type: isVideo ? 'video' : 'image',
      url: publicUrl
    }

    await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: currentUser.id,
      content: JSON.stringify(mediaData),
      is_read: false
    })

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const sendPaymentRequest = async () => {
    const amount = parseInt(paymentAmount)
    if (!amount || amount < 1) {
      alert('Masukkan jumlah kredit yang valid!')
      return
    }

    const paymentData = {
      type: 'payment_request',
      amount: amount,
      description: paymentDesc || 'Custom payment',
      status: 'pending'
    }

    const { error } = await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: currentUser.id,
      content: JSON.stringify(paymentData),
      is_read: false
    })

    if (!error) {
      setShowPaymentModal(false)
      setPaymentAmount('')
      setPaymentDesc('')
    }
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

    setShowExtendModal(false)
    setExtendLoading(false)
    alert(`Chat berhasil diperpanjang ${pricingOption.duration_hours} jam!`)
  }

  const renderMessage = (msg: any) => {
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

    // Media message
    if (isMedia && mediaData) {
      const isFromMe = msg.sender_id === currentUser?.id

      return (
        <div
          key={msg.id}
          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[70%] rounded-2xl overflow-hidden ${
            isFromMe ? 'bg-teal-500' : 'bg-gray-800'
          }`}>
            {mediaData.media_type === 'video' ? (
              <video 
                src={mediaData.url} 
                controls 
                className="max-w-full max-h-80 rounded-lg"
              />
            ) : (
              <a href={mediaData.url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={mediaData.url} 
                  alt="Media" 
                  className="max-w-full max-h-80 object-cover"
                />
              </a>
            )}
            <p className={`text-xs p-2 ${isFromMe ? 'text-teal-200' : 'text-gray-500'}`}>
              {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )
    }

    // Payment request message
    if (isPaymentRequest && paymentData) {
      const isPaid = paymentData.status === 'paid'
      const isFromMe = msg.sender_id === currentUser?.id

      return (
        <div
          key={msg.id}
          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
            isFromMe ? 'bg-purple-600' : 'bg-purple-900'
          }`}>
            <p className="text-xs text-purple-300 mb-1">💰 Payment Request</p>
            <p className="text-2xl font-bold text-white">{paymentData.amount} Kredit</p>
            <p className="text-sm text-purple-200 mb-2">{paymentData.description}</p>
            
            {isPaid ? (
              <div className="px-3 py-2 bg-green-500/30 rounded-lg text-green-300 text-center text-sm">
                ✅ Sudah Dibayar
              </div>
            ) : !isFromMe ? (
              <button
                onClick={() => handlePayment(msg.id, paymentData.amount)}
                className="w-full px-4 py-2 bg-teal-500 rounded-lg font-semibold hover:bg-teal-600"
              >
                Bayar Sekarang
              </button>
            ) : (
              <div className="px-3 py-2 bg-yellow-500/30 rounded-lg text-yellow-300 text-center text-sm">
                ⏳ Menunggu Pembayaran
              </div>
            )}

            <p className={`text-xs mt-2 ${isFromMe ? 'text-purple-300' : 'text-purple-400'}`}>
              {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )
    }

    // System message
    if (msg.content.startsWith('🔄')) {
      return (
        <div key={msg.id} className="flex justify-center">
          <div className="px-4 py-2 bg-gray-800/50 rounded-full text-gray-400 text-sm">
            {msg.content}
          </div>
        </div>
      )
    }

    // Regular text message
    return (
      <div
        key={msg.id}
        className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
            msg.sender_id === currentUser?.id
              ? 'bg-teal-500 text-white'
              : 'bg-gray-800 text-white'
          }`}
        >
          <p>{msg.content}</p>
          <p className={`text-xs mt-1 ${msg.sender_id === currentUser?.id ? 'text-teal-200' : 'text-gray-500'}`}>
            {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const isExpired = session && new Date(session.expires_at) < new Date()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
            {otherUser?.avatar_url ? (
              <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover"/>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                {otherUser?.full_name?.[0] || '?'}
              </div>
            )}
            <div>
              <p className="font-semibold">{otherUser?.full_name || otherUser?.username}</p>
              <p className="text-xs text-gray-400">@{otherUser?.username}</p>
            </div>
          </div>
          <div className={`text-sm px-3 py-1 rounded-full ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'}`}>
            {isExpired ? 'Expired' : `⏱ ${timeLeft}`}
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 mt-10">Belum ada pesan. Mulai chat!</p>
          )}
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Expired Banner & Extend Button */}
      {isExpired && !isCreator && (
        <div className="border-t border-gray-800 p-4 bg-red-500/10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-400 mb-3">⏰ Chat sudah expired. Perpanjang untuk lanjut chat!</p>
            <button
              onClick={() => setShowExtendModal(true)}
              className="px-6 py-3 bg-teal-500 rounded-xl font-semibold hover:bg-teal-600"
            >
              🔄 Perpanjang Chat
            </button>
          </div>
        </div>
      )}

      {/* Normal Chat Input */}
      {!isExpired && (
        <div className="border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            {isCreator && (
              <div className="mb-3">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700"
                >
                  💰 Request Payment
                </button>
              </div>
            )}

            <form onSubmit={sendMessage} className="flex gap-2">
              {/* File Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/mp4,video/quicktime"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 disabled:opacity-50"
              >
                {uploading ? '⏳' : '📎'}
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-teal-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-3 bg-teal-500 rounded-xl font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Request Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">💰 Request Payment</h3>
            
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">Jumlah Kredit</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="10"
                min="1"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">Deskripsi (opsional)</label>
              <input
                type="text"
                value={paymentDesc}
                onChange={(e) => setPaymentDesc(e.target.value)}
                placeholder="Nomor WA / Link / dll"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={sendPaymentRequest}
                className="flex-1 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 font-semibold"
              >
                Kirim Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Chat Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">🔄 Perpanjang Chat</h3>
            <p className="text-gray-400 text-sm mb-4">Pilih durasi perpanjangan:</p>
            
            {creatorPricing.length > 0 ? (
              <div className="space-y-3 mb-4">
                {creatorPricing.map((pricing) => (
                  <button
                    key={pricing.id}
                    onClick={() => handleExtendChat(pricing)}
                    disabled={extendLoading}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-teal-500 transition-colors flex justify-between items-center disabled:opacity-50"
                  >
                    <span className="font-semibold">{pricing.duration_hours} Jam</span>
                    <span className="text-teal-400 font-bold">{pricing.price_credits} Kredit</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center mb-4">Creator belum set harga.</p>
            )}

            <button
              onClick={() => setShowExtendModal(false)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}