'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'

export default function RegisterPage() {
  const [userType, setUserType] = useState<'sender' | 'creator' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
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

  if (!userType) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Gabung Fanonym</h1>
          <p className="text-gray-400 text-center mb-8">Pilih tipe akun kamu</p>
          <div className="space-y-4">
            <button
              onClick={() => setUserType('creator')}
              className="w-full p-6 bg-gradient-to-r from-teal-500/20 to-teal-600/20 border border-teal-500/50 rounded-xl hover:border-teal-400 transition-all"
            >
              <h3 className="text-xl font-semibold text-white mb-2">🎨 Daftar sebagai Creator</h3>
              <p className="text-gray-400 text-sm">Terima pesan dari fans dan dapatkan penghasilan</p>
            </button>
            <button
              onClick={() => setUserType('sender')}
              className="w-full p-6 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-xl hover:border-purple-400 transition-all"
            >
              <h3 className="text-xl font-semibold text-white mb-2">💬 Mulai sebagai Sender</h3>
              <p className="text-gray-400 text-sm">Kirim pesan anonim ke creator favorit kamu</p>
            </button>
          </div>
          <p className="text-gray-500 text-center mt-8">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-teal-400 hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Registrasi Berhasil!</h1>
          <p className="text-gray-400 mb-6">Cek email kamu untuk verifikasi akun.</p>
          <Link href="/auth/login" className="inline-block px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
            Ke Halaman Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => setUserType(null)} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-white mb-2">
          Daftar sebagai {userType === 'creator' ? 'Creator' : 'Sender'}
        </h1>
        <p className="text-gray-400 mb-6">
          {userType === 'creator' ? 'Lengkapi data untuk mulai menerima pesan' : 'Buat akun untuk mulai kirim pesan anonim'}
        </p>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="Nama Lengkap"
            />
          </div>
          {userType === 'creator' && (
            <div>
              <label className="block text-gray-300 mb-2">Nomor HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="Minimal 6 karakter"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Daftar Sekarang'}
          </button>
        </form>
        <p className="text-gray-500 text-center mt-6">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-teal-400 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}