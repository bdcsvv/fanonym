'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChatRoom() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setCurrentUser(user)

      // Get session
      const { data: sessionData, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error || !sessionData) {
        alert('Chat session tidak ditemukan')
        router.push('/dashboard/sender')
        return
      }

      // Check if user is part of this session
      if (sessionData.sender_id !== user.id && sessionData.creator_id !== user.id) {
        alert('Anda tidak memiliki akses ke chat ini')
        router.push('/dashboard/sender')
        return
      }

      setSession(sessionData)

      // Get other user profile
      const otherId = sessionData.sender_id === user.id ? sessionData.creator_id : sessionData.sender_id
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .single()

      setOtherUser(otherProfile)

      // Get messages
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

  // Real-time messages subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // Timer countdown
  useEffect(() => {
    if (!session?.expires_at) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expires = new Date(session.expires_at).getTime()
      const diff = expires - now

      if (diff <= 0) {
        setTimeLeft('Expired')
        clearInterval(interval)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}j ${minutes}m ${seconds}d`)
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || !session) return

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      alert('Chat session sudah expired!')
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        is_read: false
      })

    if (!error) {
      setNewMessage('')
    }
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
      {/* Header */}
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/sender" className="text-gray-400 hover:text-white">←</Link>
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
              {otherUser?.full_name?.[0] || otherUser?.username?.[0] || '?'}
            </div>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg) => (
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
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isExpired ? 'Chat sudah expired' : 'Ketik pesan...'}
            disabled={isExpired}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-teal-500 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isExpired || !newMessage.trim()}
            className="px-6 py-3 bg-teal-500 rounded-xl font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  )
}