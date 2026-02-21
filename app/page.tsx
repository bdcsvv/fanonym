'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import Link from "next/link";
import FloatingEmojis from "@/app/components/FloatingEmojis";
import AnimatedStats from "@/app/components/AnimatedStats";
import AnimatedCTA from "@/app/components/AnimatedCTA";
import AnimatedChatMockup from "@/app/components/AnimatedChatMockup";
import CaraKerjaTabs from "@/app/components/CaraKerjaTabs";
import KenapaFanonymCards from "@/app/components/KenapaFanonymCards";
import Navbar from "@/app/components/Navbar";

export default function Home() {
  const router = useRouter()
  const [kenapaAccent, setKenapaAccent] = useState('#8b5cf6')

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single()
        if (profile?.user_type) {
          router.replace(`/dashboard/${profile.user_type}`)
        }
      }
    }
    checkSession()
  }, [])
  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      {/* Floating Emojis Background Animation */}
      <FloatingEmojis />

      {/* Navbar - Animated on Scroll */}
      <Navbar />

      {/* Hero Section - Ramos Style */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 px-6">
        {/* Background Effects - More Bold */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Main gradient blob */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[800px] w-[800px] rounded-full bg-purple-600/20 blur-[180px]" />
          {/* Secondary blobs */}
          <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[160px]" />
          <div className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
          
          {/* Grid pattern - more subtle */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0c0a14_70%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 backdrop-blur-sm px-5 py-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                </span>
                <span className="text-sm font-medium text-purple-200">Platform Pesan Anonim #1 di Indonesia</span>
              </div>
              
              {/* Main Heading - Bigger & Bolder */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  Kirim Pesan
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-violet-400 bg-clip-text text-transparent">
                    Anonim
                  </span>
                  {" "}ke Creator
                </h1>
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  Favoritmu
                </h2>
              </div>
              
              {/* Description */}
              <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
                Sampaikan pesan dan dukunganmu secara anonim. 
                <span className="text-zinc-300"> Identitasmu 100% aman.</span>
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 text-lg font-semibold transition-all hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02]"
                >
                  Mulai Kirim Pesan
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="#cara-kerja"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 text-lg font-semibold transition-all hover:bg-white/10 hover:border-white/20"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-[#0c0a14] flex items-center justify-center text-xs font-bold">
                        {['R', 'A', 'M', 'S'][i]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-zinc-400">1.2K+ users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-zinc-400 ml-1">4.8/5 rating</span>
                </div>
              </div>
            </div>

            {/* Right Content - Chat Mockup with Glassmorphism Frame */}
            <div className="relative hidden lg:block">
              {/* Glow behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-violet-600/20 blur-3xl scale-110" />
              
              {/* Glassmorphism frame */}
              <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
                <AnimatedChatMockup />
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-sm font-medium">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  100% Terenkripsi
                </span>
              </div>

              <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-sm font-medium">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Identitas Terjaga
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Chat Mockup */}
          <div className="lg:hidden mt-12">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
              <AnimatedChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section - With Tabs */}
      <div id="cara-kerja">
        <CaraKerjaTabs />
      </div>

      {/* Kenapa Fanonym Section - Creative */}
      <section className="relative py-24 px-6">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[180px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Section Header - Centered */}
          <div className="mb-16 text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Kenapa{" "}
              <span className="bg-clip-text text-transparent transition-all duration-700" style={{ backgroundImage: `linear-gradient(to right, ${kenapaAccent}, ${kenapaAccent}cc, ${kenapaAccent}88)` }}>
                Fanonym?
              </span>
            </h2>
          </div>

          <KenapaFanonymCards onActiveChange={setKenapaAccent} />
        </div>
      </section>

      {/* Stats Section - Animated */}
      <AnimatedStats />

      {/* CTA Section - Animated */}
      <AnimatedCTA />

      {/* Footer - Enhanced */}
      <footer className="relative border-t border-white/5 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo & Description */}
            <div className="text-center md:text-left">
              <Link href="/" className="font-black italic text-2xl bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] bg-clip-text text-transparent">
                fanonym
              </Link>
              <p className="text-zinc-500 text-sm mt-2 max-w-xs">
                Platform pesan anonim terpercaya untuk creator dan fans di Indonesia.
              </p>
            </div>
            
            {/* Links */}
            <div className="flex items-center gap-8 text-sm">
              <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
                Kebijakan Privasi
              </Link>
              <a href="mailto:support@fanonym.id" className="text-zinc-400 hover:text-white transition-colors">
                Kontak
              </a>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              © 2026 Fanonym. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/fanonym.id" target="_blank" className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://twitter.com/fanonym_id" target="_blank" className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
