'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      if (profile?.user_type === 'creator') {
        router.push('/dashboard/creator')
      } else {
        router.push('/dashboard/sender')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setForgotSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">fanonym</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {forgotMode ? 'Lupa Kata Sandi' : 'Selamat Datang Kembali'}
          </h1>
          <p className="text-gray-400">
            {forgotMode ? 'Masukkan email untuk reset password' : 'Masuk untuk melanjutkan ke akun Anda'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          {forgotSent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-white mb-2">Cek Email Anda</h2>
              <p className="text-gray-400 mb-6">
                Link reset password telah dikirim ke{' '}
                <span className="text-purple-400">{email}</span>
              </p>
              <button
                onClick={() => {
                  setForgotMode(false)
                  setForgotSent(false)
                  setEmail('')
                }}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                ← Kembali ke Login
              </button>
            </div>
          ) : forgotMode ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Reset Password</h2>
              <p className="text-gray-400 text-sm mb-6">
                Kami akan mengirim link reset ke email Anda
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
                />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl"
                >
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>

              <button
                onClick={() => {
                  setForgotMode(false)
                  setError('')
                }}
                className="w-full text-center text-gray-400 hover:text-white mt-4"
              >
                ← Kembali ke Login
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Masuk</h2>
              <p className="text-gray-400 text-sm mb-6">
                Gunakan email dan kata sandi Anda
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
                />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl"
                >
                  {loading ? 'Memproses...' : 'Masuk Sekarang'}
                </button>
              </form>

              <p className="text-gray-400 text-center mt-6">
                Belum punya akun?{' '}
                <Link
                  href="/auth/register"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Daftar di sini
                </Link>
              </p>

              {/* TAMBAHAN */}
              <Link
                href="/"
                className="block text-center text-gray-500 hover:text-gray-300 mt-4 text-sm transition-colors"
              >
                ← Kembali ke Beranda
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
