'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function AnimatedCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <section 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative py-32 px-6 overflow-hidden"
    >
      {/* Mouse follow glow */}
      <div 
        className="pointer-events-none absolute w-[600px] h-[600px] rounded-full blur-[150px] bg-purple-600/20 transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
      />

      {/* Background decorations - Simple geometric shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`
          absolute top-20 left-[10%] w-16 h-16 rounded-2xl rotate-12
          border border-purple-500/20
          transition-all duration-1500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
        `} />
        <div className={`
          absolute bottom-32 right-[15%] w-12 h-12 rounded-full
          border border-violet-500/20
          transition-all duration-1500 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-200
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'}
        `} />
        <div className={`
          absolute top-1/2 left-[5%] w-1 h-16 rounded-full
          bg-gradient-to-b from-purple-500/30 to-transparent
          transition-all duration-1500 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-300
          ${isVisible ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
        `} />
        <div className={`
          absolute top-1/3 right-[8%] w-1 h-24 rounded-full
          bg-gradient-to-b from-violet-500/20 to-transparent
          transition-all duration-1500 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-400
          ${isVisible ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
        `} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Main heading - Split animation */}
        <h2 className="mb-6">
          <span className={`
            block text-4xl sm:text-5xl lg:text-7xl font-bold
            transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${isVisible ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-12 rotate-1'}
          `}>
            Siap Kirim Pesan
          </span>
          <span className={`
            block text-4xl sm:text-5xl lg:text-7xl font-bold mt-2
            bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent
            bg-[length:200%_100%] animate-gradient-x
            transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-150
            ${isVisible ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-12 -rotate-1'}
          `}>
            Pertamamu?
          </span>
        </h2>

        {/* Description */}
        <p className={`
          text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          Gabung dengan ribuan fans yang sudah menggunakan Fanonym untuk
          <span className="text-zinc-300"> berkomunikasi secara aman</span> dengan creator favoritnya.
        </p>

        {/* CTA Buttons */}
        <div className={`
          flex flex-col sm:flex-row items-center justify-center gap-4 mb-12
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-400
          ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}
        `}>
          <Link
            href="/auth/register"
            className="group relative px-10 py-5 rounded-2xl font-semibold text-lg overflow-hidden"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-[length:200%_100%] animate-gradient-x" />
            
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
            
            {/* Glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-purple-500/50" />
            
            <span className="relative z-10 flex items-center gap-3">
              Daftar Gratis
              <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="group px-10 py-5 rounded-2xl font-semibold text-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Lihat Creator
            </span>
          </Link>
        </div>

        {/* Trust badges - Clean without emoji */}
        <div className={`
          flex flex-wrap items-center justify-center gap-8
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          {[
            { text: '100% Anonim' },
            { text: 'Setup < 1 menit' },
            { text: 'Tanpa kartu kredit' },
          ].map((badge, index) => (
            <div 
              key={index}
              className={`
                flex items-center gap-2 text-zinc-400
                transition-all duration-500
                ${isVisible ? 'opacity-100' : 'opacity-0'}
              `}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
