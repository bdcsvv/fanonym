'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import GalaxyBackground from '@/app/components/GalaxyBackground'

function SuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const userType = searchParams.get('type') // 'creator' or 'sender'
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
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
  }, [])

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white relative flex items-center justify-center p-6">
      {/* Galaxy Background */}
      <GalaxyBackground />

      {/* Success Card */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Animated Success Icon */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-6 animate-scaleIn shadow-2xl shadow-green-500/50">
            <svg className="w-12 h-12 text-white animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent animate-fadeInUp">
            Pendaftaran Berhasil! 🎉
          </h1>
          
          <p className="text-xl text-zinc-300 mb-2 animate-fadeInUp stagger-1">
            Selamat datang di <span className="font-bold text-purple-400">Fanonym</span>!
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 mb-6 animate-fadeInUp stagger-2">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Email Konfirmasi Terkirim</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Kami telah mengirim email konfirmasi ke <span className="text-purple-400 font-semibold">{email}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-400">1</span>
              </div>
              <p className="text-sm text-zinc-300">
                <span className="font-semibold">Buka inbox email Anda</span> dan cari email dari Fanonym
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-400">2</span>
              </div>
              <p className="text-sm text-zinc-300">
                <span className="font-semibold">Klik link konfirmasi</span> untuk mengaktifkan akun
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-400">3</span>
              </div>
              <p className="text-sm text-zinc-300">
                <span className="font-semibold">Login</span> dan mulai {userType === 'creator' ? 'menerima pesan anonim' : 'mengirim pesan anonim'}!
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-yellow-200">
                <span className="font-semibold">Tidak menerima email?</span> Cek folder spam atau tunggu beberapa menit. Link konfirmasi berlaku 24 jam.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fadeInUp stagger-3">
          <Link
            href="/auth/login"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/75 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Lanjut ke Login
            <span className="text-sm opacity-75">({countdown}s)</span>
          </Link>

          <Link
            href="/"
            className="w-full py-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-2xl font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center animate-fadeInUp stagger-4">
          <p className="text-sm text-zinc-500">
            Butuh bantuan? <Link href="/help" className="text-purple-400 hover:text-purple-300 underline">Hubungi Support</Link>
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes checkmark {
          0% {
            stroke-dasharray: 0, 100;
          }
          100% {
            stroke-dasharray: 100, 0;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-checkmark {
          stroke-dasharray: 100;
          animation: checkmark 0.6s ease-in-out 0.3s forwards;
        }
        .stagger-1 {
          animation-delay: 0.1s;
        }
        .stagger-2 {
          animation-delay: 0.2s;
        }
        .stagger-3 {
          animation-delay: 0.3s;
        }
        .stagger-4 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  )
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0a14]" />}>
      <SuccessContent />
    </Suspense>
  )
}
