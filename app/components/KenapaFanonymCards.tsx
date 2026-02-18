'use client'

import { useEffect, useRef, useState } from 'react'

// Custom animated icon for "Aman" - Shield with pulse protection
const AmanIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Pulse rings */}
      <div className={`absolute inset-0 rounded-full bg-purple-500/20 transition-all duration-500 ${isActive ? 'animate-ping-slow' : 'opacity-0'}`} />
      <div className={`absolute inset-2 rounded-full bg-purple-500/30 transition-all duration-500 ${isActive ? 'animate-ping-slower' : 'opacity-0'}`} />
      
      {/* Shield icon */}
      <svg 
        className={`w-8 h-8 text-purple-400 relative z-10 transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          className={`${isActive ? 'animate-draw-check' : ''}`}
          style={{ strokeDasharray: isActive ? '100' : '0', strokeDashoffset: isActive ? '0' : '100' }}
        />
      </svg>
      
      {/* Floating particles */}
      {isActive && (
        <>
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-float-particle-1" />
          <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-purple-300 rounded-full animate-float-particle-2" />
          <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-purple-500 rounded-full animate-float-particle-3" />
        </>
      )}
    </div>
  )
}

// Custom animated icon for "Anonim" - User transforms to hidden/lock
const AnonimIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden">
      {/* User icon - fades out */}
      <svg 
        className={`w-8 h-8 text-purple-400 absolute transition-all duration-700 ease-in-out ${
          isActive ? 'opacity-0 scale-50 blur-sm' : 'opacity-100 scale-100 blur-0'
        }`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      
      {/* Lock icon - fades in */}
      <svg 
        className={`w-8 h-8 text-purple-400 absolute transition-all duration-700 ease-in-out ${
          isActive ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-150 blur-sm'
        }`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      
      {/* Question marks floating around when active */}
      {isActive && (
        <>
          <span className="absolute -top-1 -right-1 text-xs text-purple-400 animate-float-question-1">?</span>
          <span className="absolute -bottom-1 -left-1 text-xs text-purple-300 animate-float-question-2">?</span>
          <span className="absolute top-0 -left-2 text-[10px] text-purple-500 animate-float-question-3">?</span>
        </>
      )}
      
      {/* Mask overlay effect */}
      <div className={`absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

// Custom animated icon for "Mudah" - Lightning bolt with flash effect
const MudahIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Flash burst effect */}
      <div className={`absolute inset-0 bg-purple-400/30 rounded-full transition-all duration-300 ${isActive ? 'animate-flash-burst' : 'opacity-0 scale-0'}`} />
      
      {/* Lightning bolt */}
      <svg 
        className={`w-8 h-8 text-purple-400 relative z-10 transition-all duration-300 ${isActive ? 'animate-lightning-shake' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      
      {/* Speed lines */}
      {isActive && (
        <>
          <div className="absolute top-1/2 -left-2 w-4 h-0.5 bg-gradient-to-r from-purple-400 to-transparent animate-speed-line-1" />
          <div className="absolute top-1/3 -left-1 w-3 h-0.5 bg-gradient-to-r from-purple-300 to-transparent animate-speed-line-2" />
          <div className="absolute top-2/3 -left-3 w-5 h-0.5 bg-gradient-to-r from-purple-500 to-transparent animate-speed-line-3" />
        </>
      )}
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isActive ? 'shadow-[0_0_30px_rgba(168,85,247,0.5)]' : ''}`} />
    </div>
  )
}

interface FeatureCard {
  id: 'aman' | 'anonim' | 'mudah'
  title: string
  description: string
}

const features: FeatureCard[] = [
  {
    id: 'aman',
    title: 'Aman',
    description: 'Data dan identitasmu dilindungi dengan enkripsi tingkat tinggi. Tidak ada yang bisa melacak pesanmu.'
  },
  {
    id: 'anonim',
    title: 'Anonim',
    description: 'Identitasmu 100% tersembunyi. Kirim pesan tanpa rasa khawatir identitasmu akan terungkap.'
  },
  {
    id: 'mudah',
    title: 'Mudah',
    description: 'Proses yang simpel dan sangat cepat. Daftar, beli kredit, dan langsung kirim pesan perdanamu.'
  }
]

