'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import FanonymLoader from '@/app/components/FanonymLoader'
import GalaxyBackground from '@/app/components/GalaxyBackground'

export default function SenderProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [sender, setSender] = useState<any>(null)
  const [reviews, setReviews] = useState<{ good: number; bad: number }>({ good: 0, bad: 0 })
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      }

      // Get sender profile
      const { data: senderData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('user_type', 'sender')
        .single()

      if (error || !senderData) {
        setLoading(false)
        return
      }

      setSender(senderData)

      // Get reviews count
      const { data: reviewsData } = await supabase
        .from('sender_reviews')
        .select('is_good')
        .eq('sender_id', senderData.id)

      if (reviewsData) {
        const good = reviewsData.filter(r => r.is_good).length
        const bad = reviewsData.filter(r => !r.is_good).length
        setReviews({ good, bad })
      }

      // Check if current user already reviewed
      if (user) {
        const { data: existingReview } = await supabase
          .from('sender_reviews')
          .select('id')
          .eq('sender_id', senderData.id)
          .eq('reviewer_id', user.id)
          .single()

        setHasReviewed(!!existingReview)
      }

      setLoading(false)
    }

    fetchData()
  }, [username])

  const handleReview = async (isGood: boolean) => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    if (hasReviewed) {
      alert('Kamu sudah memberikan review untuk sender ini')
      return
    }

    if (currentUser.id === sender.id) {
      alert('Tidak bisa review diri sendiri')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('sender_reviews')
        .insert({
          sender_id: sender.id,
          reviewer_id: currentUser.id,
          is_good: isGood
        })

      if (error) throw error

      // Update local state
      setReviews(prev => ({
        good: isGood ? prev.good + 1 : prev.good,
        bad: !isGood ? prev.bad + 1 : prev.bad
      }))
      setHasReviewed(true)
      alert(isGood ? '👍 Good review berhasil!' : '👎 Bad review berhasil!')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <FanonymLoader text="Memuat profil..." />
  }

  if (!sender) {
    return (
      <div className="min-h-screen bg-[#0c0a14] flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="text-6xl mb-4">👻</div>
          <p className="text-white text-xl mb-4">User tidak ditemukan</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === sender.id
  const totalReviews = reviews.good + reviews.bad
  const trustScore = totalReviews > 0 ? Math.round((reviews.good / totalReviews) * 100) : 100

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white relative">
      {/* Galaxy Background */}
      <GalaxyBackground />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#0c0a14]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 animate-fadeIn">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              f
            </div>
            <span className="text-xl font-bold">fanonym</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <Link 
                  href={currentUserProfile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>
                {isOwnProfile && (
                  <Link 
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-full text-sm hover:bg-purple-600/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    SECURE PROFILE
                  </Link>
                )}
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10 animate-fadeInDown">
          {/* Avatar with Border */}
          <div className="relative mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-3xl opacity-50 blur"></div>
            <div className="relative">
              {sender.avatar_url ? (
                <img 
                  src={sender.avatar_url} 
                  alt={sender.full_name || sender.username}
                  className="w-40 h-40 rounded-2xl object-cover border-4 border-[#0c0a14]"
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-600/50 to-violet-600/50 flex items-center justify-center border-4 border-[#0c0a14]">
                  <span className="text-zinc-500 text-sm">Avatar</span>
                </div>
              )}
              {isOwnProfile && (
                <Link 
                  href="/settings"
                  className="absolute top-2 left-2 w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Name & Username */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">
                {sender.full_name || sender.username}
              </h1>
              {sender.is_verified && (
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                  VERIFIED
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-purple-400">
              <span className="font-mono">@{sender.username}</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center gap-6 animate-fadeInUp stagger-1">
            <div className="flex items-center gap-2 px-4">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="text-xl font-bold text-green-400">{reviews.good}</span>
              <span className="text-xs text-zinc-500 uppercase">Positive</span>
            </div>
            <div className="w-px h-10 bg-zinc-700"></div>
            <div className="flex items-center gap-2 px-4">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
              <span className="text-xl font-bold text-red-400">{reviews.bad}</span>
              <span className="text-xs text-zinc-500 uppercase">Negative</span>
            </div>
            <div className="w-px h-10 bg-zinc-700"></div>
            <div className="flex items-center gap-2 px-4">
              <span className="text-xl font-bold text-purple-400">{trustScore}%</span>
              <span className="text-xs text-zinc-500 uppercase">Trust Score</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {sender.bio && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8 animate-fadeInUp stagger-2">
            <p className="text-zinc-300 whitespace-pre-wrap text-center">{sender.bio}</p>
          </div>
        )}

        {/* Review Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Good Reviews Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center animate-fadeInUp stagger-3">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <p className="text-5xl font-bold text-white mb-2">{reviews.good}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Good Reviews</p>
          </div>

          {/* Bad Reviews Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center animate-fadeInUp stagger-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </div>
            <p className="text-5xl font-bold text-white mb-2">{reviews.bad}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Bad Reviews</p>
          </div>
        </div>

        {/* Ghost Decoration */}
        <div className="flex justify-center mb-8">
          <svg className="w-16 h-16 text-zinc-700 animate-float" viewBox="0 0 64 64" fill="currentColor">
            <path d="M32 4C18.7 4 8 14.7 8 28v28c0 2.2 1.8 4 4 4 1.1 0 2.1-.4 2.8-1.2l4-4c.8-.8 2-1.2 3.2-.8s2 1.4 2 2.6V60c0 2.2 1.8 4 4 4s4-1.8 4-4v-3.4c0-1.2.8-2.2 2-2.6s2.4 0 3.2.8l4 4c.7.8 1.7 1.2 2.8 1.2 2.2 0 4-1.8 4-4V28C56 14.7 45.3 4 32 4zm-8 28c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm16 0c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
          </svg>
        </div>

        {/* Review Section - Only show if not own profile and is a creator */}
        {!isOwnProfile && currentUserProfile?.user_type === 'creator' && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center animate-fadeInUp stagger-5">
            <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold mb-6">Berikan Review untuk Sender ini</h3>
            
            {hasReviewed ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                <span className="uppercase text-sm font-medium tracking-wider">Kamu Sudah Memberikan Review</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => handleReview(true)}
                  disabled={submitting}
                  className="flex items-center gap-3 px-8 py-4 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span className="text-green-400">Good</span>
                </button>
                <button
                  onClick={() => handleReview(false)}
                  disabled={submitting}
                  className="flex items-center gap-3 px-8 py-4 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  <span className="text-red-400">Bad</span>
                </button>
              </div>
            )}
            
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Review ini membantu creator lain mengetahui kualitas sender dan membangun komunitas yang lebih terpercaya.
            </p>
          </div>
        )}

        {/* Login prompt for non-logged in users */}
        {!currentUser && !isOwnProfile && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center animate-fadeInUp">
            <p className="text-zinc-400 mb-4">Masuk untuk memberikan review</p>
            <Link 
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors"
            >
              Masuk Sekarang
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
