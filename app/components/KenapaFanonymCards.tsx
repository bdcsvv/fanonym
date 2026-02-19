'use client'

import { useEffect, useRef, useState } from 'react'

const features = [
  {
    id: 'aman',
    title: 'Aman',
    description: 'Data dan identitasmu dilindungi dengan enkripsi tingkat tinggi. Tidak ada yang bisa melacak pesanmu.',
    highlight: 'Enkripsi End-to-End',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 'anonim',
    title: 'Anonim',
    description: 'Identitasmu 100% tersembunyi. Kirim pesan tanpa rasa khawatir identitasmu akan terungkap.',
    highlight: '100% Private',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    id: 'mudah',
    title: 'Mudah',
    description: 'Proses simpel dan cepat. Daftar, beli kredit, langsung kirim pesan pertamamu.',
    highlight: '< 1 Menit Setup',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
]

export default function KenapaFanonymCards() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
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

  return (
    <div ref={containerRef} className="relative">
      {/* Desktop - Clean Bento Grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-5">
        {/* First row - 2 equal cards */}
        {features.slice(0, 2).map((feature, index) => (
          <div
            key={feature.id}
            className={`
              relative group rounded-3xl p-8 overflow-hidden cursor-pointer
              bg-gradient-to-br from-purple-900/50 via-purple-900/30 to-transparent
              border border-purple-500/20
              transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10
              ${isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-16'
              }
            `}
            style={{ transitionDelay: `${index * 150}ms` }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Background glow */}
            <div className={`
              absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent
              transition-opacity duration-500
              ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}
            `} />

            {/* Icon - top right */}
            <div className={`
              absolute top-8 right-8 w-16 h-16 rounded-2xl
              bg-purple-500/20 border border-purple-500/30
              flex items-center justify-center text-purple-300
              transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${hoveredIndex === index ? 'scale-110 rotate-[-5deg]' : 'scale-100 rotate-0'}
            `}>
              {feature.icon}
            </div>

            {/* Content */}
            <div className="relative z-10 pt-20">
              <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium mb-4 bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {feature.highlight}
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}

        {/* Second row - Full width card */}
        <div
          className={`
            col-span-2 relative group rounded-3xl p-8 overflow-hidden cursor-pointer
            bg-gradient-to-r from-purple-900/50 via-purple-900/30 to-purple-900/50
            border border-purple-500/20
            transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10
            ${isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-16'
            }
          `}
          style={{ transitionDelay: '300ms' }}
          onMouseEnter={() => setHoveredIndex(2)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="flex items-center gap-8">
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-16 h-16 rounded-2xl
              bg-purple-500/20 border border-purple-500/30
              flex items-center justify-center text-purple-300
              transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${hoveredIndex === 2 ? 'scale-110' : 'scale-100'}
            `}>
              {features[2].icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-white">{features[2].title}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {features[2].highlight}
                </span>
              </div>
              <p className="text-zinc-400">{features[2].description}</p>
            </div>
          </div>

          {/* Animated bottom line */}
          <div className={`
            absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500
            transition-all duration-700
            ${hoveredIndex === 2 ? 'w-full' : 'w-0'}
          `} />
        </div>
      </div>

      {/* Mobile - Clean stack */}
      <div className="md:hidden space-y-4">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={`
              relative p-6 rounded-2xl overflow-hidden
              bg-gradient-to-br from-purple-900/40 to-transparent
              border border-purple-500/20
              transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isVisible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-8'
              }
            `}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {feature.highlight}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
