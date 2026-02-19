'use client'

import { useEffect, useRef, useState } from 'react'

interface StatItem {
  numericValue: number
  suffix: string
  label: string
}

const stats: StatItem[] = [
  { numericValue: 5, suffix: 'K+', label: 'Pesan Terkirim' },
  { numericValue: 120, suffix: '+', label: 'Creator Aktif' },
  { numericValue: 1.2, suffix: 'K+', label: 'Fans Bergabung' },
  { numericValue: 4.8, suffix: '/5', label: 'Rating' },
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
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2500
    const steps = 80
    const interval = duration / steps

    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easedProgress = 1 - Math.pow(1 - progress, 4)

      setCounts(stats.map(stat => {
        const value = stat.numericValue * easedProgress
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
    <section ref={containerRef} className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`
          absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[200px]
          bg-purple-600/10 transition-all duration-1500
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        `} />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Creative layout - Title on left, stats flowing right */}
        <div className="grid lg:grid-cols-12 gap-12 items-end">
          {/* Left - Title */}
          <div className={`
            lg:col-span-5
            transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}
          `}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Dipercaya oleh
              <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                ribuan pengguna.
              </span>
            </h2>
          </div>

          {/* Right - Stats in creative positions */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`
                    relative group
                    ${index % 2 === 1 ? 'sm:translate-y-8' : ''}
                    transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    ${isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-16'
                    }
                  `}
                  style={{ transitionDelay: `${300 + index * 150}ms` }}
                >
                  {/* Glowing dot */}
                  <div className={`
                    absolute -top-2 left-0 w-2 h-2 rounded-full
                    transition-all duration-700 delay-500
                    ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                    ${index === 0 ? 'bg-purple-400' : index === 1 ? 'bg-violet-400' : index === 2 ? 'bg-fuchsia-400' : 'bg-pink-400'}
                  `}>
                    <div className="absolute inset-0 rounded-full animate-ping opacity-50 bg-inherit" />
                  </div>

                  {/* Number */}
                  <div className="relative">
                    <span className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white group-hover:text-purple-200 transition-colors duration-300">
                      {stat.numericValue % 1 !== 0 
                        ? counts[index].toFixed(1) 
                        : counts[index]}
                    </span>
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-400">
                      {stat.suffix}
                    </span>
                  </div>

                  {/* Label */}
                  <p className="text-sm text-zinc-500 mt-1 group-hover:text-zinc-400 transition-colors">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative line */}
        <div className={`
          mt-16 h-[1px] bg-gradient-to-r from-purple-500/30 via-violet-500/20 to-transparent
          transition-all duration-1500 delay-700
          ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
        `} style={{ transformOrigin: 'left' }} />
      </div>
    </section>
  )
}
