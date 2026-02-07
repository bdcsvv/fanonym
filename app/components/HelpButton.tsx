'use client'

import { useState } from 'react'

interface HelpButtonProps {
  email?: string
  subject?: string
}

export default function HelpButton({ 
  email = 'rizkinurulloh1124@gmail.com',
  subject = 'Butuh Bantuan - Fanonym'
}: HelpButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`
    window.location.href = mailtoLink
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:scale-105 animate-fadeIn"
    >
      {/* Icon */}
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      {/* Text - shows on hover */}
      <span 
        className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isHovered ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        Butuh Bantuan?
      </span>
    </button>
  )
}
