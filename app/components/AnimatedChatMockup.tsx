'use client'

import { useEffect, useState } from 'react'

type Scene = 'sender' | 'creator'

interface Message {
  id: number
  type: 'anon' | 'creator'
  text: string
  time: string
  isGift?: boolean
  giftAmount?: number
}

const senderMessages: Message[] = [
  { id: 1, type: 'anon', text: 'Kak, aku your biggest fan! 💜', time: '10:05' },
  { id: 2, type: 'creator', text: 'Wah makasih banyak! Siapa nih? 😊', time: '10:06' },
  { id: 3, type: 'anon', text: 'Rahasia dong kak hehe', time: '10:07' },
  { id: 4, type: 'anon', text: 'Ini ada gift buat kakak!', time: '10:08', isGift: true, giftAmount: 50 },
]

const creatorMessages: Message[] = [
  { id: 1, type: 'anon', text: 'Kak, aku your biggest fan! 💜', time: '10:05' },
  { id: 2, type: 'creator', text: 'Wah makasih banyak! Siapa nih? 😊', time: '10:06' },
  { id: 3, type: 'anon', text: 'Rahasia dong kak hehe', time: '10:07' },
  { id: 4, type: 'anon', text: 'Ini ada gift buat kakak!', time: '10:08', isGift: true, giftAmount: 50 },
  { id: 5, type: 'creator', text: 'Ya ampun makasih banyak! 🥹💜', time: '10:09' },
]

