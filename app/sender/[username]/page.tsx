'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/app/components/Logo'

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
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!sender) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
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
  const goodPercent = totalReviews > 0 ? Math.round((reviews.good / totalReviews) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-gray-800/50 p-4 relative z-10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Logo variant="text" size="md" linkTo="/" />
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
          {sender.cover_photo_url ? (
            <img 
              src={sender.cover_photo_url} 
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
                {sender.avatar_url ? (
                  <img 
                    src={sender.avatar_url} 
                    alt={sender.full_name || sender.username}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#0a0a0f] shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-4xl sm:text-5xl font-bold border-4 border-[#0a0a0f] shadow-xl">
                    {sender.full_name?.[0] || sender.username?.[0] || '?'}
                  </div>
                )}
              </div>

              {/* Name & Info */}
              <div className="flex-1 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {sender.full_name || sender.username}
                </h1>
                <p className="text-gray-400">@{sender.username}</p>
                
                {/* Review Summary */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-green-400 font-semibold">👍 {reviews.good}</span>
                  <span className="text-red-400 font-semibold">👎 {reviews.bad}</span>
                  {totalReviews > 0 && (
                    <span className="text-gray-500 text-sm">({goodPercent}% positive)</span>
                  )}
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
          {sender.bio && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <p className="text-gray-200 whitespace-pre-wrap">{sender.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-green-400">👍 {reviews.good}</p>
              <p className="text-gray-400 text-sm mt-1">Good Reviews</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-red-400">👎 {reviews.bad}</p>
              <p className="text-gray-400 text-sm mt-1">Bad Reviews</p>
            </div>
          </div>

          {/* Review Section - Only show if not own profile and is a creator */}
          {!isOwnProfile && currentUserProfile?.user_type === 'creator' && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center">Berikan Review untuk Sender ini</h3>
              
              {hasReviewed ? (
                <p className="text-center text-gray-400">Kamu sudah memberikan review ✓</p>
              ) : (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleReview(true)}
                    disabled={submitting}
                    className="px-8 py-3 bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    👍 Good
                  </button>
                  <button
                    onClick={() => handleReview(false)}
                    disabled={submitting}
                    className="px-8 py-3 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    👎 Bad
                  </button>
                </div>
              )}
              
              <p className="text-center text-gray-500 text-xs mt-4">
                Review ini membantu creator lain mengetahui kualitas sender
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
