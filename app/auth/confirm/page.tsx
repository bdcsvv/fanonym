'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import GalaxyBackground from '@/app/components/GalaxyBackground'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const handleConfirm = async () => {
      // Supabase auto-handles the token from URL hash
      // Check if we have a valid session after confirmation
      const { data: { session }, error } = await supabase.auth.getSession()

      if (session) {
        setStatus('success')
        // Sign out so user goes through proper login flow (creates profile)
        await supabase.auth.signOut()
      } else if (error) {
        setStatus('error')
      } else {
        // No session but no error - try to exchange the hash params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (!sessionError) {
            setStatus('success')
            await supabase.auth.signOut()
          } else {
            setStatus('error')
          }
        } else {
          // Might already be confirmed, just show success
          setStatus('success')
        }
      }
    }

    handleConfirm()
  }, [])

  useEffect(() => {
    if (status !== 'success') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = '/auth/login'
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0c0a14] text-white flex items-center justify-center">
        <GalaxyBackground />
        <div className="relative z-10 text-center">
          <svg className="animate-spin w-12 h-12 text-purple-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-400">Memverifikasi email...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0c0a14] text-white flex items-center justify-center p-6">
        <GalaxyBackground />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">Verifikasi Gagal</h1>
          <p className="text-zinc-400 mb-6">Link verifikasi sudah expired atau tidak valid. Silakan daftar ulang.</p>
          <Link href="/auth/register" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors">
            Daftar Ulang
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white relative flex items-center justify-center p-6">
      <GalaxyBackground />
      
      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-8 shadow-2xl shadow-green-500/50 animate-fadeIn">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent animate-fadeInUp">
          Email Terkonfirmasi! ✅
        </h1>
        
        <p className="text-zinc-400 text-lg mb-8 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          Akun kamu sudah aktif. Silakan login dengan data yang sudah kamu daftarkan.
        </p>

        <div className="space-y-3 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <Link
            href="/auth/login"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login Sekarang
            <span className="text-sm opacity-75">({countdown}s)</span>
          </Link>
        </div>

        <p className="text-zinc-600 text-sm mt-6 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          Otomatis redirect ke login dalam {countdown} detik...
        </p>
      </div>

      <div className="absolute top-1/4 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
    </div>
  )
}
