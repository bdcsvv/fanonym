'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FreeMessagePage() {
  const params = useParams()
  const router = useRouter()
  const creatorId = params.creatorId as string

  const [creator, setCreator] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setCurrentUser(user)

      const { data: creatorData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', creatorId)
        .single()

      setCreator(creatorData)
      setLoading(false)
    }

    init()
  }, [creatorId, router])

  const sendFreeMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentUser || !creator) return

    setSending(true)

    const { error } = await supabase
      .from('spam_messages')
      .insert({
        sender_id: currentUser.id,
        creator_id: creator.id,
        content: message.trim(),
        status: 'pending'
      })

    if (error) {
      alert('Gagal mengirim pesan')
      setSending(false)
      return
    }

    setSent(true)
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✉️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Pesan Terkirim!</h1>
          <p className="text-gray-400 mb-6">
            Pesan kamu masuk ke folder spam {creator?.full_name || creator?.username}.<br />
            Creator akan memutuskan apakah ingin membalas.
          </p>
          <div className="space-x-4">
            <Link
              href={`/creator/${creator?.username}`}
              className="inline-block px-6 py-3 bg-teal-500 rounded-lg font-semibold hover:bg-teal-600"
            >
              Kembali ke Profil
            </Link>
            <Link
              href="/explore"
              className="inline-block px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:border-teal-500"
            >
              Explore Creator
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href={`/creator/${creator?.username}`} className="text-gray-400 hover:text-white">← Kembali</Link>
          <span className="text-xl font-bold text-teal-400">Fanonym</span>
          <div></div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
            {creator?.full_name?.[0] || creator?.username?.[0] || '?'}
          </div>
          <h1 className="text-xl font-bold">Kirim Pesan Gratis ke {creator?.full_name || creator?.username}</h1>
          <p className="text-gray-400 text-sm mt-2">Pesan akan masuk ke folder spam. Creator bisa memilih untuk membalas atau tidak.</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            ⚠️ Pesan gratis memiliki prioritas rendah. Untuk response yang lebih cepat, pertimbangkan untuk unlock chat berbayar.
          </p>
        </div>

        <form onSubmit={sendFreeMessage}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan kamu di sini..."
            rows={6}
            maxLength={500}
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl focus:border-teal-500 outline-none resize-none mb-2"
          />
          <p className="text-gray-500 text-sm mb-4">{message.length}/500 karakter</p>

          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Mengirim...' : 'Kirim Pesan Gratis'}
          </button>
        </form>
      </main>
    </div>
  )
}