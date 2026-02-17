'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import FanonymLoader from '@/app/components/FanonymLoader'
import GalaxyBackground from '@/app/components/GalaxyBackground'

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
  const [isBlockedByCreator, setIsBlockedByCreator] = useState(false)
  const [iBlockedCreator, setIBlockedCreator] = useState(false)
  const [myBlockId, setMyBlockId] = useState<string | null>(null)
  const [unblocking, setUnblocking] = useState(false)
  const [creatorRating, setCreatorRating] = useState({ average: 0, count: 0 })
  const [recentReviews, setRecentReviews] = useState<any[]>([])

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

      // Check blocks in both directions
      if (user) {
        // Creator blocked me?
        const { data: blockedByCreator } = await supabase
          .from('blocks')
          .select('id')
          .eq('blocker_id', creatorData.id)
          .eq('blocked_id', user.id)
          .single()
        
        if (blockedByCreator) {
          setIsBlockedByCreator(true)
        }

        // I blocked creator?
        const { data: iBlocked } = await supabase
          .from('blocks')
          .select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_id', creatorData.id)
          .single()
        
        if (iBlocked) {
          setIBlockedCreator(true)
          setMyBlockId(iBlocked.id)
        }
      }

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

      // Get creator ratings
      const { data: ratingsData } = await supabase
        .from('creator_reviews')
        .select('rating, comment, created_at')
        .eq('creator_id', creatorData.id)
        .order('created_at', { ascending: false })

      if (ratingsData && ratingsData.length > 0) {
        const avg = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
        setCreatorRating({ average: Math.round(avg * 10) / 10, count: ratingsData.length })
        // Get reviews with comments (max 5 most recent)
        setRecentReviews(ratingsData.filter(r => r.comment).slice(0, 5))
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

    if (isBlockedByCreator || iBlockedCreator) {
      alert('Tidak bisa unlock chat — salah satu pihak telah memblokir.')
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
      // DON'T deduct credits yet - wait for creator to accept
      // Just create chat session with status pending
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          creator_id: creator.id,
          sender_id: currentUser.id,
          duration_hours: priceOption.duration_hours,
          credits_paid: creditsCost,
          is_accepted: false,
          credits_transferred: false, // NEW: track if credits have been transferred
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // DON'T update earnings yet - wait for creator to accept

      alert('Chat request dikirim! Menunggu creator accept. Kredit akan dipotong setelah creator menerima.')
      router.push(`/chat/${session.id}`)
    } catch (err: any) {
      alert('Error: ' + err.message)
      setUnlocking(false)
    }
  }

  const handleUnblock = async () => {
    if (!myBlockId) return
    if (!confirm('Yakin ingin membuka blokir?')) return
    
    setUnblocking(true)
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', myBlockId)
    
    if (error) {
      alert('Gagal membuka blokir: ' + error.message)
    } else {
      setIBlockedCreator(false)
      setMyBlockId(null)
      alert('Blokir berhasil dibuka!')
    }
    setUnblocking(false)
  }

  if (loading) {
    return <FanonymLoader text="Memuat profil..." />
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0c0a14] flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="text-6xl mb-4">👻</div>
          <p className="text-white text-xl mb-4">Creator tidak ditemukan</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === creator.id

  // Find the "best value" pricing option (middle one or highest duration)
  const getBestValueIndex = () => {
    if (pricing.length <= 1) return -1
    if (pricing.length === 2) return 1
    return Math.floor(pricing.length / 2)
  }
  const bestValueIndex = getBestValueIndex()

  // Full-page blocked state - hide everything
  if (!isOwnProfile && (isBlockedByCreator || iBlockedCreator)) {
    return (
      <div className="min-h-screen bg-[#0c0a14] text-white relative">
        <GalaxyBackground />
        <nav className="sticky top-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link 
              href={currentUser ? (currentUserProfile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender') : '/'} 
              className="font-black text-2xl bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]"
            >
              fanonym
            </Link>
            <Link 
              href={currentUserProfile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'}
              className="text-zinc-400 hover:text-white text-sm transition-all"
            >
              Dashboard
            </Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-24 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            {iBlockedCreator ? (
              <>
                <h2 className="text-xl font-bold text-red-400 mb-2">Anda Memblokir Profil Ini</h2>
                <p className="text-zinc-500 mb-6">Anda tidak dapat berinteraksi dengan creator ini selama masih diblokir.</p>
                <button
                  onClick={handleUnblock}
                  disabled={unblocking}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
                >
                  {unblocking ? 'Membuka blokir...' : '🔓 Buka Blokir'}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-red-400 mb-2">Creator Ini Telah Memblokir Anda</h2>
                <p className="text-zinc-500">Anda tidak dapat melihat profil creator ini.</p>
              </>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white relative">
      {/* Galaxy Background */}
      <GalaxyBackground />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href={currentUser ? (currentUserProfile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender') : '/'} 
            className="font-black text-2xl bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)] animate-fadeIn"
          >
            fanonym
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <Link 
                href={currentUserProfile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'}
                className="text-zinc-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all text-sm"
              >
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className="text-zinc-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] text-sm transition-all">
                Masuk
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Avatar + Info Section */}
        <div className="flex flex-col items-center mb-12">
          {/* Avatar with Glow */}
          <div className="relative mb-6 animate-fadeInDown">
            <div className="absolute -inset-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full opacity-40 blur-lg animate-pulse"></div>
            <div className="relative">
              {creator.avatar_url ? (
                <img 
                  src={creator.avatar_url} 
                  alt={creator.full_name || creator.username}
                  className="w-36 h-36 rounded-full object-cover border-4 border-[#0c0a14] shadow-2xl"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-600/50 to-violet-600/50 flex items-center justify-center text-5xl font-bold border-4 border-[#0c0a14]">
                  {creator.full_name?.[0] || creator.username?.[0] || '?'}
                </div>
              )}
              {creator.is_verified && (
                <div className="absolute bottom-1 right-1 w-10 h-10 bg-[#1da1f2] rounded-full flex items-center justify-center border-4 border-[#0c0a14] shadow-lg shadow-blue-500/30">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Name & Username */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            {creator.full_name || creator.username}
          </h1>
          <p className="text-purple-400 font-mono text-lg mb-3 animate-fadeInUp" style={{animationDelay: '0.15s'}}>@{creator.username}</p>
          
          {/* Verified Badge */}
          {creator.is_verified && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full mb-4 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-purple-400 text-sm font-medium">Verified Creator</span>
            </div>
          )}

          {/* Bio - inline under username */}
          {creator.bio && (
            <p className="text-zinc-400 text-center max-w-lg italic animate-fadeInUp" style={{animationDelay: '0.25s'}}>
              &ldquo;{creator.bio}&rdquo;
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Rating */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-center animate-fadeInUp hover:border-yellow-500/30 transition-colors" style={{animationDelay: '0.3s'}}>
            <div className="flex justify-center gap-0.5 mb-2">
              {creatorRating.count > 0 ? (
                [1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-base">
                    {star <= Math.round(creatorRating.average) ? '⭐' : '☆'}
                  </span>
                ))
              ) : (
                <span className="text-2xl">⭐</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{creatorRating.count > 0 ? creatorRating.average : '—'}</p>
            <p className="text-zinc-500 text-xs mt-1">{creatorRating.count > 0 ? `${creatorRating.count} review${creatorRating.count > 1 ? 's' : ''}` : 'Belum ada'}</p>
          </div>

          {/* Total Anonymous */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-center animate-fadeInUp hover:border-purple-500/30 transition-colors" style={{animationDelay: '0.35s'}}>
            <div className="flex justify-center mb-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">{totalAnons}</p>
            <p className="text-zinc-500 text-xs mt-1">Anonymous</p>
          </div>

          {/* Pricing Range */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-center animate-fadeInUp hover:border-violet-500/30 transition-colors" style={{animationDelay: '0.4s'}}>
            <div className="flex justify-center mb-2">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">
              {pricing.length > 0 ? `${Math.min(...pricing.map(p => p.price_credits || p.credits || 0))}` : '—'}
            </p>
            <p className="text-zinc-500 text-xs mt-1">{pricing.length > 0 ? 'Kredit mulai dari' : 'Belum set harga'}</p>
          </div>
        </div>

        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <div className="mb-12 animate-fadeInUp" style={{animationDelay: '0.45s'}}>
            <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Kata Mereka
            </h3>
            <div className="space-y-3">
              {recentReviews.map((review, idx) => (
                <div 
                  key={idx} 
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 animate-fadeInUp hover:border-zinc-700 transition-colors"
                  style={{animationDelay: `${0.5 + idx * 0.1}s`}}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-sm">
                          {star <= review.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-zinc-600 text-xs">
                      {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-sm italic">&ldquo;{review.comment}&rdquo;</p>
                  <p className="text-zinc-600 text-xs mt-2">— Anonymous Sender</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Profile - Only for own profile */}
        {isOwnProfile && (
          <div className="flex justify-center mb-12 animate-fadeInUp">
            <Link
              href="/settings"
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        )}

        {/* Unlock Chat Section - Only for non-owner */}
        {!isOwnProfile && (
          <>
            {(isBlockedByCreator || iBlockedCreator) ? (
              <div className="text-center py-12 animate-fadeIn">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                {iBlockedCreator ? (
                  <>
                    <h2 className="text-xl font-bold text-red-400 mb-2">Anda Memblokir Profil Ini</h2>
                    <p className="text-zinc-500 mb-6">Anda tidak dapat berinteraksi dengan creator ini selama masih diblokir.</p>
                    <button
                      onClick={handleUnblock}
                      disabled={unblocking}
                      className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
                    >
                      {unblocking ? 'Membuka blokir...' : '🔓 Buka Blokir'}
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-red-400 mb-2">Creator Ini Telah Memblokir Anda</h2>
                    <p className="text-zinc-500">Anda tidak dapat mengirim pesan ke creator ini.</p>
                  </>
                )}
              </div>
            ) : (
            <>
            {/* Section Header */}
            <div className="text-center mb-8 animate-fadeIn">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Mulai Chat dengan {creator.full_name || creator.username}
              </h2>
              <p className="text-zinc-400">
                Pilih paket yang sesuai untuk membuka kunci chat eksklusif
              </p>
            </div>

            {/* Pricing Cards */}
            {pricing.length > 0 ? (
              <div className={`grid gap-6 mb-8 ${pricing.length === 1 ? 'max-w-md mx-auto' : pricing.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                {pricing.map((priceOption, index) => {
                  const isBestValue = index === bestValueIndex
                  return (
                    <div 
                      key={priceOption.id} 
                      className={`relative bg-zinc-900/50 border rounded-2xl p-6 animate-fadeInUp ${
                        isBestValue 
                          ? 'border-purple-500/50 ring-1 ring-purple-500/30' 
                          : 'border-zinc-800'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Best Value Ribbon */}
                      {isBestValue && (
                        <div className="absolute -top-px -right-px">
                          <div className="bg-purple-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg rounded-tr-xl">
                            Best Value
                          </div>
                        </div>
                      )}

                      {/* Duration & Price */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold">{priceOption.duration_hours} Jam</h3>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-purple-400">{priceOption.price_credits}</span>
                          <span className="text-xs text-zinc-500 uppercase ml-1">Kredit</span>
                        </div>
                      </div>
                      <p className="text-zinc-500 text-sm mb-6">
                        Unlimited chat selama {priceOption.duration_hours} jam
                      </p>

                      {/* Features */}
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-sm text-zinc-400">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Pesan anonim tanpa batas
                        </li>
                        <li className="flex items-center gap-2 text-sm text-zinc-400">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Prioritas balasan creator
                        </li>
                        <li className="flex items-center gap-2 text-sm text-zinc-400">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Identitas 100% rahasia
                        </li>
                      </ul>

                      {/* Unlock Button */}
                      <button
                        onClick={() => handleUnlockChat(priceOption)}
                        disabled={unlocking}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                          isBestValue
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                        {unlocking ? 'Processing...' : 'Unlock Chat'}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center mb-8">
                <p className="text-zinc-400">Creator belum mengatur harga chat</p>
              </div>
            )}

            {/* Free Message Button */}
            <div className="mb-8">
              <Link
                href={`/chat/free/${creator.id}`}
                className="block w-full text-center py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl font-medium transition-all text-zinc-400 hover:text-white"
              >
                💬 Kirim Pesan Gratis (masuk ke Spam)
              </Link>
            </div>

            {/* Credits Info */}
            {currentUser && credits > 0 && (
              <p className="text-center text-zinc-500 text-sm mb-8">
                Saldo kamu: <span className="text-purple-400 font-semibold">{credits} Kredit</span>
              </p>
            )}

            {/* Divider */}
            <div className="border-t border-zinc-800 my-8"></div>

            {/* Footer Info */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-zinc-500 text-sm mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Instant Access</span>
              </div>
            </div>
            <p className="text-center text-zinc-600 text-xs uppercase tracking-wider">
              Powered by Fanonym - Connecting Creators Privately
            </p>
          </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
