'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Detect if scrolled past threshold
      if (currentScrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      // Hide navbar on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setHidden(true)
      } else {
        setHidden(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-500
      ${hidden ? '-translate-y-full' : 'translate-y-0'}
    `}>
      <div className={`
        mx-auto max-w-7xl px-6 transition-all duration-500
        ${scrolled ? 'py-3' : 'py-4'}
      `}>
        <div className={`
          flex items-center justify-between rounded-2xl px-6 transition-all duration-500
          ${scrolled 
            ? 'py-2.5 border border-white/10 bg-[#0c0a14]/80 backdrop-blur-xl shadow-lg shadow-black/20' 
            : 'py-3 border border-transparent bg-transparent'
          }
        `}>
          {/* Logo */}
          <Link 
            href="/" 
            className={`
              font-black text-2xl bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(147,51,234,0.4)]
              transition-all duration-300 hover:scale-105
            `}
          >
            fanonym
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className={`
                px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
                ${scrolled 
                  ? 'text-zinc-300 hover:text-white hover:bg-white/5' 
                  : 'text-zinc-300 hover:text-white'
                }
              `}
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className={`
                rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-semibold 
                transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105
                ${scrolled ? 'shadow-md shadow-purple-500/20' : ''}
              `}
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>

      {/* Progress bar on scroll */}
      <div className={`
        absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600
        transition-all duration-300
        ${scrolled ? 'opacity-100' : 'opacity-0'}
      `} 
      style={{ 
        width: typeof window !== 'undefined' 
          ? `${(lastScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%` 
          : '0%' 
      }} />
    </nav>
  )
}
