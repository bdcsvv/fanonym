'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'

export default function RegisterPage() {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama')
      setLoading(false)
      return
    }

    if (!agreeTerms) {
      setError('Anda harus menyetujui syarat dan ketentuan')
      setLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          username,
          full_name: fullName,
          phone: userType === 'creator' ? phone : null,
          user_type: userType,
        })

        if (profileError) throw profileError

        if (userType === 'sender') {
          await supabase.from('credits').insert({
            user_id: authData.user.id,
            balance: 0,
          })
        }

        if (userType === 'creator') {
          await supabase.from('earnings').insert({
            creator_id: authData.user.id,
            total_earned: 0,
            available_balance: 0,
            pending_balance: 0,
          })
        }

        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center p-4">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        </div>
        <div className="w-full max-w-md text-center relative z-10">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Registrasi Berhasil!
          </h1>
          <p className="text-gray-400 mb-6">
            Cek email kamu untuk verifikasi akun.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold"
          >
            Ke Halaman Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center p-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[250px] w-[250px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Fanonym Title */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-gray-400 text-sm">
            Pilih tipe akun Anda untuk memulai
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/[0.03] border border-white/10 rounded-full p-1 mb-6">
          <button
            onClick={() => setUserType('sender')}
            className={`flex-1 py-3 rounded-full font-medium ${
              userType === 'sender'
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mulai sebagai Sender
          </button>
          <button
            onClick={() => setUserType('creator')}
            className={`flex-1 py-3 rounded-full font-medium ${
              userType === 'creator'
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Daftar sebagai Creator
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
            />

            {/* Username */}
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
              }
              required
              placeholder="username"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
            />

            {/* Display Name */}
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nama Anda"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
            />

            {userType === 'creator' && (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="0812..."
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
              />
            )}

            {/* Password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Password"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Konfirmasi Password"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white"
            />

            {/* Terms */}
            <label className="flex items-start gap-3 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              Saya setuju dengan Syarat & Ketentuan dan Kebijakan Privasi
            </label>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold"
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-gray-400 text-center mt-6">
            Sudah punya akun?{' '}
            <Link
              href="/auth/login"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Masuk di sini
            </Link>
          </p>

          {/* TAMBAHAN */}
          <Link
            href="/"
            className="block text-center text-gray-500 hover:text-gray-300 mt-4 text-sm transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
