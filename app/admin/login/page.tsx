'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ADMIN_EMAILS = ['rizkinurulloh1124@gmail.com']

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if email is admin
    if (!ADMIN_EMAILS.includes(email)) {
      setError('Akses ditolak. Bukan admin.')
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      setError('Email atau password salah!')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-red-500">🔐 Admin Login</h1>
            <p className="text-gray-400 mt-2">Khusus administrator</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 block mb-1">Email Admin</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 outline-none text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 outline-none text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Login Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}