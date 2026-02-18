'use client'

import { useEffect, useRef, useState } from 'react'

interface StatItem {
  value: string
  numericValue: number
  suffix: string
  label: string
}

const stats: StatItem[] = [
  { value: '5K+', numericValue: 5, suffix: 'K+', label: 'Pesan Terkirim' },
  { value: '120+', numericValue: 120, suffix: '+', label: 'Creator Aktif' },
  { value: '1.2K+', numericValue: 1.2, suffix: 'K+', label: 'Fans Bergabung' },
  { value: '4.8/5', numericValue: 4.8, suffix: '/5', label: 'Rating Kepuasan' },
]

export default function AnimatedStats() {
  const [isVisible, setIsVisible] = useState(false)
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0))
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true)
          hasAnimated.current = true
        }
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const interval = duration / steps

    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // Easing function - ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setCounts(stats.map(stat => {
        const value = stat.numericValue * easedProgress
        // For decimal values like 4.9
        if (stat.numericValue % 1 !== 0) {
          return Math.round(value * 10) / 10
        }
        return Math.floor(value)
      }))

      if (currentStep >= steps) {
        clearInterval(timer)
        setCounts(stats.map(stat => stat.numericValue))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible])

  return (
    <section ref={containerRef} className="relative py-20 px-6 border-t border-zinc-800/50 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[800px] h-[300px] rounded-full blur-[120px]
          bg-gradient-to-r from-purple-600/10 via-purple-500/5 to-purple-600/10
          transition-opacity duration-1000
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `} />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`
                text-center transform transition-all duration-700 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Stat card with hover effect */}
              <div className="group relative py-6 px-4 rounded-2xl transition-all duration-300 hover:bg-zinc-800/30">
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-purple-600/0 group-hover:bg-purple-600/5 transition-colors duration-300" />
                
                {/* Number */}
                <div className="relative">
                  <p className={`
                    text-4xl sm:text-5xl font-bold mb-2
                    bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent
                    group-hover:from-purple-300 group-hover:via-white group-hover:to-purple-300
                    transition-all duration-300
                  `}>
                    {stat.numericValue % 1 !== 0 
                      ? counts[index].toFixed(1) 
                      : counts[index]}
                    {stat.suffix}
                  </p>
                  
                  {/* Animated underline */}
                  <div className={`
                    h-1 mx-auto rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent
                    transition-all duration-500 ease-out
                    ${isVisible ? 'w-12 opacity-100' : 'w-0 opacity-0'}
                  `} 
                  style={{ transitionDelay: `${index * 150 + 500}ms` }}
                  />
                </div>
                
                {/* Label */}
                <p className="text-sm text-zinc-400 uppercase tracking-wider mt-3 group-hover:text-zinc-300 transition-colors">
                  {stat.label}
                </p>

                {/* Floating particles on hover */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping" />
                  <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
