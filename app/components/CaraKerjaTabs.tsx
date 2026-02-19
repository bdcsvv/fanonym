'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Role = 'sender' | 'creator'

interface Step {
  icon: React.ReactNode
  title: string
  description: string
}

const senderSteps: Step[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Cari Creator',
    description: 'Temukan creator favorit kamu dari daftar creator yang tersedia di platform.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Beli Kredit',
    description: 'Top up kredit dengan mudah untuk membuka akses pengiriman pesan anonim.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    title: 'Kirim Pesan',
    description: 'Tulis dan kirim pesanmu secara anonim. Identitasmu 100% terjaga rahasianya.'
  },
]

const creatorSteps: Step[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    title: 'Daftar Gratis',
    description: 'Buat akun creator dalam hitungan detik. Gratis, tanpa biaya apapun.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    title: 'Share Link',
    description: 'Bagikan link Fanonym unikmu ke followers di Instagram, TikTok, Twitter, dll.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Terima & Cairkan',
    description: 'Terima pesan + gift dari fans. Cairkan kredit jadi uang tunai kapan saja.'
  },
]

export default function CaraKerjaTabs() {
  const [activeRole, setActiveRole] = useState<Role>('sender')
  const [activeStep, setActiveStep] = useState(0)
  const [mobileActiveStep, setMobileActiveStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const currentSteps = activeRole === 'sender' ? senderSteps : creatorSteps

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

  // Desktop auto-cycle
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % currentSteps.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isVisible, currentSteps.length, activeRole])

  const handleTabSwitch = (role: Role) => {
    if (role === activeRole) return
    setActiveRole(role)
    setActiveStep(0)
    setMobileActiveStep(0)
  }

  // Handle mobile scroll snap
  const handleMobileScroll = () => {
    if (!scrollContainerRef.current) return
    const scrollLeft = scrollContainerRef.current.scrollLeft
    const cardWidth = scrollContainerRef.current.offsetWidth * 0.85
    const newIndex = Math.round(scrollLeft / cardWidth)
    setMobileActiveStep(Math.min(newIndex, currentSteps.length - 1))
  }

  return (
    <section 
      ref={containerRef} 
      id="cara-kerja" 
      className="relative py-20"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[800px] h-[800px] rounded-full blur-[200px]
          transition-all duration-1000
          ${activeRole === 'sender' ? 'bg-purple-600/10' : 'bg-cyan-600/10'}
        `} />
      </div>

      {/* Header + Tabs - padded */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className={`
          text-center mb-12 
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-20 scale-90 blur-sm'}
        `}>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Cara Kerja</h2>
          <p className="text-zinc-400 text-lg">
            Mulai dalam hitungan menit. Pilih peranmu dan ikuti langkah mudah berikut.
          </p>
        </div>

        <div className={`
          flex justify-center mb-12 
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-150
          ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-75'}
        `}>
          <div className="inline-flex p-1.5 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10">
            <button
              onClick={() => handleTabSwitch('sender')}
              className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeRole === 'sender' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {activeRole === 'sender' && <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl animate-scale-in" />}
              <span className="relative z-10">Sebagai Pengirim</span>
            </button>
            <button
              onClick={() => handleTabSwitch('creator')}
              className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeRole === 'creator' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {activeRole === 'creator' && <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl animate-scale-in" />}
              <span className="relative z-10">Sebagai Creator</span>
            </button>
          </div>
        </div>

        {/* Desktop Steps Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {currentSteps.map((step, index) => (
            <div
              key={`${activeRole}-${index}`}
              className={`
                group relative cursor-pointer
                transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isVisible ? 'opacity-100 translate-y-0 rotate-0 scale-100 blur-0' : 'opacity-0 translate-y-24 rotate-3 scale-75 blur-sm'}
              `}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
              onMouseEnter={() => setActiveStep(index)}
            >
              <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-20 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeStep === index ? activeRole === 'sender' ? 'bg-purple-600 shadow-lg shadow-purple-600/50 scale-125' : 'bg-cyan-600 shadow-lg shadow-cyan-600/50 scale-125' : 'bg-zinc-700 scale-100'}`}>
                {index + 1}
              </div>
              <div className={`relative rounded-2xl p-6 border transition-all duration-500 h-full hover:-translate-y-2 hover:shadow-2xl ${activeStep === index ? activeRole === 'sender' ? 'bg-purple-600/10 border-purple-500/30 shadow-xl shadow-purple-600/10 -translate-y-1' : 'bg-cyan-600/10 border-cyan-500/30 shadow-xl shadow-cyan-600/10 -translate-y-1' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${activeStep === index ? activeRole === 'sender' ? 'bg-purple-600/30 text-purple-300' : 'bg-cyan-600/30 text-cyan-300' : 'bg-zinc-800 text-zinc-400'}`}>
                  {step.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${activeStep === index ? activeRole === 'sender' ? 'text-purple-300' : 'text-cyan-300' : 'text-white'}`}>
                  {step.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                {activeStep === index && (
                  <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full animate-progress-bar ${activeRole === 'sender' ? 'bg-purple-500' : 'bg-cyan-500'}`} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Carousel - OUTSIDE padded container, full width */}
      <div className="md:hidden relative z-10 mt-0">
        <div 
          ref={scrollContainerRef}
          onScroll={handleMobileScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', paddingLeft: '24px', paddingRight: '24px' }}
        >
          {currentSteps.map((step, index) => (
            <div
              key={`mobile-${activeRole}-${index}`}
              className={`flex-shrink-0 snap-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ width: 'calc(100vw - 72px)', transitionDelay: `${index * 100}ms` }}
            >
              <div className={`relative rounded-2xl p-6 border h-full ${mobileActiveStep === index ? activeRole === 'sender' ? 'bg-purple-600/10 border-purple-500/30' : 'bg-cyan-600/10 border-cyan-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${activeRole === 'sender' ? 'bg-purple-600' : 'bg-cyan-600'}`}>
                  {index + 1}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${activeRole === 'sender' ? 'bg-purple-600/30 text-purple-300' : 'bg-cyan-600/30 text-cyan-300'}`}>
                  {step.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${activeRole === 'sender' ? 'text-purple-300' : 'text-cyan-300'}`}>
                  {step.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {currentSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${mobileActiveStep === index ? `w-6 ${activeRole === 'sender' ? 'bg-purple-500' : 'bg-cyan-500'}` : 'w-2 bg-zinc-700'}`}
            />
          ))}
        </div>
      </div>

      {/* CTA Button - padded */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className={`text-center mt-12 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'}`}
          style={{ transitionDelay: '700ms' }}
        >
          <Link
            href={activeRole === 'sender' ? '/auth/login' : '/auth/register'}
            className={`group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 ${activeRole === 'sender' ? 'bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/40' : 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/40'}`}
          >
            {activeRole === 'sender' ? 'Cari Creator Sekarang' : 'Daftar Jadi Creator'}
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