export default function AnimatedChatMockup() {
  const [currentScene, setCurrentScene] = useState<Scene>('sender')
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingType, setTypingType] = useState<'anon' | 'creator'>('anon')
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showGiftAnimation, setShowGiftAnimation] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [earnedCredits, setEarnedCredits] = useState(0)

  const currentMessages = currentScene === 'sender' ? senderMessages : creatorMessages

  useEffect(() => {
    setVisibleMessages([])
    setCurrentMessageIndex(0)
    setIsTyping(false)
    setShowGiftAnimation(false)
    if (currentScene === 'creator') {
      setEarnedCredits(0)
    }
  }, [currentScene])

  useEffect(() => {
    if (isTransitioning) return

    const showNextMessage = () => {
      if (currentMessageIndex >= currentMessages.length) {
        setTimeout(() => {
          if (currentScene === 'sender') {
            setIsTransitioning(true)
            setTimeout(() => {
              setCurrentScene('creator')
              setIsTransitioning(false)
            }, 1500)
          } else {
            setIsTransitioning(true)
            setTimeout(() => {
              setCurrentScene('sender')
              setIsTransitioning(false)
            }, 3000)
          }
        }, 2000)
        return
      }

      const message = currentMessages[currentMessageIndex]
      setTypingType(message.type)
      setIsTyping(true)

      const typingDuration = 800 + (message.text.length * 20)
      
      setTimeout(() => {
        setIsTyping(false)
        
        if (message.isGift) {
          setShowGiftAnimation(true)
          setTimeout(() => {
            setVisibleMessages(prev => [...prev, message.id])
            if (currentScene === 'creator' && message.giftAmount) {
              setEarnedCredits(prev => prev + message.giftAmount!)
            }
            setShowGiftAnimation(false)
            setCurrentMessageIndex(prev => prev + 1)
          }, 1500)
        } else {
          setVisibleMessages(prev => [...prev, message.id])
          setCurrentMessageIndex(prev => prev + 1)
        }
      }, typingDuration)
    }

    const timer = setTimeout(showNextMessage, currentMessageIndex === 0 ? 800 : 1500)
    return () => clearTimeout(timer)
  }, [currentMessageIndex, currentMessages, currentScene, isTransitioning])

  // Render chat messages helper
  const renderMessages = (compact: boolean = false) => {
    return currentMessages.map((message) => {
      const isOurMessage = currentScene === 'sender' ? message.type === 'anon' : message.type === 'creator'
      
      return (
        <div
          key={message.id}
          className={`
            flex transition-all duration-500 ease-out
            ${isOurMessage ? 'justify-end' : 'justify-start'}
            ${visibleMessages.includes(message.id) 
              ? 'opacity-100 translate-y-0' 
              : `opacity-0 ${compact ? 'translate-y-6' : 'translate-y-8'} h-0 overflow-hidden pointer-events-none`
            }
          `}
        >
          {message.isGift ? (
            <div className={`
              ${compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl px-4 py-3'} max-w-[85%]
              ${isOurMessage 
                ? `bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-500/30 ${compact ? 'rounded-tr-sm' : 'rounded-tr-md'}` 
                : `bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-500/30 ${compact ? 'rounded-tl-sm' : 'rounded-tl-md'}`
              }
            `}>
              <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-yellow-400 mb-0.5 flex items-center gap-1`}>
                <span>🎁</span> GIFT
              </p>
              <p className={compact ? 'text-xs' : 'text-sm'}>{message.text}</p>
              <div className={`flex items-center gap-1.5 ${compact ? 'mt-1.5 pt-1.5' : 'mt-2 pt-2'} border-t border-yellow-500/20`}>
                <span className={compact ? 'text-sm' : 'text-lg'}>💎</span>
                <span className={`font-bold text-yellow-300 ${compact ? 'text-xs' : 'text-sm'}`}>{message.giftAmount} Kredit</span>
              </div>
            </div>
          ) : (
            <div className={`
              ${compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl px-4 py-3'} max-w-[80%]
              ${isOurMessage 
                ? `bg-purple-600 ${compact ? 'rounded-tr-sm' : 'rounded-tr-md'}` 
                : `bg-zinc-800 ${compact ? 'rounded-tl-sm' : 'rounded-tl-md'}`
              }
            `}>
              {!isOurMessage && message.type === 'anon' && (
                <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-purple-400 mb-0.5`}>👤 ANONIM</p>
              )}
              <p className={compact ? 'text-xs' : 'text-sm'}>{message.text}</p>
            </div>
          )}
        </div>
      )
    })
  }

  // Render typing indicator helper
  const renderTypingIndicator = (compact: boolean = false) => {
    if (!isTyping) return null
    
    const isOurTyping = currentScene === 'sender' ? typingType === 'anon' : typingType === 'creator'
    
    return (
      <div className={`flex ${isOurTyping ? 'justify-end' : 'justify-start'}`}>
        <div className={`
          ${compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl px-4 py-3'}
          ${isOurTyping ? 'bg-purple-600/50 rounded-tr-sm' : 'bg-zinc-800 rounded-tl-sm'}
        `}>
          <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
            <div className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-zinc-400 rounded-full animate-bounce`} style={{ animationDelay: '0ms', animationDuration: '600ms' }} />
            <div className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-zinc-400 rounded-full animate-bounce`} style={{ animationDelay: '150ms', animationDuration: '600ms' }} />
            <div className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-zinc-400 rounded-full animate-bounce`} style={{ animationDelay: '300ms', animationDuration: '600ms' }} />
          </div>
        </div>
      </div>
    )
  }

  // Render gift animation overlay helper
  const renderGiftOverlay = (compact: boolean = false) => {
    if (!showGiftAnimation) return null
    
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-10">
        <div className="text-center animate-bounceIn">
          <div className={`${compact ? 'text-4xl mb-1' : 'text-6xl mb-2'} animate-bounce`}>🎁</div>
          <p className={`font-bold text-yellow-400 ${compact ? 'text-sm' : 'text-lg'}`}>Mengirim Gift...</p>
          {!compact && <p className="text-sm text-zinc-400">50 Kredit</p>}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Version */}
      <div className={`relative transition-all duration-700 hidden lg:block ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

        {/* Top badges row — above the card */}
        <div className="flex items-center justify-between mb-4 px-2">
          {/* Scene Label — left */}
          <div className={`
            px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-500
            ${currentScene === 'sender' 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
              : 'bg-green-600/20 text-green-300 border border-green-500/30'
            }
          `}>
            {currentScene === 'sender' ? '📤 Pengalaman Mengirim Pesan' : '📥 Pengalaman Menerima Pesan'}
          </div>

          {/* Right badges */}
          <div className="flex items-center gap-2">
            {currentScene === 'creator' && earnedCredits > 0 && (
              <div className="bg-green-600/20 backdrop-blur border border-green-500/30 rounded-full px-3 py-1.5 flex items-center gap-1.5 z-10 animate-bounceIn">
                <span className="text-sm">💰</span>
                <span className="text-xs font-medium text-green-400">+{earnedCredits} Kredit</span>
              </div>
            )}
            <div className="bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-medium text-zinc-300">100% Terenkripsi</span>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-4 shadow-2xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${currentScene === 'sender' ? 'bg-purple-600/20' : 'bg-green-600/20'}`}>
                  {currentScene === 'sender' ? (
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <span className="text-lg">👤</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 bg-green-400" />
              </div>
              <div>
                <p className="font-semibold">{currentScene === 'sender' ? 'Creator Favorit' : 'Chat dari Anonim'}</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${currentScene === 'sender' ? 'bg-purple-600/20 text-purple-300' : 'bg-green-600/20 text-green-300'}`}>
              {currentScene === 'sender' ? 'Sebagai Sender' : 'Sebagai Creator'}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 min-h-[260px] max-h-[260px] overflow-hidden relative">
            {renderMessages(false)}
            {renderTypingIndicator(false)}
            {renderGiftOverlay(false)}
          </div>

          {/* Chat Input */}
          <div className="mt-4 flex items-center gap-2 bg-zinc-800/50 rounded-xl px-4 py-3 border border-zinc-700">
            {currentScene === 'sender' && <span className="text-lg">🎁</span>}
            <input type="text" placeholder={currentScene === 'sender' ? 'Kirim pesan anonim...' : 'Balas pesan...'} className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-500" disabled />
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>

        {/* Bottom info badges */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="bg-zinc-800/60 backdrop-blur border border-zinc-700/50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-zinc-300">100% Anonim</span>
          </div>
          <div className="bg-zinc-800/60 backdrop-blur border border-zinc-700/50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M15 12a3 3 0 01-3 3m0 0l6.878 6.878" />
            </svg>
            <span className="text-xs text-zinc-300">Identitas Terjaga</span>
          </div>
        </div>

        {/* Scene indicator dots */}
        <div className="flex justify-center gap-2 mt-4">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentScene === 'sender' ? 'bg-purple-500 w-6' : 'bg-zinc-600'}`} />
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentScene === 'creator' ? 'bg-green-500 w-6' : 'bg-zinc-600'}`} />
        </div>
      </div>

      {/* Mobile Version */}
      <div className={`lg:hidden transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        
        {/* Mobile top badges */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className={`
            px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-500
            ${currentScene === 'sender' 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
              : 'bg-green-600/20 text-green-300 border border-green-500/30'
            }
          `}>
            {currentScene === 'sender' ? '📤 Mengirim Pesan' : '📥 Menerima Pesan'}
          </div>
          <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-full px-2.5 py-1 flex items-center gap-1">
            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[10px] text-zinc-300">Terenkripsi</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-3 shadow-2xl">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${currentScene === 'sender' ? 'bg-purple-600/20' : 'bg-green-600/20'}`}>
                  {currentScene === 'sender' ? (
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <span className="text-sm">👤</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 bg-green-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">{currentScene === 'sender' ? 'Creator Favorit' : 'Chat Anonim'}</p>
                <p className="text-[10px] text-green-400">Online</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {currentScene === 'creator' && earnedCredits > 0 && (
                <div className="bg-green-600/20 border border-green-500/30 rounded-full px-2 py-0.5 flex items-center gap-1 animate-bounceIn">
                  <span className="text-xs">💰</span>
                  <span className="text-[10px] font-medium text-green-400">+{earnedCredits}</span>
                </div>
              )}
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${currentScene === 'sender' ? 'bg-purple-600/20 text-purple-300' : 'bg-green-600/20 text-green-300'}`}>
                {currentScene === 'sender' ? 'Sender' : 'Creator'}
              </div>
            </div>
          </div>

          {/* Chat Messages - Compact */}
          <div className="space-y-2 min-h-[180px] max-h-[180px] overflow-hidden relative">
            {renderMessages(true)}
            {renderTypingIndicator(true)}
            {renderGiftOverlay(true)}
          </div>

          {/* Input */}
          <div className="mt-3 flex items-center gap-2 bg-zinc-800/50 rounded-xl px-3 py-2.5 border border-zinc-700">
            {currentScene === 'sender' && <span className="text-sm">🎁</span>}
            <span className="flex-1 text-xs text-zinc-500">{currentScene === 'sender' ? 'Kirim pesan anonim...' : 'Balas pesan...'}</span>
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>

        {/* Mobile bottom badges */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="bg-zinc-800/50 border border-zinc-700/40 rounded-full px-2.5 py-1 flex items-center gap-1">
            <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[10px] text-zinc-400">100% Anonim</span>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700/40 rounded-full px-2.5 py-1 flex items-center gap-1">
            <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
            </svg>
            <span className="text-[10px] text-zinc-400">Identitas Terjaga</span>
          </div>
        </div>

        {/* Scene indicator dots */}
        <div className="flex justify-center gap-2 mt-2.5">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${currentScene === 'sender' ? 'bg-purple-500 w-5' : 'bg-zinc-700 w-1.5'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${currentScene === 'creator' ? 'bg-green-500 w-5' : 'bg-zinc-700 w-1.5'}`} />
        </div>
      </div>
    </>
  )
}
