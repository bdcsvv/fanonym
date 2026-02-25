'use client'

import Link from 'next/link'
import Navbar from '@/app/components/Navbar'
import GalaxyBackground from '@/app/components/GalaxyBackground'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      <GalaxyBackground />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 backdrop-blur-sm px-5 py-2.5 mb-8">
              <span className="text-sm font-medium text-purple-200">Hubungi Kami</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Butuh{' '}
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-violet-400 bg-clip-text text-transparent">
                Bantuan?
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Tim Fanonym siap membantu kamu. Hubungi kami melalui email di bawah ini.
            </p>
          </div>

          {/* Email Card */}
          <div className="max-w-md mx-auto mb-16">
            <a
              href="mailto:admin@fanonym.id"
              className="group block rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 text-center transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/5 hover:scale-[1.02]"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/25 transition-colors">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-1">Email</h3>
              <p className="text-purple-400 font-medium">admin@fanonym.id</p>
              <p className="text-zinc-500 text-xs mt-2">Respon dalam 1x24 jam</p>
            </a>
          </div>

          {/* Social Media */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-center mb-6">Ikuti Kami</h2>
            <div className="flex justify-center gap-4">
              <a
                href="https://instagram.com/fanonym.id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3 transition-all hover:bg-white/10 hover:border-pink-500/30"
              >
                <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-sm font-medium">@fanonym.id</span>
              </a>
              <a
                href="https://twitter.com/fanonym_id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3 transition-all hover:bg-white/10 hover:border-blue-500/30"
              >
                <svg className="w-5 h-5 text-zinc-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-sm font-medium">@fanonym_id</span>
              </a>
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
