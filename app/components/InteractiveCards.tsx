'use client'

import { useEffect, useRef, useState } from 'react'

interface CardData {
  icon: React.ReactNode
  title: string
  description: string
}

interface InteractiveCardsProps {
  cards: CardData[]
  variant?: 'steps' | 'features'
  horizontalScroll?: boolean
}

export default function InteractiveCards({ cards, variant = 'steps', horizontalScroll = false }: InteractiveCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const desktopScrollRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for scroll-triggered animation
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

  // Auto-slide for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth < 768 && !isDragging) {
        setActiveIndex((prev) => (prev + 1) % cards.length)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [cards.length, isDragging])

  // Desktop drag handlers
  const handleDesktopDragStart = (e: React.MouseEvent) => {
    if (!desktopScrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - desktopScrollRef.current.offsetLeft)
    setScrollLeft(desktopScrollRef.current.scrollLeft)
  }

  const handleDesktopDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !desktopScrollRef.current) return
    e.preventDefault()
    const x = e.pageX - desktopScrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    desktopScrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleDesktopDragEnd = () => {
    setIsDragging(false)
  }

  // Mobile touch handlers
  const handleMobileDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
  }

  const handleMobileDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const diff = clientX - startX
    setTranslateX(diff)
  }

  const handleMobileDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 50
    if (translateX > threshold && activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    } else if (translateX < -threshold && activeIndex < cards.length - 1) {
      setActiveIndex(activeIndex + 1)
    }
    setTranslateX(0)
  }

  // Scroll by arrow buttons
  const scrollByAmount = (amount: number) => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const isSteps = variant === 'steps'

  return (
    <div ref={containerRef} className="relative">
      {/* Desktop View */}
      <div className="hidden md:block">
        {horizontalScroll ? (
          /* Horizontal scrollable carousel for desktop */
          <div className="relative group/carousel">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0c0a14] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0c0a14] to-transparent z-10 pointer-events-none" />
            
            {/* Left Arrow Button */}
            <button
              onClick={() => scrollByAmount(-340)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-zinc-900/90 border border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 shadow-lg"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Right Arrow Button */}
            <button
              onClick={() => scrollByAmount(340)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-zinc-900/90 border border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 shadow-lg"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <div 
              ref={desktopScrollRef}
              onMouseDown={handleDesktopDragStart}
              onMouseMove={handleDesktopDragMove}
              onMouseUp={handleDesktopDragEnd}
              onMouseLeave={handleDesktopDragEnd}
              className={`flex gap-6 overflow-x-auto scrollbar-hide py-4 px-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {cards.map((card, index) => (
                <div
                  key={index}
                  className={`
                    flex-shrink-0 w-[320px] relative group
                    transform transition-all duration-500 ease-out select-none
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
                  `}
                  style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                >
                  {/* Animated gradient border on hover */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  
                  {/* Card content */}
                  <div className={`
                    relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8
                    group-hover:border-transparent transition-all duration-500
                    group-hover:transform group-hover:scale-[1.02]
                    ${isSteps ? 'pt-10' : 'text-center'}
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Step number for 'steps' variant */}
                    {isSteps && (
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-600/50 group-hover:scale-110 transition-transform duration-300 z-10">
                        {index + 1}
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className={`
                      ${isSteps ? 'w-14 h-14 rounded-xl' : 'w-16 h-16 rounded-full mx-auto'}
                      bg-purple-600/20 flex items-center justify-center mb-6
                      group-hover:bg-purple-600/30 group-hover:scale-110 
                      transition-all duration-500 ease-out
                      group-hover:shadow-lg group-hover:shadow-purple-600/20
                    `}>
                      <div className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                        {card.icon}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-300 transition-colors duration-300">
                      {card.title}
                    </h3>

                    <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                      {card.description}
                    </p>

                    {/* Decorative corners */}
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-600/0 rounded-tr-lg group-hover:border-purple-600/50 transition-all duration-500" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-600/0 rounded-bl-lg group-hover:border-purple-600/50 transition-all duration-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll hint */}
            <p className="text-center text-zinc-500 text-xs mt-4">
              Gunakan tombol panah atau drag untuk navigasi
            </p>
          </div>
        ) : (
          /* Static grid with staggered animation for desktop (original) */
          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`
                  relative group transform transition-all duration-700 ease-out
                  ${isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                  }
                `}
                style={{ transitionDelay: isVisible ? `${index * 150}ms` : '0ms' }}
              >
                {/* Animated gradient border on hover */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                
                {/* Card content */}
                <div className={`
                  relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8
                  group-hover:border-transparent transition-all duration-500
                  group-hover:transform group-hover:scale-[1.02] group-hover:-translate-y-1
                  ${isSteps ? '' : 'text-center'}
                `}>
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {isSteps && (
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-600/50 group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </div>
                  )}

                  <div className={`
                    ${isSteps ? 'w-14 h-14 rounded-xl' : 'w-16 h-16 rounded-full mx-auto'}
                    bg-purple-600/20 flex items-center justify-center mb-6
                    group-hover:bg-purple-600/30 group-hover:scale-110 
                    transition-all duration-500 ease-out
                    group-hover:shadow-lg group-hover:shadow-purple-600/20
                  `}>
                    <div className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                      {card.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-300 transition-colors duration-300">
                    {card.title}
                  </h3>

                  <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                    {card.description}
                  </p>

                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-600/0 rounded-tr-lg group-hover:border-purple-600/50 transition-all duration-500" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-600/0 rounded-bl-lg group-hover:border-purple-600/50 transition-all duration-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile View - Swipeable Carousel */}
      <div className="md:hidden">
        <div 
          ref={carouselRef}
          className="overflow-hidden touch-pan-y py-6"
          onMouseDown={handleMobileDragStart}
          onMouseMove={handleMobileDragMove}
          onMouseUp={handleMobileDragEnd}
          onMouseLeave={handleMobileDragEnd}
          onTouchStart={handleMobileDragStart}
          onTouchMove={handleMobileDragMove}
          onTouchEnd={handleMobileDragEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(calc(-${activeIndex * 100}% + ${translateX}px))`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            {cards.map((card, index) => (
              <div 
                key={index} 
                className="w-full flex-shrink-0 px-6"
              >
                <div className={`
                  relative overflow-hidden rounded-2xl p-6
                  ${isSteps ? 'pt-10' : 'pt-6'}
                  ${isSteps ? '' : 'text-center'}
                  ${activeIndex === index 
                    ? 'border-purple-500/50 shadow-xl shadow-purple-600/20' 
                    : 'border-zinc-800'
                  }
                  border transition-all duration-300
                `}>
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-purple-900/20" />
                  
                  {/* Animated glow orb */}
                  <div className={`
                    absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500
                    ${activeIndex === index ? 'opacity-60' : 'opacity-20'}
                    bg-purple-600/30
                  `} />
                  
                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />

                  {/* Content wrapper */}
                  <div className="relative z-10">
                    {/* Step number for 'steps' variant - positioned at top left corner */}
                    {isSteps && (
                      <div className="absolute -top-6 -left-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-600/50">
                        {index + 1}
                      </div>
                    )}

                    {/* Icon with glow */}
                    <div className={`
                      ${isSteps ? 'w-14 h-14 rounded-xl' : 'w-16 h-16 rounded-full mx-auto'}
                      bg-gradient-to-br from-purple-600/30 to-purple-800/20 
                      border border-purple-500/20
                      flex items-center justify-center mb-5
                      shadow-lg shadow-purple-600/10
                    `}>
                      <div className="text-purple-400">
                        {card.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-white">{card.title}</h3>

                    {/* Description */}
                    <p className="text-zinc-400 text-sm leading-relaxed">{card.description}</p>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className={`
                    absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-500
                    ${activeIndex === index ? 'w-16 bg-purple-500' : 'w-0 bg-transparent'}
                  `} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center gap-3 mt-4">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`
                transition-all duration-300 rounded-full
                ${activeIndex === index 
                  ? 'w-8 h-2.5 bg-gradient-to-r from-purple-500 to-purple-600 shadow-md shadow-purple-500/50' 
                  : 'w-2.5 h-2.5 bg-zinc-700 hover:bg-zinc-600'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Swipe hint - animated */}
        <div className="flex items-center justify-center gap-2 mt-5 text-zinc-500 text-xs">
          <svg className="w-4 h-4 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Geser untuk melihat lebih banyak</span>
          <svg className="w-4 h-4 animate-bounce-x-reverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
