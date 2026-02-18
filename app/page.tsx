import Link from "next/link";
import FloatingEmojis from "@/app/components/FloatingEmojis";
import AnimatedStats from "@/app/components/AnimatedStats";
import AnimatedCTA from "@/app/components/AnimatedCTA";
import AnimatedChatMockup from "@/app/components/AnimatedChatMockup";
import CaraKerjaTabs from "@/app/components/CaraKerjaTabs";
import KenapaFanonymCards from "@/app/components/KenapaFanonymCards";

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

            {/* Right Content - Animated Chat Mockup (Desktop) */}
            <div className="relative hidden lg:block">
              <AnimatedChatMockup />
            </div>
          </div>

          {/* Mobile Chat Mockup - Below hero content */}
          <div className="lg:hidden mt-8">
            <AnimatedChatMockup />
          </div>
        </div>
      </section>

      {/* Cara Kerja Section - With Tabs */}
      <CaraKerjaTabs />

      {/* Kenapa Fanonym Section */}
      <section className="relative py-24 px-6 border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Kenapa Fanonym?</h2>
            <p className="text-zinc-400">Platform yang dirancang untuk kenyamanan dan keamananmu</p>
          </div>

          <KenapaFanonymCards />
        </div>
      </section>

      {/* Stats Section - Animated */}
      <AnimatedStats />

      {/* CTA Section - Animated */}
      <AnimatedCTA />

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
