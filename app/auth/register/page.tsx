'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'sender' | 'creator'>('sender')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const validatePassword = (pw: string) => {
    if (pw.length < 8) return 'Password minimal 8 karakter'
    if (!/[A-Z]/.test(pw)) return 'Password harus mengandung huruf besar'
    if (!/[0-9]/.test(pw)) return 'Password harus mengandung angka'
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama')
      setLoading(false)
      return
    }

    const pwError = validatePassword(password)
    if (pwError) {
      setError(pwError)
      setLoading(false)
      return
    }

    if (!agreeTerms) {
      setError('Anda harus menyetujui syarat dan ketentuan')
      setLoading(false)
      return
    }

    try {
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (existingEmail) {
        setError('Email sudah terdaftar')
        setLoading(false)
        return
      }

      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single()

      if (existingUsername) {
        setError('Username sudah dipakai')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            username: username.toLowerCase(),
            user_type: userType,
            display_name: fullName || username,
            phone: userType === 'creator' ? phone : null,
          },
        },
      })

      if (error) throw error
      if (!data.user) throw new Error('Gagal membuat akun')

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0c0a14] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Cek Email Kamu!</h2>
          <p className="text-zinc-400 mb-8">
            Kami sudah mengirim link verifikasi ke <span className="text-purple-400">{email}</span>. 
            Klik link tersebut untuk mengaktifkan akun.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-medium transition-all"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    )
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
              Mulai Perjalanan
              <span className="block text-purple-400">Anonimmu</span>
            </h1>
            <p className={`
              text-xl text-zinc-400 leading-relaxed
              transition-all duration-1000 ease-out delay-150
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
              Daftar sekarang dan mulai kirim pesan anonim ke creator favoritmu.
            </p>

            {/* Features */}
            <div className={`
              mt-8 space-y-4
              transition-all duration-1000 ease-out delay-300
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
              {[
                'Gratis untuk mendaftar',
                'Identitas 100% terlindungi',
                'Proses verifikasi cepat',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-zinc-300">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className={`
            text-zinc-500 text-sm
            transition-all duration-1000 ease-out delay-500
            ${mounted ? 'opacity-100' : 'opacity-0'}
          `}>
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">Masuk di sini</Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className={`
          absolute bottom-20 right-20 w-32 h-32 rounded-3xl rotate-12 border border-purple-500/20
          transition-all duration-1000 ease-out delay-500
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        `} />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className={`
          w-full max-w-md
          transition-all duration-1000 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="font-black text-3xl bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              fanonym
            </Link>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8">
            <h2 className="text-2xl font-bold mb-2">Daftar</h2>
            <p className="text-zinc-400 mb-6">Buat akun Fanonym baru</p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              {/* User Type Switcher */}
              <div className="p-1.5 bg-zinc-900/80 rounded-xl flex">
                <button
                  type="button"
                  onClick={() => setUserType('sender')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    userType === 'sender'
                      ? 'bg-purple-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sender
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('creator')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    userType === 'creator'
                      ? 'bg-cyan-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Creator
                </button>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Nama kamu"
                  required
                />
              </div>

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

              {/* Phone - Creator only */}
              {userType === 'creator' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Min 8 karakter, huruf besar & angka"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Ulangi password"
                  required
                />
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-zinc-400">
                  Saya setuju dengan{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300">Syarat & Ketentuan</Link>
                  {' '}dan{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Kebijakan Privasi</Link>
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  userType === 'sender'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-purple-500/25'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:shadow-cyan-500/25'
                }`}
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
                  `Daftar sebagai ${userType === 'sender' ? 'Sender' : 'Creator'}`
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-zinc-400 text-sm mt-6 lg:hidden">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
