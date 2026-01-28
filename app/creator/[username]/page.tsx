'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatorProfile() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [creator, setCreator] = useState<any>(null)
  const [pricing, setPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchCreator = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data: creatorData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('user_type', 'creator')
        .single()

      if (error || !creatorData) {
        setLoading(false)
        return
      }

      setCreator(creatorData)

      const { data: pricingData } = await supabase
        .from('creator_pricing')
        .select('*')
        .eq('creator_id', creatorData.id)
        .order('price_credits', { ascending: true })

      setPricing(pricingData || [])
      setLoading(false)
    }

    fetchCreator()
  }, [username])

  const handleUnlockChat = async (pricingOption: any) => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', currentUser.id)
      .single()

    if (!credits || credits.balance < pricingOption.price_credits) {
      alert('Kredit tidak cukup! Silakan top up dulu.')
      router.push('/topup')
      return
    }

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        sender_id: currentUser.id,
        creator_id: creator.id,
        duration_hours: pricingOption.duration_hours,
        credits_paid: pricingOption.price_credits,
        expires_at: new Date(Date.now() + pricingOption.duration_hours * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .select()
      .single()

    if (error) {
      alert('Gagal membuat chat session')
      return
    }

    await supabase
      .from('credits')
      .update({ balance: credits.balance - pricingOption.price_credits })
      .eq('user_id', currentUser.id)

    // Add to creator earnings (80% ke creator, 20% platform fee)
    const { data: existingEarnings } = await supabase
      .from('earnings')
      .select('*')
      .eq('creator_id', creator.id)
      .single()

   if (existingEarnings) {
  await supabase
    .from('earnings')
    .update({
      total_earned: existingEarnings.total_earned + pricingOption.price_credits,
      available_balance: (existingEarnings.available_balance || 0) + pricingOption.price_credits
    })
    .eq('creator_id', creator.id)
} else {
  await supabase
    .from('earnings')
    .insert({
      creator_id: creator.id,
      total_earned: pricingOption.price_credits,
      pending_balance: 0,
      available_balance: pricingOption.price_credits
    })
}

    window.location.href = `/chat/${session.id}`
  }

  const sendFreeMessage = () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    router.push(`/chat/free/${creator.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Creator tidak ditemukan</p>
          <Link href="/explore" className="text-teal-400 hover:underline">
            ← Kembali ke Explore
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-teal-400">Fanonym</Link>
          {currentUser ? (
            <Link href="/dashboard/sender" className="text-gray-400 hover:text-white">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="text-gray-400 hover:text-white">
              Masuk
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
            {creator.full_name?.[0] || creator.username?.[0] || '?'}
          </div>
          
          <h1 className="text-2xl font-bold">{creator.full_name || creator.username}</h1>
          <p className="text-gray-400">@{creator.username}</p>
          
          {creator.bio && (
            <p className="text-gray-300 mt-4 max-w-md mx-auto">{creator.bio}</p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-center">Pilih Durasi Chat</h2>
          
          {pricing.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricing.map((option) => (
                <div
                  key={option.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">{option.duration_hours} Jam</span>
                    <span className="text-teal-400 font-bold">{option.price_credits} Kredit</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Unlimited chat selama {option.duration_hours} jam
                  </p>
                  <button
                    onClick={() => handleUnlockChat(option)}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all"
                  >
                    Unlock Chat
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>Creator belum set harga.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center">
          <p className="text-gray-400 mb-3">Atau kirim pesan gratis (masuk ke folder spam creator)</p>
          <button
            onClick={sendFreeMessage}
            className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:border-teal-500 hover:text-teal-400 transition-colors"
          >
            Kirim Pesan Gratis
          </button>
        </div>
      </main>
    </div>
  )
}