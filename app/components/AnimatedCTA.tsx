'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function AnimatedCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Mouse move effect for gradient follow
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <section ref={containerRef} className="relative py-24 px-6 overflow-hidden">
      {/* Background ambient glow - very subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[600px] h-[400px] rounded-full blur-[150px]
          bg-purple-600/5 transition-all duration-1000
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        `} />
      </div>

      <div className="mx-auto max-w-3xl relative z-10">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className={`
            group relative rounded-3xl overflow-hidden
            transform transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}
          `}
        >
          {/* Subtle border */}
          <div className="absolute inset-0 rounded-3xl border border-zinc-800 group-hover:border-purple-500/30 transition-colors duration-500" />
          
          {/* Main card */}
          <div className="relative bg-zinc-900/40 backdrop-blur-sm rounded-3xl p-12 text-center">
            {/* Dynamic gradient background that follows mouse - more subtle */}
            <div 
              className="absolute inset-0 opacity-30 transition-opacity duration-300 rounded-3xl"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)`
              }}
            />
            
            {/* Base gradient overlay - subtle */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-purple-900/5 rounded-3xl" />
            
            {/* Animated mesh/grid pattern - very subtle */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.02)_1px,transparent_1px)] bg-[size:40px_40px] rounded-3xl" />
            
            {/* Floating orbs - more subtle */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
              {/* Orb 1 */}
              <div className={`
                absolute -top-20 -left-20 w-40 h-40 rounded-full
                bg-purple-600/10 blur-3xl
                transition-all duration-1000 delay-300
                ${isVisible ? 'opacity-100 animate-float' : 'opacity-0'}
              `} style={{ animationDuration: '8s' }} />
              
              {/* Orb 2 */}
              <div className={`
                absolute -bottom-20 -right-20 w-48 h-48 rounded-full
                bg-purple-500/10 blur-3xl
                transition-all duration-1000 delay-500
                ${isVisible ? 'opacity-100 animate-float' : 'opacity-0'}
              `} style={{ animationDuration: '10s', animationDelay: '1s' }} />

              {/* Small sparkles */}
              <div className={`absolute top-8 right-1/4 w-1 h-1 bg-purple-400/50 rounded-full ${isVisible ? 'animate-pulse' : ''}`} />
              <div className={`absolute bottom-12 left-1/4 w-1 h-1 bg-purple-300/40 rounded-full ${isVisible ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.5s' }} />
              <div className={`absolute top-1/3 left-12 w-0.5 h-0.5 bg-white/30 rounded-full ${isVisible ? 'animate-pulse' : ''}`} style={{ animationDelay: '1s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Badge */}
              <div className={`
                inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full
                bg-purple-500/10 border border-purple-500/30
                transform transition-all duration-500 delay-200
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
              `}>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-purple-300">Gratis untuk memulai</span>
              </div>

              {/* Heading */}
              <h2 className={`
                text-3xl sm:text-4xl lg:text-5xl font-bold mb-4
                transform transition-all duration-500 delay-300
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Siap Kirim Pesan Pertamamu?
                </span>
              </h2>
              
              {/* Description */}
              <p className={`
                text-zinc-400 mb-8 max-w-lg mx-auto leading-relaxed
                transform transition-all duration-500 delay-400
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                Bergabung dengan ribuan fans yang sudah menggunakan Fanonym 
                untuk berkomunikasi secara aman dengan creator favorit mereka.
              </p>
              
              {/* CTA Button */}
              <div className={`
                transform transition-all duration-500 delay-500
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                <Link
                  href="/auth/register"
                  className="group relative inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold overflow-hidden"
                >
                  {/* Button gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 bg-[length:200%_100%] animate-gradient-x" />
                  
                  {/* Button hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500" />
                  
                  {/* Button shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white to-transparent" />
                  </div>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center gap-2">
                    Daftar Sekarang — Gratis
                    <svg 
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className={`
                flex items-center justify-center gap-6 mt-8 text-sm text-zinc-500
                transform transition-all duration-500 delay-600
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Anonim</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Tanpa kartu kredit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
