'use client'

import Link from 'next/link'
import Navbar from '@/app/components/Navbar'
import GalaxyBackground from '@/app/components/GalaxyBackground'
import { useState } from 'react'

const TOPUP_OPTIONS = [
  { credits: 5, price: 50000, popular: false },
  { credits: 10, price: 100000, popular: false },
  { credits: 25, price: 250000, popular: true },
  { credits: 50, price: 500000, popular: false },
  { credits: 100, price: 1000000, popular: false },
]

const KREDIT_TO_IDR = 10000

export default function PricingPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      <GalaxyBackground />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 backdrop-blur-sm px-5 py-2.5 mb-8">
              <span className="text-sm font-medium text-purple-200">Harga Kredit Fanonym</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Pilih Paket{' '}
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-violet-400 bg-clip-text text-transparent">
                Kredit
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Beli kredit untuk mengirim pesan anonim ke creator favoritmu.
              <span className="text-zinc-300"> Semakin banyak kredit, semakin hemat!</span>
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {TOPUP_OPTIONS.slice(0, 3).map((option, index) => (
              <div
                key={option.credits}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  relative rounded-2xl border p-6 transition-all duration-300 cursor-pointer backdrop-blur-sm
                  ${option.popular 
                    ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10' 
                    : 'border-white/10 bg-white/[0.03] hover:border-purple-500/30 hover:bg-purple-500/5'
                  }
                  ${hoveredIndex === index ? 'scale-[1.02]' : ''}
                `}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-xs font-bold uppercase tracking-wider">
                    Populer
                  </div>
                )}
                <div className="text-center">
                  <p className={`text-5xl font-bold mb-1 ${option.popular ? 'text-purple-400' : 'bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent'}`}>
                    {option.credits}
                  </p>
                  <p className="text-zinc-400 text-sm mb-4">Kredit</p>
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <p className="text-2xl font-bold text-white">
                      Rp {option.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      Rp {KREDIT_TO_IDR.toLocaleString('id-ID')} / kredit
                    </p>
                  </div>
                  <Link
                    href="/auth/register"
                    className={`
                      block w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300
                      ${option.popular
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30'
                        : 'bg-white/10 hover:bg-white/15 border border-white/10'
                      }
                    `}
                  >
                    Beli Sekarang
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom row - 2 cards centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto mb-16">
            {TOPUP_OPTIONS.slice(3).map((option, index) => (
              <div
                key={option.credits}
                onMouseEnter={() => setHoveredIndex(index + 3)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  relative rounded-2xl border p-6 transition-all duration-300 cursor-pointer backdrop-blur-sm
                  border-white/10 bg-white/[0.03] hover:border-purple-500/30 hover:bg-purple-500/5
                  ${hoveredIndex === index + 3 ? 'scale-[1.02]' : ''}
                `}
              >
                <div className="text-center">
                  <p className="text-5xl font-bold mb-1 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    {option.credits}
                  </p>
                  <p className="text-zinc-400 text-sm mb-4">Kredit</p>
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <p className="text-2xl font-bold text-white">
                      Rp {option.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      Rp {KREDIT_TO_IDR.toLocaleString('id-ID')} / kredit
                    </p>
                  </div>
                  <Link
                    href="/auth/register"
                    className="block w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    Beli Sekarang
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Cara Kerja Kredit</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-purple-400">1</span>
                </div>
                <h3 className="font-semibold mb-2">Beli Kredit</h3>
                <p className="text-zinc-400 text-sm">Pilih paket kredit sesuai kebutuhanmu dan lakukan pembayaran.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-purple-400">2</span>
                </div>
                <h3 className="font-semibold mb-2">Kirim Pesan</h3>
                <p className="text-zinc-400 text-sm">Gunakan kredit untuk mengirim pesan anonim ke creator favoritmu.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-purple-400">3</span>
                </div>
                <h3 className="font-semibold mb-2">Dapat Balasan</h3>
                <p className="text-zinc-400 text-sm">Creator membalas pesanmu melalui sesi chat dengan waktu terbatas.</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Pertanyaan Umum</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Apa itu kredit Fanonym?',
                  a: 'Kredit adalah mata uang digital di Fanonym yang digunakan untuk mengirim pesan anonim ke creator. 1 kredit = Rp 10.000.'
                },
                {
                  q: 'Bagaimana cara pembayaran?',
                  a: 'Saat ini kami menerima pembayaran melalui QRIS yang bisa di-scan dari berbagai aplikasi e-wallet dan mobile banking.'
                },
                {
                  q: 'Apakah kredit bisa di-refund?',
                  a: 'Kredit yang sudah dibeli tidak bisa di-refund. Pastikan kamu memilih paket yang sesuai kebutuhanmu.'
                },
                {
                  q: 'Berapa kredit yang dibutuhkan per pesan?',
                  a: 'Jumlah kredit per pesan ditentukan oleh masing-masing creator. Biasanya berkisar antara 1-5 kredit per pesan.'
                },
              ].map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-10">
              <h2 className="text-3xl font-bold mb-4">Siap Kirim Pesan?</h2>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Daftar sekarang dan mulai kirim pesan anonim ke creator favoritmu. Gratis untuk memulai!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-3.5 font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]"
                >
                  Daftar Gratis
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 font-semibold transition-all hover:bg-white/10"
                >
                  Lihat Creator
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <Link href="/" className="font-black italic text-2xl bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] bg-clip-text text-transparent">
                fanonym
              </Link>
              <p className="text-zinc-500 text-sm mt-2 max-w-xs">
                Platform pesan anonim terpercaya untuk creator dan fans di Indonesia.
              </p>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Syarat & Ketentuan</Link>
              <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Kebijakan Privasi</Link>
              <Link href="/pricing" className="text-zinc-400 hover:text-white transition-colors">Harga</Link>
              <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">Kontak</Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-zinc-500">© 2026 Fanonym. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
