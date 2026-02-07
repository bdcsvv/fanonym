'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function GalaxyBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate stars
    const generatedStars: Star[] = []
    for (let i = 0; i < 50; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5
      })
    }
    setStars(generatedStars)

    // Generate floating particles
    const generatedParticles: Particle[] = []
    for (let i = 0; i < 20; i++) {
      generatedParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * -20
      })
    }
    setParticles(generatedParticles)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#0c0a14]" />
      
      {/* Nebula gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-nebula1" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-[130px] animate-nebula2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-800/10 rounded-full blur-[160px] animate-nebula3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] animate-nebula1" />
      <div className="absolute top-1/4 right-0 w-[350px] h-[350px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-nebula2" />
      
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/30 animate-floatParticle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
      
      {/* Shooting star effect (occasional) */}
      <div className="absolute top-20 left-1/4 w-1 h-1 bg-white rounded-full animate-shootingStar opacity-0" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-1/3 w-1 h-1 bg-white rounded-full animate-shootingStar opacity-0" style={{ animationDelay: '7s' }} />
      <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-white rounded-full animate-shootingStar opacity-0" style={{ animationDelay: '14s' }} />
      
      {/* Mesh gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-900/5 to-transparent" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette" />
    </div>
  )
}