export default function KenapaFanonymCards() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer
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

  // Auto-cycle through cards (desktop)
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isVisible])

  // Mobile swipe handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setTranslateX(clientX - startX)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 50
    if (translateX > threshold && activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    } else if (translateX < -threshold && activeIndex < features.length - 1) {
      setActiveIndex(activeIndex + 1)
    }
    setTranslateX(0)
  }

  const renderIcon = (id: 'aman' | 'anonim' | 'mudah', isActive: boolean) => {
    switch (id) {
      case 'aman':
        return <AmanIcon isActive={isActive} />
      case 'anonim':
        return <AnonimIcon isActive={isActive} />
      case 'mudah':
        return <MudahIcon isActive={isActive} />
    }
  }

  return (
    <div ref={containerRef}>
      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={`
              relative group transform transition-all duration-700 ease-out cursor-pointer
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
            `}
            style={{ transitionDelay: isVisible ? `${index * 150}ms` : '0ms' }}
            onMouseEnter={() => setActiveIndex(index)}
          >
            {/* Card glow effect */}
            <div className={`
              absolute -inset-[1px] rounded-2xl transition-all duration-500
              ${activeIndex === index 
                ? 'bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 opacity-100' 
                : 'opacity-0'
              }
            `} />
            <div className={`
              absolute -inset-[2px] rounded-2xl blur-md transition-all duration-500
              ${activeIndex === index 
                ? 'bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 opacity-50' 
                : 'opacity-0'
              }
            `} />

            {/* Card content */}
            <div className={`
              relative bg-zinc-900/90 backdrop-blur-sm border rounded-2xl p-8 text-center
              transition-all duration-500 h-full
              ${activeIndex === index 
                ? 'border-transparent shadow-xl shadow-purple-600/20' 
                : 'border-zinc-800 hover:border-zinc-700'
              }
            `}>
              {/* Icon container */}
              <div className={`
                w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
                transition-all duration-500
                ${activeIndex === index 
                  ? 'bg-purple-600/30' 
                  : 'bg-purple-600/20'
                }
              `}>
                {renderIcon(feature.id, activeIndex === index)}
              </div>

              {/* Title */}
              <h3 className={`
                text-xl font-semibold mb-3 transition-colors duration-300
                ${activeIndex === index ? 'text-purple-300' : 'text-white'}
              `}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-zinc-400 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Active indicator bar */}
              <div className={`
                absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-500
                ${activeIndex === index ? 'w-16 bg-purple-500' : 'w-0 bg-transparent'}
              `} />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View - Carousel */}
      <div className="md:hidden">
        <div 
          className="overflow-hidden touch-pan-y"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(calc(-${activeIndex * 100}% + ${translateX}px))`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            {features.map((feature, index) => (
              <div key={feature.id} className="w-full flex-shrink-0 px-4">
                <div className={`
                  relative rounded-2xl p-6 text-center border transition-all duration-500
                  ${activeIndex === index 
                    ? 'bg-purple-600/10 border-purple-500/30 shadow-lg shadow-purple-600/10' 
                    : 'bg-zinc-900/80 border-zinc-800'
                  }
                `}>
                  {/* Icon */}
                  <div className={`
                    w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                    ${activeIndex === index ? 'bg-purple-600/30' : 'bg-purple-600/20'}
                  `}>
                    {renderIcon(feature.id, activeIndex === index)}
                  </div>

                  {/* Title */}
                  <h3 className={`
                    text-lg font-semibold mb-2
                    ${activeIndex === index ? 'text-purple-300' : 'text-white'}
                  `}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${activeIndex === index ? 'w-8 bg-purple-500' : 'w-2 bg-zinc-700'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
