'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SenderDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: creditsData } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)
      setCredits(creditsData)
      setLoading(false)
    }

    getProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-teal-400">Fanonym</h1>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Halo, {profile?.full_name || profile?.username}! 👋</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Saldo Kredit</p>
            <p className="text-3xl font-bold text-teal-400">{credits?.balance || 0} Kredit</p>
            <p className="text-gray-500 text-sm mt-1">= Rp {((credits?.balance || 0) * 10000).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/50 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Butuh lebih banyak kredit?</p>
              <p className="text-gray-400 text-sm">Top up sekarang!</p>
            </div>
            <Link href="/topup" className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600 font-semibold">
              Top Up
            </Link>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Cari Creator</h3>
          <Link 
            href="/explore"
            className="block w-full p-4 bg-gray-900 border border-gray-600 rounded-lg text-gray-400 hover:border-teal-500 transition-colors"
          >
            🔍 Cari creator favorit kamu...
          </Link>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Chat Aktif</h3>
          <p className="text-gray-400">Belum ada chat aktif.</p>
        </div>
      </main>
    </div>
  )
}