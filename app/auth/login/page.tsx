'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GalaxyBackground from '@/app/components/GalaxyBackground'

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
      
      if (error) {
        // Network error
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          throw new Error('Tidak bisa terhubung ke server. Cek koneksi internet atau Supabase URL.')
        }
        throw error
      }

      // Check if profile exists - if not, create from user metadata (first login after email verify)
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // First login - create profile from metadata
        const meta = data.user.user_metadata
        if (!meta?.username || !meta?.user_type) {
          throw new Error('Data registrasi tidak ditemukan. Silakan daftar ulang.')
        }

        // Check username still available
        const { data: usernameTaken } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', meta.username)
          .single()

        if (usernameTaken) {
          throw new Error(`Username "${meta.username}" sudah diambil orang lain. Silakan daftar ulang dengan username baru.`)
        }

        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          username: meta.username,
          full_name: meta.full_name,
          phone: meta.phone || null,
          user_type: meta.user_type,
        })

        if (profileError) throw profileError

        if (meta.user_type === 'sender') {
          await supabase.from('credits').insert({
            user_id: data.user.id,
            balance: 0,
          })
        }

        if (meta.user_type === 'creator') {
          await supabase.from('earnings').insert({
            creator_id: data.user.id,
            total_earned: 0,
            available_balance: 0,
            pending_balance: 0,
          })
        }

        if (meta.user_type === 'creator') {
          router.push('/dashboard/creator')
        } else {
          router.push('/dashboard/sender')
        }
      } else {
        if (profile.user_type === 'creator') {
          router.push('/dashboard/creator')
        } else {
          router.push('/dashboard/sender')
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      // Always show success - don't reveal if email exists or not
      setForgotSent(true)
    } catch (err: any) {
      // Still show success for security
      setForgotSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Galaxy Background */}
      <GalaxyBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Fanonym Title */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {forgotMode ? 'Lupa Kata Sandi' : 'Selamat Datang Kembali'}
          </h1>
          <p className="text-gray-400 text-sm">
            {forgotMode ? 'Masukkan email untuk reset password' : 'Masuk untuk melanjutkan ke akun Anda'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {forgotSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Cek Email Anda</h2>
              <p className="text-gray-400 mb-6">
                Jika akun dengan email <span className="text-purple-400">{email}</span> terdaftar, Anda akan menerima link untuk reset password.
              </p>
              <p className="text-gray-500 text-xs mb-6">Cek juga folder spam jika tidak muncul di inbox.</p>
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
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>

              <button
                onClick={() => {
                  setForgotMode(false)
                  setError('')
                }}
                className="w-full text-center text-gray-400 hover:text-white mt-4 transition-colors"
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
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                />

                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-purple-400 hover:text-purple-300 text-sm mt-2 float-right transition-colors"
                  >
                    Lupa password?
                  </button>
                </div>

                <div className="clear-both"></div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Masuk Sekarang'}
                </button>
              </form>

              <p className="text-gray-400 text-center mt-6">
                Belum punya akun?{' '}
                <Link
                  href="/auth/register"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Daftar di sini
                </Link>
              </p>

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
