'use client'

import { useEffect, useState } from 'react'

interface FloatingEmoji {
  id: number
  emoji: string
  left: number
  animationDuration: number
  animationDelay: number
  size: number
}

const EMOJIS = ['💬', '💜', '❤️', '🔒', '✨', '💌', '🎭', '💫', '🤫', '💕']

export default function FloatingEmojis() {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([])

  useEffect(() => {
    // Generate initial emojis
    const initialEmojis: FloatingEmoji[] = []
    for (let i = 0; i < 15; i++) {
      initialEmojis.push({
        id: i,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 20,
        animationDelay: Math.random() * -20,
        size: 16 + Math.random() * 20
      })
    }
    setEmojis(initialEmojis)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {emojis.map((item) => (
        <div
          key={item.id}
          className="absolute animate-floatUp opacity-20"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.animationDuration}s`,
            animationDelay: `${item.animationDelay}s`,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  )
}
