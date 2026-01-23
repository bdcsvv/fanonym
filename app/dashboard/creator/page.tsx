'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreatorDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [earnings, setEarnings] = useState<any>(null)
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

      const { data: earningsData } = await supabase
        .from('earnings')
        .select('*')
        .eq('creator_id', user.id)
        .single()

      setProfile(profileData)
      setEarnings(earningsData)
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Pendapatan</p>
            <p className="text-2xl font-bold text-teal-400">Rp {((earnings?.total_earned || 0) * 10000 * 0.7).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Saldo Tersedia</p>
            <p className="text-2xl font-bold text-green-400">Rp {((earnings?.available_balance || 0) * 10000 * 0.7).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Pending (7 hari)</p>
            <p className="text-2xl font-bold text-yellow-400">Rp {((earnings?.pending_balance || 0) * 10000 * 0.7).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Link Profil Kamu</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`fanonym.com/@${profile?.username}`}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-300"
            />
            <button className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600">Copy</button>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Pesan Masuk</h3>
          <p className="text-gray-400">Belum ada pesan masuk.</p>
        </div>
      </main>
    </div>
  )
}