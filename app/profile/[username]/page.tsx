'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'


export default function CreatorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [creator, setCreator] = useState<any>(null)
  const [totalAnons, setTotalAnons] = useState(0)
  const [pricing, setPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setCurrentUserProfile(profileData)

        const { data: creditsData } = await supabase
          .from('credits')
          .select('balance')
          .eq('user_id', user.id)
          .single()
        setCredits(creditsData?.balance || 0)
      }

      // Get creator profile
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

      // Get pricing
      const { data: pricingData } = await supabase
        .from('creator_pricing')
        .select('*')
        .eq('creator_id', creatorData.id)
        .order('duration_hours', { ascending: true })

      setPricing(pricingData || [])

      // Get total unique anons (senders who chatted with this creator)
      const { data: chatsData } = await supabase
        .from('chat_sessions')
        .select('sender_id')
        .eq('creator_id', creatorData.id)

      if (chatsData) {
        const uniqueSenders = new Set(chatsData.map(c => c.sender_id))
        setTotalAnons(uniqueSenders.size)
      }

      setLoading(false)
    }

    fetchData()
  }, [username])

  const handleUnlockChat = async (priceOption: any) => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    // Get the correct credits field - database uses price_credits
    const creditsCost = priceOption.price_credits ?? priceOption.credits ?? priceOption.price ?? 0
    
    console.log('Price option:', priceOption)
    console.log('Credits cost:', creditsCost)

    // Strict validation - must have credits and enough balance
    if (creditsCost <= 0) {
      alert('Error: Harga tidak valid')
      return
    }

    if (credits < creditsCost) {
      alert(`Kredit tidak cukup! Kamu butuh ${creditsCost} kredit, saldo kamu ${credits} kredit.`)
      router.push('/topup')
      return
    }

    setUnlocking(true)

    try {
      // Deduct credits
      const { error: creditError } = await supabase
        .from('credits')
        .update({ balance: credits - creditsCost })
        .eq('user_id', currentUser.id)

      if (creditError) throw creditError

      // Create chat session with status pending (waiting for creator to accept)
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          creator_id: creator.id,
          sender_id: currentUser.id,
          duration_hours: priceOption.duration_hours,
          credits_paid: creditsCost,
          is_accepted: false,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Get current earnings and update
      const { data: currentEarnings } = await supabase
        .from('earnings')
        .select('*')
        .eq('creator_id', creator.id)
        .single()

      if (currentEarnings) {
        await supabase
          .from('earnings')
          .update({ 
            total_earned: (currentEarnings.total_earned || 0) + creditsCost,
            available_balance: (currentEarnings.available_balance || 0) + creditsCost
          })
          .eq('creator_id', creator.id)
      } else {
        // Create earnings record if not exists
        await supabase
          .from('earnings')
          .insert({
            creator_id: creator.id,
            total_earned: creditsCost,
            available_balance: creditsCost,
            withdrawn: 0
          })
      }

      alert('Chat berhasil di-unlock! Menunggu creator accept.')
      router.push(`/chat/${session.id}`)
    } catch (err: any) {
      alert('Error: ' + err.message)
      setUnlocking(false)
    }
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
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === creator.id

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-purple-500/20 p-4 relative z-10 bg-[#0a0a0f]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <Link 
                href={currentUserProfile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'}
                className="text-gray-400 hover:text-white text-sm"
              >
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm">
                Masuk
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="relative z-10">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 w-full relative">
          {creator.cover_photo_url ? (
            <img 
              src={creator.cover_photo_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-600/30 via-violet-600/30 to-purple-600/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                {creator.avatar_url ? (
                  <img 
                    src={creator.avatar_url} 
                    alt={creator.full_name || creator.username}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#0a0a0f] shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-4xl sm:text-5xl font-bold border-4 border-[#0a0a0f] shadow-xl">
                    {creator.full_name?.[0] || creator.username?.[0] || '?'}
                  </div>
                )}
                {creator.is_verified && (
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 bg-[#1da1f2] rounded-full flex items-center justify-center border-2 border-[#0a0a0f] shadow-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name & Info */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {creator.full_name || creator.username}
                  </h1>
                </div>
                <p className="text-gray-400">@{creator.username}</p>
                
                {creator.is_verified && (
                  <span className="inline-block mt-2 text-[#1da1f2] text-sm bg-[#1da1f2]/20 px-3 py-1 rounded-full">
                    ✓ Verified Creator
                  </span>
                )}
                
                {/* Total Anons */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-purple-400">👥</span>
                  <span className="font-semibold">{totalAnons}</span>
                  <span className="text-gray-500">total anon</span>
                </div>
              </div>

              {/* Edit Profile Button (own profile only) */}
              {isOwnProfile && (
                <div className="sm:pb-2">
                  <Link
                    href="/settings"
                    className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors inline-block"
                  >
                    ✏️ Edit Profile
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {creator.bio && (
            <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5 mb-6">
              <p className="text-gray-200 whitespace-pre-wrap text-sm">{creator.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5 text-center mb-6">
            <p className="text-3xl font-bold text-white">{totalAnons}</p>
            <p className="text-gray-400 text-sm mt-1">Total Anon</p>
          </div>

          {/* Unlock Chat Section - Only show if not own profile */}
          {!isOwnProfile && (
            <div className="mb-8">
              <h2 className="text-base font-bold mb-4 text-center">Mulai Chat dengan {creator.full_name || creator.username}</h2>
              
              {pricing.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pricing.map((priceOption) => (
                    <div key={priceOption.id} className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">{priceOption.duration_hours} Jam</h3>
                        <span className="text-purple-400 font-bold">{priceOption.price_credits} Kredit</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">Unlimited chat selama {priceOption.duration_hours} jam</p>
                      <button
                        onClick={() => handleUnlockChat(priceOption)}
                        disabled={unlocking}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 rounded-xl font-semibold transition-all disabled:opacity-50 text-sm"
                      >
                        {unlocking ? 'Processing...' : 'Unlock Chat'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 text-center">
                  <p className="text-gray-400">Creator belum mengatur harga chat</p>
                </div>
              )}

              {/* Tombol Pesan Gratis - selalu tampil */}
              <div className="mt-4">
                <Link
                  href={`/chat/free/${creator.id}`}
                  className="block w-full text-center py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl font-semibold transition-all text-sm"
                >
                  💬 Kirim Pesan Gratis (masuk ke Spam)
                </Link>
              </div>

              {currentUser && credits > 0 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  Saldo kamu: <span className="text-purple-400 font-semibold">{credits} Kredit</span>
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
