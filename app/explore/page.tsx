'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import Logo from '@/app/components/Logo'

export default function ExplorePage() {
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCreators = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'creator')
        .eq('is_verified', true)

      setCreators(data || [])
      setLoading(false)
    }

    fetchCreators()
  }, [])

  const filteredCreators = creators.filter(c =>
    c.username?.toLowerCase().includes(search.toLowerCase()) ||
    c.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <nav className="border-b border-gray-800/50 p-4 relative z-10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Logo variant="text" size="md" linkTo="/" />
          <Link href="/dashboard/sender" className="text-gray-400 hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 relative z-10">
        <h1 className="text-2xl font-bold mb-6">Cari Creator</h1>

        <input
          type="text"
          placeholder="🔍 Cari username atau nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl mb-6 focus:border-purple-500 outline-none"
        />

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : filteredCreators.length === 0 ? (
          <p className="text-gray-400">Tidak ada creator ditemukan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCreators.map((creator) => (
              <Link
                key={creator.id}
                href={`/profile/${creator.username}`}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {creator.avatar_url ? (
                    <img src={creator.avatar_url} alt={creator.username} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-xl font-bold">
                      {creator.full_name?.[0] || creator.username?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      {creator.full_name || creator.username}
                      {creator.is_verified && <span className="text-[#1da1f2]">✓</span>}
                    </p>
                    <p className="text-gray-400 text-sm">@{creator.username}</p>
                  </div>
                </div>
                {creator.bio && (
                  <p className="text-gray-400 text-sm mt-3 line-clamp-2">{creator.bio}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}