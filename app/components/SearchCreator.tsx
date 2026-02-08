// app/components/SearchCreator.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'

interface SearchCreatorProps {
  onResultClick?: (creator: any) => void
  autoFocus?: boolean
}

export default function SearchCreator({ onResultClick, autoFocus = false }: SearchCreatorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filters, setFilters] = useState({
    verified: false,
    available: false
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fanonym_recent_searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowDropdown(query.length > 0)
      return
    }

    const timer = setTimeout(() => {
      searchCreators()
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query, filters])

  const searchCreators = async () => {
    setLoading(true)
    
    let queryBuilder = supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'creator')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10)

    if (filters.verified) {
      queryBuilder = queryBuilder.eq('is_verified', true)
    }

    if (filters.available) {
      queryBuilder = queryBuilder.eq('status', 'active')
    }

    const { data, error } = await queryBuilder

    if (!error && data) {
      setResults(data)
      setShowDropdown(true)
    }

    setLoading(false)
  }

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('fanonym_recent_searches', JSON.stringify(updated))
  }

  const handleResultClick = (creator: any) => {
    saveRecentSearch(creator.username)
    setShowDropdown(false)
    setQuery('')
    onResultClick?.(creator)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('fanonym_recent_searches')
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Cari creator by username atau nama..."
          autoFocus={autoFocus}
          className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500 outline-none transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={() => setFilters(prev => ({ ...prev, verified: !prev.verified }))}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filters.verified 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, available: !prev.available }))}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filters.available 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Available
          </div>
        </button>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-3 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Recent Searches</p>
                <button 
                  onClick={clearRecentSearches}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(search)}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded-lg text-sm text-zinc-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {query.length >= 2 && (
            <>
              {results.length === 0 && !loading && (
                <div className="p-6 text-center text-zinc-500">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>Tidak ada creator ditemukan</p>
                  <p className="text-xs mt-1">Coba kata kunci lain</p>
                </div>
              )}

              {results.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/profile/${creator.username}`}
                  onClick={() => handleResultClick(creator)}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors"
                >
                  {creator.avatar_url ? (
                    <img 
                      src={creator.avatar_url} 
                      alt={creator.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-lg font-bold">
                      {creator.full_name?.[0] || creator.username?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate">{creator.full_name || creator.username}</p>
                      {creator.is_verified && (
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 truncate">@{creator.username}</p>
                  </div>
                  {creator.status === 'active' && (
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Available
                    </div>
                  )}
                </Link>
              ))}
            </>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
