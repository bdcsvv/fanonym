import Link from "next/link";
import FloatingEmojis from "@/app/components/FloatingEmojis";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      {/* Floating Emojis Background Animation */}
      <FloatingEmojis />

      {/* Navbar - Fixed */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-black text-2xl bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-zinc-400 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium transition-all hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-500/50"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-20">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/4 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
          <div className="absolute right-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[120px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Platform Pesan Anonim #1 di Indonesia
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Kirim Pesan Anonim{" "}
                <span className="text-purple-400">ke Creator Favoritmu</span>
              </h1>
              
              <p className="text-lg text-zinc-400 max-w-lg">
                Sampaikan pesan, pertanyaan, atau dukunganmu secara anonim. 
                Identitasmu tetap rahasia, pesanmu tetap tersampaikan dengan aman.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3.5 text-base font-semibold transition-all hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  Mulai Kirim Pesan
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="#cara-kerja"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-6 py-3.5 text-base font-semibold transition-all hover:bg-zinc-800 hover:border-zinc-600"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>

            {/* Right Content - Chat Mockup */}
            <div className="relative hidden lg:block">
              {/* 100% Anonim Badge */}
              <div className="absolute -top-4 right-20 bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-xl px-4 py-2 flex items-center gap-2 z-10 animate-fadeIn">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">100% Anonim</span>
              </div>

              {/* Terenkripsi Badge */}
              <div className="absolute bottom-20 -right-4 bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-xl px-4 py-2 flex items-center gap-2 z-10 animate-fadeIn stagger-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">Terenkripsi</span>
              </div>

              {/* Chat Window */}
              <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-4 shadow-2xl animate-fadeInUp">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Creator Favorit</p>
                      <p className="text-xs text-green-400">Online</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 min-h-[280px]">
                  {/* Message from Anon */}
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                      <p className="text-xs text-purple-400 mb-1">👤 ANONIM</p>
                      <p className="text-sm">Semangat terus bikin kontennya ya! 🔥</p>
                      <p className="text-xs text-zinc-500 mt-1">10:05</p>
                    </div>
                  </div>

                  {/* Message from Creator */}
                  <div className="flex justify-end">
                    <div className="bg-purple-600 rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                      <p className="text-sm">Terima kasih banyak! Senang dengarnya. 💜</p>
                      <p className="text-xs text-purple-200 mt-1">10:07</p>
                    </div>
                  </div>

                  {/* Another message from Anon */}
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                      <p className="text-xs text-purple-400 mb-1">👤 ANONIM</p>
                      <p className="text-sm">Kapan kolaborasi lagi sama...</p>
                      <p className="text-xs text-zinc-500 mt-1">10:15</p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="mt-4 flex items-center gap-2 bg-zinc-800/50 rounded-xl px-4 py-3 border border-zinc-700">
                  <input 
                    type="text" 
                    placeholder="Kirim pesan anonim..." 
                    className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-500"
                    disabled
                  />
                  <button className="text-purple-400 hover:text-purple-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="relative py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-zinc-400">Tiga langkah mudah untuk mengirim pesan anonim</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
                <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Pilih Creator</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Temukan creator favoritmu dari daftar creator yang tersedia di platform kami.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
                <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Beli Kredit</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Top up kredit dengan mudah untuk membuka akses pengiriman pesan anonim.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
                <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Kirim Pesan</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Tulis dan kirim pesanmu secara anonim. Identitasmu 100% terjaga rahasianya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kenapa Fanonym Section */}
      <section className="relative py-24 px-6 border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Kenapa Fanonym?</h2>
            <p className="text-zinc-400">Platform yang dirancang untuk kenyamanan dan keamananmu</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Aman */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 text-center hover:border-purple-500/30 transition-colors">
              <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Aman</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Data dan identitasmu dilindungi dengan enkripsi tingkat tinggi. Tidak ada yang bisa melacak pesanmu.
              </p>
            </div>

            {/* Anonim */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 text-center hover:border-purple-500/30 transition-colors">
              <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Anonim</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Identitasmu 100% tersembunyi. Kirim pesan tanpa rasa khawatir identitasmu akan terungkap.
              </p>
            </div>

            {/* Mudah */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 text-center hover:border-purple-500/30 transition-colors">
              <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Mudah</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Proses yang simpel dan sangat cepat. Daftar, beli kredit, dan langsung kirim pesan perdanamu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6 border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">1M+</p>
              <p className="text-sm text-zinc-400 uppercase tracking-wider">Pesan Terkirim</p>
            </div>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">50K+</p>
              <p className="text-sm text-zinc-400 uppercase tracking-wider">Creator Aktif</p>
            </div>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">100K+</p>
              <p className="text-sm text-zinc-400 uppercase tracking-wider">Fans Bergabung</p>
            </div>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">4.9/5</p>
              <p className="text-sm text-zinc-400 uppercase tracking-wider">Rating Kepuasan</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-purple-600/10" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Siap Kirim Pesan Pertamamu?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Bergabung dengan ribuan fans yang sudah menggunakan Fanonym 
                untuk berkomunikasi secara aman dengan creator favorit mereka.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-base font-semibold transition-all hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Daftar Sekarang — Gratis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="font-black text-xl bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>
          
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/terms" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <a href="mailto:support@fanonym.id" className="hover:text-white transition-colors">
              Kontak
            </a>
          </div>
        </div>
        
        <div className="mx-auto max-w-6xl mt-8 pt-8 border-t border-zinc-800/50">
          <p className="text-center text-sm text-zinc-500">
            © 2026 Fanonym. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
