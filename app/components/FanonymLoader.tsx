'use client'

import GalaxyBackground from './GalaxyBackground'

interface FanonymLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export default function FanonymLoader({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = true 
}: FanonymLoaderProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl'
  }

  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Galaxy Background */}
        <GalaxyBackground />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Glowing ring behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-loader-ring-1" />
            <div className="absolute inset-2 rounded-full border-2 border-purple-400/20 animate-loader-ring-2" />
            <div className="absolute inset-4 rounded-full border border-purple-300/10 animate-loader-ring-3" />
          </div>
          
          {/* Animated Logo with pulse glow */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 blur-xl bg-purple-600/30 animate-pulse-slow" />
            
            {/* Logo */}
            <h1 className={`
              ${sizeClasses[size]} font-black italic italic
              bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] 
              bg-clip-text text-transparent 
              bg-[length:200%_100%] animate-gradient-shift
              drop-shadow-[0_0_30px_rgba(103,0,232,0.5)]
              relative z-10
            `}>
              fanonym
            </h1>
          </div>
          
          {/* Loading bar */}
          <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 bg-[length:200%_100%] animate-loading-bar rounded-full" />
          </div>
          
          {/* Loading dots */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-loader-dot-1" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-loader-dot-2" />
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-loader-dot-3" />
          </div>
          
          {/* Optional text */}
          {text && (
            <p className="text-zinc-400 text-sm animate-pulse">{text}</p>
          )}
        </div>
      </div>
    )
  }

  // Inline loader (non-fullscreen)
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative">
        <div className="absolute inset-0 blur-lg bg-purple-600/20 animate-pulse-slow" />
        <h1 className={`
          ${sizeClasses[size]} font-black italic italic
          bg-gradient-to-r from-[#6700e8] via-[#9333ea] to-[#6700e8] 
          bg-clip-text text-transparent 
          bg-[length:200%_100%] animate-gradient-shift
          relative z-10
        `}>
          fanonym
        </h1>
      </div>
      
      <div className="w-32 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 bg-[length:200%_100%] animate-loading-bar rounded-full" />
      </div>
      
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-loader-dot-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-loader-dot-2" />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-loader-dot-3" />
      </div>
      
      {text && (
        <p className="text-zinc-400 text-xs animate-pulse">{text}</p>
      )}
    </div>
  )
}
