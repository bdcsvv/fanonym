// app/lib/mobileUtils.ts
'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect mobile/tablet/desktop
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])
  
  return deviceType
}

/**
 * Hook to detect if user is on mobile
 */
export function useIsMobile() {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)
  
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])
  
  return isTouch
}

/**
 * Hook to handle keyboard visibility on mobile
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  
  useEffect(() => {
    const handleResize = () => {
      // On mobile, when keyboard opens, viewport height decreases
      if (window.innerHeight < window.screen.height * 0.7) {
        setIsKeyboardVisible(true)
      } else {
        setIsKeyboardVisible(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return isKeyboardVisible
}

/**
 * Hook for pull-to-refresh
 */
export function usePullToRefresh(onRefresh: () => void | Promise<void>) {
  useEffect(() => {
    let startY = 0
    let isPulling = false
    
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        isPulling = true
      }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return
      
      const currentY = e.touches[0].clientY
      const pullDistance = currentY - startY
      
      if (pullDistance > 80) {
        isPulling = false
        onRefresh()
      }
    }
    
    const handleTouchEnd = () => {
      isPulling = false
    }
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onRefresh])
}

/**
 * Prevent zoom on double tap (iOS Safari)
 */
export function preventDoubleTabZoom() {
  useEffect(() => {
    let lastTouchEnd = 0
    
    const handler = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }
    
    document.addEventListener('touchend', handler, { passive: false })
    return () => document.removeEventListener('touchend', handler)
  }, [])
}

/**
 * Scroll to element smoothly (mobile-friendly)
 */
export function scrollToElement(
  elementId: string, 
  offset: number = 0,
  behavior: ScrollBehavior = 'smooth'
) {
  const element = document.getElementById(elementId)
  if (!element) return
  
  const y = element.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({ top: y, behavior })
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Vibrate on mobile (haptic feedback)
 */
export function vibrate(pattern: number | number[] = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

/**
 * Get safe area insets for notched devices
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })
  
  useEffect(() => {
    const root = document.documentElement
    const top = parseInt(getComputedStyle(root).getPropertyValue('--sat') || '0')
    const bottom = parseInt(getComputedStyle(root).getPropertyValue('--sab') || '0')
    const left = parseInt(getComputedStyle(root).getPropertyValue('--sal') || '0')
    const right = parseInt(getComputedStyle(root).getPropertyValue('--sar') || '0')
    
    setSafeArea({ top, bottom, left, right })
  }, [])
  
  return safeArea
}

/**
 * Handle swipe gestures
 */
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) {
  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0
    let touchEndX = 0
    let touchEndY = 0
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX
      touchStartY = e.changedTouches[0].screenY
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX
      touchEndY = e.changedTouches[0].screenY
      handleGesture()
    }
    
    const handleGesture = () => {
      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY
      
      // Horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight()
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft()
          }
        }
      }
      // Vertical swipe
      else {
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown()
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp()
          }
        }
      }
    }
    
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])
}

/**
 * Image optimization for mobile
 */
export function optimizeImageForMobile(url: string, width?: number): string {
  // If using Supabase storage, you can add transformation params
  // For now, just return the URL as-is
  // TODO: Implement image CDN with automatic optimization
  return url
}

/**
 * Compress image before upload (mobile-friendly)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Check network connection
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    const updateConnectionType = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown')
      }
    }
    
    updateOnlineStatus()
    updateConnectionType()
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', updateConnectionType)
    }
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      if (connection) {
        connection.removeEventListener('change', updateConnectionType)
      }
    }
  }, [])
  
  return { isOnline, connectionType }
}
