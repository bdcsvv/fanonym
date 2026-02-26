'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GalaxyBackground from '@/app/components/GalaxyBackground'

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

    // Username validation
    if (username.length < 3) {
      setError('Username minimal 3 karakter')
      setLoading(false)
      return
    }

    if (username.length > 30) {
      setError('Username maksimal 30 karakter')
      setLoading(false)
      return
    }

    // Block SARA, vulgar, and inappropriate usernames
    const blockedWords = [
      'anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'jancok', 'bajingan',
      'pepek', 'cibai', 'babi', 'goblok', 'tolol', 'idiot', 'bodoh',
      'kafir', 'murtad', 'israel', 'yahudi', 'cina', 'negro', 'nigger',
      'fuck', 'shit', 'ass', 'dick', 'pussy', 'cock', 'porn', 'sex', 'nude',
      'admin', 'fanonym', 'support', 'official', 'root', 'system'
    ]

    const usernameLower = username.toLowerCase()
    const hasBlockedWord = blockedWords.some(word => usernameLower.includes(word))
    if (hasBlockedWord) {
      setError('Username mengandung kata yang tidak diperbolehkan')
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
      <div className="min-h-screen bg-[#0c0a14] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Galaxy background */}
        <GalaxyBackground />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-violet-500/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="font-black italic text-3xl bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(147,51,234,0.4)]">
              fanonym
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-purple-500/20 rounded-3xl p-10 text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/30 to-violet-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Cek Email Kamu!</h2>
            <p className="text-purple-300/60 text-sm mb-6">Link verifikasi sudah dikirim</p>

            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-6" />

            <p className="text-zinc-400 text-sm leading-relaxed mb-3">
              Kami sudah mengirim link verifikasi ke
            </p>
            <p className="text-purple-400 font-semibold mb-6 break-all">{email}</p>
            <p className="text-zinc-500 text-xs leading-relaxed mb-8">
              Klik link tersebut untuk mengaktifkan akun kamu. Link berlaku selama <span className="text-purple-400">1 jam</span>.
            </p>

            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6700e8] to-[#9333ea] hover:opacity-90 font-semibold transition-all text-white shadow-[0_4px_20px_rgba(103,0,232,0.4)]"
            >
              Kembali ke Login
            </Link>

            <p className="text-zinc-600 text-xs mt-4">Tidak menerima email? Cek folder spam kamu</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white flex">
      {/* Galaxy background - full screen */}
      <GalaxyBackground />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Extra glow for left panel */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] animate-pulse transition-colors duration-700 ${userType === 'sender' ? 'bg-purple-600/25' : 'bg-violet-600/25'}`} style={{animationDuration:'4s'}} />
          <div className={`absolute bottom-1/4 right-0 w-[350px] h-[350px] rounded-full blur-[130px] animate-pulse transition-colors duration-700 ${userType === 'sender' ? 'bg-fuchsia-500/15' : 'bg-cyan-500/10'}`} style={{animationDuration:'6s', animationDelay:'2s'}} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0c0a14_85%)]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className={`font-black italic text-3xl bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            fanonym
          </Link>

          {/* Main content - changes by role */}
          <div className="max-w-md">
            {/* Badge - no emoji */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${userType === 'sender' ? 'border-purple-500/25 bg-purple-500/10' : 'border-violet-500/25 bg-violet-500/10'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${userType === 'sender' ? 'bg-purple-400' : 'bg-violet-400'}`} />
              <span className={`text-xs font-medium ${userType === 'sender' ? 'text-purple-200' : 'text-violet-200'}`}>
                {userType === 'sender' ? 'Daftar sebagai Sender' : 'Daftar sebagai Creator'}
              </span>
            </div>

            {/* Heading - same structure for both roles */}
            <div className="overflow-hidden mb-3">
              <h1 className={`text-5xl xl:text-6xl font-bold leading-tight transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
                {userType === 'sender' ? 'Kirim Pesan,' : 'Monetisasi Konten,'}
              </h1>
            </div>
            <div className="overflow-hidden mb-6">
              <h1 className={`text-5xl xl:text-6xl font-bold leading-tight bg-clip-text text-transparent transition-all duration-700 delay-350 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'} ${userType === 'sender' ? 'bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400' : 'bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400'}`}>
                {userType === 'sender' ? 'Tanpa Dikenal.' : 'Tanpa Batas.'}
              </h1>
            </div>

            <p className={`text-lg text-zinc-400 leading-relaxed mb-8 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {userType === 'sender'
                ? 'Sampaikan rasa, pertanyaan, atau dukunganmu ke creator favoritmu — tanpa khawatir identitasmu terbuka.'
                : 'Terima pesan berbayar dari fans, kelola sesi chat, dan cairkan penghasilanmu kapan saja dengan mudah.'}
            </p>

            {/* Benefits - no emoji, cleaner design */}
            <div className={`space-y-3 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {(userType === 'sender' ? [
                { title: 'Identitas 100% Tersembunyi', desc: 'Tidak ada yang tahu siapa kamu, termasuk creator-nya' },
                { title: 'Chat Langsung ke Creator', desc: 'Akses sesi chat eksklusif dengan durasi terbatas' },
                { title: 'Enkripsi End-to-End', desc: 'Semua pesan terenkripsi dan terlindungi sepenuhnya' },
                { title: 'Setup Kurang dari 1 Menit', desc: 'Daftar, beli kredit, langsung kirim pesan pertama' },
              ] : [
                { title: 'Hasilkan Pendapatan dari Fans', desc: 'Terima pembayaran kredit untuk setiap sesi chat' },
                { title: 'Platform Fee Hanya 4%', desc: 'Kamu mendapat 96% dari setiap transaksi yang masuk' },
                { title: 'Kendali Penuh di Tanganmu', desc: 'Setujui atau tolak permintaan chat sesukamu' },
                { title: 'Dashboard Analytics Lengkap', desc: 'Pantau pendapatan dan aktivitas fans secara real-time' },
              ]).map((benefit, i) => (
                <div
                  key={`${userType}-${i}`}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                  style={{ transitionDelay: `${550 + i * 80}ms`, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-16px)', transition: 'all 0.5s ease' }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${userType === 'sender' ? 'bg-purple-400' : 'bg-violet-400'}`} />
                  <div>
                    <div className="text-sm font-semibold text-white">{benefit.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{benefit.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className={`text-zinc-500 text-sm transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">Masuk di sini</Link>
          </div>
        </div>

        {/* Floating cards */}
        <div className={`absolute bottom-24 right-16 w-28 h-28 rounded-3xl rotate-12 border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} />
        <div className={`absolute top-28 right-28 w-16 h-16 rounded-2xl -rotate-12 border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm transition-all duration-1000 delay-800 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`} />
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
            <Link href="/" className="font-black italic text-3xl bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(147,51,234,0.4)]">
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
