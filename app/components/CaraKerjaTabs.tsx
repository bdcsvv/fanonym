'use client'

import { useState, useEffect, useRef } from 'react'

type Role = 'sender' | 'creator'

interface Step {
  icon: React.ReactNode
  title: string
  description: string
}

const senderSteps: Step[] = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Cari Creator',
    description: 'Temukan creator favorit kamu dari daftar creator yang tersedia di platform.'
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Beli Kredit',
    description: 'Top up kredit dengan mudah untuk membuka akses pengiriman pesan anonim.'
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    title: 'Daftar Gratis',
    description: 'Buat akun creator dalam hitungan detik. Gratis, tanpa biaya apapun.'
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    title: 'Share Link',
    description: 'Bagikan link Fanonym unikmu ke followers di Instagram, TikTok, Twitter, dll.'
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Terima & Cairkan',
    description: 'Terima pesan + gift dari fans. Cairkan kredit jadi uang tunai kapan saja.'
  },
]

export default function CaraKerjaTabs() {
  const [activeRole, setActiveRole] = useState<Role>('sender')
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentSteps = activeRole === 'sender' ? senderSteps : creatorSteps

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Auto-cycle through steps
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % currentSteps.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isVisible, currentSteps.length, activeRole])

  // Handle tab switch
  const handleTabSwitch = (role: Role) => {
    if (role === activeRole || isAnimating) return
    
    setIsAnimating(true)
    setActiveStep(0)
    
    setTimeout(() => {
      setActiveRole(role)
      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }, 200)
  }

  return (
    <section ref={containerRef} id="cara-kerja" className="relative py-24 px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[600px] h-[600px] rounded-full blur-[150px]
          transition-colors duration-700
          ${activeRole === 'sender' ? 'bg-purple-600/10' : 'bg-cyan-600/10'}
        `} />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className={`
          text-center mb-12 transition-all duration-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cara Kerja</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Mulai dalam hitungan menit. Pilih peranmu dan ikuti langkah mudah berikut.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`
          flex justify-center mb-12 transition-all duration-700 delay-100
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <div className="inline-flex p-1.5 bg-zinc-900 rounded-2xl border border-zinc-800">
            <button
              onClick={() => handleTabSwitch('sender')}
              className={`
                relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                ${activeRole === 'sender' 
                  ? 'text-white' 
                  : 'text-zinc-400 hover:text-zinc-200'
                }
              `}
            >
              {activeRole === 'sender' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl transition-all duration-300" />
              )}
              <span className="relative z-10">Sebagai Pengirim</span>
            </button>
            
            <button
              onClick={() => handleTabSwitch('creator')}
              className={`
                relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                ${activeRole === 'creator' 
                  ? 'text-white' 
                  : 'text-zinc-400 hover:text-zinc-200'
                }
              `}
            >
              {activeRole === 'creator' && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl transition-all duration-300" />
              )}
              <span className="relative z-10">Sebagai Creator</span>
            </button>
          </div>
        </div>

        {/* Desktop: Steps Grid */}
        <div className={`
          hidden md:grid md:grid-cols-3 gap-6 transition-all duration-500
          ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}>
          {currentSteps.map((step, index) => (
            <div
              key={`${activeRole}-${index}`}
              className={`
                relative group transform transition-all duration-700 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
              `}
              style={{ transitionDelay: isVisible ? `${index * 150 + 200}ms` : '0ms' }}
              onMouseEnter={() => setActiveStep(index)}
            >
              {/* Step number */}
              <div className={`
                absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                shadow-lg transition-all duration-300 z-10
                ${activeStep === index 
                  ? activeRole === 'sender'
                    ? 'bg-purple-600 shadow-purple-600/50 scale-110'
                    : 'bg-cyan-600 shadow-cyan-600/50 scale-110'
                  : 'bg-zinc-700 shadow-none scale-100'
                }
              `}>
                {index + 1}
              </div>

              {/* Card */}
              <div className={`
                relative rounded-2xl p-8 border transition-all duration-500
                ${activeStep === index
                  ? activeRole === 'sender'
                    ? 'bg-purple-600/10 border-purple-500/30 shadow-xl shadow-purple-600/10'
                    : 'bg-cyan-600/10 border-cyan-500/30 shadow-xl shadow-cyan-600/10'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }
              `}>
                {/* Glow effect */}
                <div className={`
                  absolute -inset-[1px] rounded-2xl transition-opacity duration-500
                  ${activeStep === index ? 'opacity-100' : 'opacity-0'}
                  ${activeRole === 'sender' 
                    ? 'bg-gradient-to-r from-purple-600/20 via-purple-400/10 to-purple-600/20' 
                    : 'bg-gradient-to-r from-cyan-600/20 via-cyan-400/10 to-cyan-600/20'
                  }
                  blur-xl -z-10
                `} />

                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-6
                  transition-all duration-500
                  ${activeStep === index
                    ? activeRole === 'sender'
                      ? 'bg-purple-600/30 text-purple-300'
                      : 'bg-cyan-600/30 text-cyan-300'
                    : 'bg-zinc-800 text-zinc-400'
                  }
                `}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className={`
                  text-xl font-semibold mb-3 transition-colors duration-300
                  ${activeStep === index
                    ? activeRole === 'sender' ? 'text-purple-300' : 'text-cyan-300'
                    : 'text-white'
                  }
                `}>
                  {step.title}
                </h3>

                <p className="text-zinc-400 text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Progress bar for active step */}
                {activeStep === index && (
                  <div className="mt-6 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`
                        h-full rounded-full animate-progress
                        ${activeRole === 'sender' ? 'bg-purple-500' : 'bg-cyan-500'}
                      `}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <div className={`
            transition-all duration-500
            ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}>
            {/* Active Step Display */}
            <div className="relative">
              <div className={`
                relative rounded-2xl p-6 border transition-all duration-500
                ${activeRole === 'sender'
                  ? 'bg-purple-600/10 border-purple-500/30'
                  : 'bg-cyan-600/10 border-cyan-500/30'
                }
              `}>
                {/* Step number */}
                <div className={`
                  absolute -top-3 -left-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10
                  ${activeRole === 'sender' ? 'bg-purple-600' : 'bg-cyan-600'}
                `}>
                  {activeStep + 1}
                </div>

                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4
                  ${activeRole === 'sender' ? 'bg-purple-600/30 text-purple-300' : 'bg-cyan-600/30 text-cyan-300'}
                `}>
                  {currentSteps[activeStep].icon}
                </div>

                {/* Content */}
                <h3 className={`
                  text-lg font-semibold mb-2
                  ${activeRole === 'sender' ? 'text-purple-300' : 'text-cyan-300'}
                `}>
                  {currentSteps[activeStep].title}
                </h3>

                <p className="text-zinc-400 text-sm leading-relaxed">
                  {currentSteps[activeStep].description}
                </p>

                {/* Progress bar */}
                <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`
                      h-full rounded-full animate-progress
                      ${activeRole === 'sender' ? 'bg-purple-500' : 'bg-cyan-500'}
                    `}
                  />
                </div>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {currentSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${activeStep === index 
                      ? `w-8 ${activeRole === 'sender' ? 'bg-purple-500' : 'bg-cyan-500'}` 
                      : 'w-2 bg-zinc-700 hover:bg-zinc-600'
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA based on role */}
        <div className={`
          text-center mt-12 transition-all duration-700 delay-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <a
            href={activeRole === 'sender' ? '/explore' : '/auth/register'}
            className={`
              inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold
              transition-all duration-300 hover:scale-105 hover:shadow-lg
              ${activeRole === 'sender'
                ? 'bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/25'
                : 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/25'
              }
            `}
          >
            {activeRole === 'sender' ? 'Cari Creator Sekarang' : 'Daftar Jadi Creator'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
