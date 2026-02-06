'use client'

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
  const sizeClass = {
    sm: 'fanonym-loading-sm',
    md: '',
    lg: 'fanonym-loading-lg'
  }

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        {/* Background gradient orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Animated Logo */}
          <div className={`fanonym-loading ${sizeClass[size]} animate-float`}>
            fanonym
          </div>
          
          {/* Loading dots */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          {/* Optional text */}
          {text && (
            <p className="text-gray-400 text-sm animate-pulse">{text}</p>
          )}
        </div>
      </div>
    )
  }

  // Inline loader (non-fullscreen)
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`fanonym-loading ${sizeClass[size]}`}>
        fanonym
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      {text && (
        <p className="text-gray-400 text-xs animate-pulse">{text}</p>
      )}
    </div>
  )
}
