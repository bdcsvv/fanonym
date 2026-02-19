'use client'

import { useState, useEffect } from 'react'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          throw new Error('Tidak bisa terhubung ke server. Cek koneksi internet atau Supabase URL.')
        }
        throw error
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        const meta = data.user.user_metadata
        if (!meta?.username || !meta?.user_type) {
          throw new Error('Data registrasi tidak ditemukan. Silakan daftar ulang.')
        }

        const { data: usernameTaken } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', meta.username)
          .single()

        if (usernameTaken) {
          throw new Error(`Username @${meta.username} sudah dipakai. Silakan daftar ulang.`)
        }

        const { error: createErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          username: meta.username,
          user_type: meta.user_type,
          display_name: meta.display_name || meta.username,
          credits: 0,
          is_verified: false,
        })

        if (createErr) throw createErr

        router.push(`/dashboard/${meta.user_type}`)
      } else {
        router.push(`/dashboard/${profile.user_type}`)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      if (errorMessage.includes('Invalid login')) {
        setError('Email atau password salah')
      } else {
        setError(errorMessage)
      }
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim email reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/20 blur-[120px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="font-black text-3xl bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            fanonym
          </Link>

          {/* Main content */}
          <div className="max-w-md">
            <h1 className={`
              text-5xl font-bold leading-tight mb-6
              transition-all duration-1000 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
              Selamat Datang
              <span className="block text-purple-400">Kembali</span>
            </h1>
            <p className={`
              text-xl text-zinc-400 leading-relaxed
              transition-all duration-1000 ease-out delay-150
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
              Kirim pesan anonim ke creator favoritmu dengan aman dan mudah.
            </p>
          </div>

          {/* Bottom decoration */}
          <div className={`
            flex items-center gap-4 text-zinc-500 text-sm
            transition-all duration-1000 ease-out delay-300
            ${mounted ? 'opacity-100' : 'opacity-0'}
          `}>
            <span>Platform pesan anonim terpercaya</span>
            <div className="h-1 w-1 rounded-full bg-purple-500" />
            <span>Enkripsi end-to-end</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className={`
          absolute bottom-20 right-20 w-32 h-32 rounded-3xl rotate-12 border border-purple-500/20
          transition-all duration-1000 ease-out delay-500
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        `} />
        <div className={`
          absolute top-32 right-32 w-20 h-20 rounded-2xl -rotate-12 border border-violet-500/20
          transition-all duration-1000 ease-out delay-700
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}
        `} />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className={`
          w-full max-w-md
          transition-all duration-1000 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="font-black text-3xl bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              fanonym
            </Link>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8">
            <h2 className="text-2xl font-bold mb-2">
              {forgotMode ? 'Reset Password' : 'Masuk'}
            </h2>
            <p className="text-zinc-400 mb-8">
              {forgotMode 
                ? 'Masukkan email untuk reset password' 
                : 'Masuk ke akun Fanonym kamu'
              }
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {forgotSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Terkirim!</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Cek inbox email kamu untuk link reset password
                </p>
                <button
                  onClick={() => { setForgotMode(false); setForgotSent(false) }}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  Kembali ke Login
                </button>
              </div>
            ) : (
              <form onSubmit={forgotMode ? handleForgotPassword : handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="nama@email.com"
                    required
                  />
                </div>

                {/* Password */}
                {!forgotMode && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}

                {/* Forgot password link */}
                {!forgotMode && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotMode(true)}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Lupa password?
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    forgotMode ? 'Kirim Link Reset' : 'Masuk'
                  )}
                </button>

                {/* Back to login */}
                {forgotMode && (
                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="w-full py-3 text-zinc-400 hover:text-white transition-colors text-sm"
                  >
                    Kembali ke Login
                  </button>
                )}
              </form>
            )}

            {/* Register link */}
            {!forgotMode && !forgotSent && (
              <p className="text-center text-zinc-400 text-sm mt-8">
                Belum punya akun?{' '}
                <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Daftar Sekarang
                </Link>
              </p>
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-zinc-500 text-xs mt-6">
            Dengan masuk, kamu menyetujui{' '}
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Kebijakan Privasi</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
