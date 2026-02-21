'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Role = 'sender' | 'creator'

interface StepData {
  title: string
  description: string
  accent: string
  glow: string
  staticIcon: React.ReactNode
  AnimatedIcon: React.FC
}

/* ════════════════════════════════════════
   ANIMATED ICON COMPONENTS
   ════════════════════════════════════════ */

function SearchAnimated() {
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14">
      {/* Main search icon */}
      <svg className="w-full h-full text-purple-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        style={{ animation: 'searchMove 3s ease-in-out infinite' }}>
        <circle cx="11" cy="11" r="7" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeWidth={1.5} d="M21 21l-4.35-4.35" />
      </svg>
      {/* Scanning line */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent z-20"
        style={{ animation: 'scanVert 2s ease-in-out infinite' }} />
      {/* Found dots */}
      <div className="absolute top-2 right-0 w-1.5 h-1.5 rounded-full bg-purple-400/60"
        style={{ animation: 'foundPop 3s ease-in-out infinite' }} />
      <div className="absolute bottom-3 left-0 w-1 h-1 rounded-full bg-purple-300/40"
        style={{ animation: 'foundPop 3s ease-in-out infinite 1s' }} />
    </div>
  )
}

function CreditCardAnimated() {
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14">
      {/* Card base */}
      <svg className="w-full h-full text-violet-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        style={{ animation: 'cardTilt 3s ease-in-out infinite' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      {/* Scrolling numbers */}
      <div className="absolute bottom-[10px] left-[10px] flex gap-[3px] overflow-hidden z-20">
        {[0,1,2,3].map(i => (
          <span key={i} className="text-[5px] font-mono text-violet-300/50 block"
            style={{ animation: `numTick 1.5s steps(3) infinite ${i * 0.2}s` }}>
            ••
          </span>
        ))}
      </div>
      {/* Dollar sign float */}
      <div className="absolute -top-1 -right-1 text-[10px] font-bold text-yellow-400/70 z-20"
        style={{ animation: 'dollarBounce 2s ease-in-out infinite' }}>$</div>
      <div className="absolute top-1 -right-3 text-[7px] font-bold text-yellow-400/40 z-20"
        style={{ animation: 'dollarBounce 2s ease-in-out infinite 0.6s' }}>$</div>
      {/* Chip shimmer */}
      <div className="absolute top-[9px] left-[9px] w-3 h-2 rounded-sm border border-yellow-500/30 z-20"
        style={{ animation: 'chipShine 2s ease-in-out infinite' }} />
    </div>
  )
}

function SendAnimated() {
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14">
      {/* Send icon — rocket motion */}
      <svg className="w-full h-full text-fuchsia-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        style={{ animation: 'rocketFly 2.5s ease-in-out infinite' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      {/* Speed lines */}
      <div className="absolute top-1/2 -left-2 w-4 h-[1px] -translate-y-1 bg-gradient-to-r from-fuchsia-400/50 to-transparent z-20"
        style={{ animation: 'speedLine 0.8s ease-out infinite' }} />
      <div className="absolute top-1/2 -left-1 w-3 h-[1px] translate-y-1 bg-gradient-to-r from-fuchsia-300/30 to-transparent z-20"
        style={{ animation: 'speedLine 0.8s ease-out infinite 0.3s' }} />
      {/* Exhaust particles */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400/50 z-20"
        style={{ animation: 'exhaust 1s ease-out infinite' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-fuchsia-400/40 z-20"
        style={{ animation: 'exhaust 1s ease-out infinite 0.3s' }} />
    </div>
  )
}

function RegisterAnimated() {
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14">
      {/* Main person */}
      <svg className="w-full h-full text-cyan-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      {/* People appearing one by one */}
      <div className="absolute -right-2 top-0 z-20" style={{ animation: 'personPop 3s ease-in-out infinite' }}>
        <svg className="w-4 h-4 text-cyan-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4" strokeWidth={2} />
          <path strokeWidth={2} d="M5.5 21a6.5 6.5 0 0113 0" />
        </svg>
      </div>
      <div className="absolute -right-4 top-3 z-20" style={{ animation: 'personPop 3s ease-in-out infinite 0.5s' }}>
        <svg className="w-3 h-3 text-cyan-400/35" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4" strokeWidth={2} />
          <path strokeWidth={2} d="M5.5 21a6.5 6.5 0 0113 0" />
        </svg>
      </div>
      <div className="absolute -right-3 top-6 z-20" style={{ animation: 'personPop 3s ease-in-out infinite 1s' }}>
        <svg className="w-2.5 h-2.5 text-cyan-400/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4" strokeWidth={2} />
          <path strokeWidth={2} d="M5.5 21a6.5 6.5 0 0113 0" />
        </svg>
      </div>
      {/* Plus badges */}
      <div className="absolute -top-1 right-1 text-[8px] font-bold text-cyan-300/70 z-20"
        style={{ animation: 'plusFloat 2s ease-in-out infinite' }}>+</div>
    </div>
  )
}

function ShareAnimated() {
  const [phase, setPhase] = useState(0) // 0=share, 1=insta, 2=tiktok, 3=X
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % 4), 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14">
      {/* Share icon */}
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ opacity: phase === 0 ? 1 : 0, transform: phase === 0 ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(45deg)', filter: phase === 0 ? 'blur(0)' : 'blur(4px)' }}>
        <svg className="w-full h-full text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="18" cy="5" r="3" strokeWidth={1.5} /><circle cx="6" cy="12" r="3" strokeWidth={1.5} /><circle cx="18" cy="19" r="3" strokeWidth={1.5} />
          <path strokeWidth={1.5} d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
        </svg>
      </div>
      {/* Instagram */}
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ opacity: phase === 1 ? 1 : 0, transform: phase === 1 ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(-45deg)', filter: phase === 1 ? 'blur(0)' : 'blur(4px)' }}>
        <svg className="w-10 h-10 sm:w-11 sm:h-11" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth={1.5}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C" stroke="none" />
        </svg>
      </div>
      {/* TikTok */}
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ opacity: phase === 2 ? 1 : 0, transform: phase === 2 ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(45deg)', filter: phase === 2 ? 'blur(0)' : 'blur(4px)' }}>
        <svg className="w-10 h-10 sm:w-11 sm:h-11" viewBox="0 0 24 24" fill="none">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.35 6.35 0 003.14 15.2a6.35 6.35 0 007.15 6.3 6.35 6.35 0 005.06-6.22V9.01a8.27 8.27 0 004.83 1.54V7.1a4.83 4.83 0 01-.59-.41z"
            fill="#25F4EE" />
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.77 0 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.35 6.35 0 003.14 15.2a6.35 6.35 0 007.15 6.3 6.35 6.35 0 005.06-6.22V9.01a8.27 8.27 0 004.83 1.54V7.1a4.83 4.83 0 01-.59-.41z"
            fill="#FE2C55" opacity="0.6" />
        </svg>
      </div>
      {/* X (Twitter) */}
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ opacity: phase === 3 ? 1 : 0, transform: phase === 3 ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(-45deg)', filter: phase === 3 ? 'blur(0)' : 'blur(4px)' }}>
        <svg className="w-9 h-9 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      {/* Broadcast wave */}
      <div className="absolute top-0 right-0 w-2 h-2 border border-sky-400/20 rounded-full z-0"
        style={{ animation: 'wave 2s ease-out infinite' }} />
    </div>
  )
}

function EarnAnimated() {
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14">
      {/* Main dollar coin */}
      <svg className="w-full h-full text-teal-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        style={{ animation: 'coinFlip 4s ease-in-out infinite' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {/* Currency symbols cycling */}
      <div className="absolute -top-1 -right-2 z-20" style={{ animation: 'currencyCycle 5s steps(1) infinite' }}>
        <span className="text-[9px] font-bold text-teal-300/60">$</span>
      </div>
      <div className="absolute top-2 -right-3 z-20" style={{ animation: 'currencyCycle 5s steps(1) infinite 1.25s' }}>
        <span className="text-[8px] font-bold text-teal-300/40">€</span>
      </div>
      <div className="absolute -top-2 right-1 z-20" style={{ animation: 'currencyCycle 5s steps(1) infinite 2.5s' }}>
        <span className="text-[7px] font-bold text-teal-300/35">¥</span>
      </div>
      <div className="absolute top-4 -right-3 z-20" style={{ animation: 'currencyCycle 5s steps(1) infinite 3.75s' }}>
        <span className="text-[7px] font-bold text-teal-300/30">£</span>
      </div>
      {/* Rising sparkles */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-300/60 z-20"
        style={{ animation: 'sparkUp 1.8s ease-out infinite' }} />
      <div className="absolute -top-1 left-1/3 w-0.5 h-0.5 rounded-full bg-teal-300/40 z-20"
        style={{ animation: 'sparkUp 1.8s ease-out infinite 0.6s' }} />
    </div>
  )
}

/* ════════════════════════════════════════
   STEP DATA
   ════════════════════════════════════════ */

const senderSteps: StepData[] = [
  {
    title: 'Cari Creator',
    description: 'Temukan creator favoritmu pada daftar yang tersedia. Jelajahi berbagai creator dan temukan yang paling cocok untukmu.',
    accent: '#a855f7', glow: 'rgba(168,85,247,0.4)',
    staticIcon: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M21 21l-4.35-4.35" /></svg>,
    AnimatedIcon: SearchAnimated,
  },
  {
    title: 'Beli Kredit',
    description: 'Top up kredit dengan mudah untuk mulai mengirim pesan anonim. Pilih paket yang sesuai dengan kebutuhanmu.',
    accent: '#8b5cf6', glow: 'rgba(139,92,246,0.4)',
    staticIcon: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    AnimatedIcon: CreditCardAnimated,
  },
  {
    title: 'Kirim Pesan',
    description: 'Tulis dan kirim pesanmu secara anonim, identitasmu 100% terjaga. Ekspresikan dirimu tanpa batas.',
    accent: '#d946ef', glow: 'rgba(217,70,239,0.4)',
    staticIcon: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    AnimatedIcon: SendAnimated,
  },
]

const creatorSteps: StepData[] = [
  {
    title: 'Daftar Gratis',
    description: 'Buat akun creatormu secara gratis dalam hitungan detik. Tanpa biaya, tanpa ribet.',
    accent: '#06b6d4', glow: 'rgba(6,182,212,0.4)',
    staticIcon: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    AnimatedIcon: RegisterAnimated,
  },
  {
    title: 'Share Link',
    description: 'Bagikan link Fanonym unikmu ke seluruh platform media sosial. Jangkau audiensmu di mana saja.',
    accent: '#22d3ee', glow: 'rgba(34,211,238,0.4)',
    staticIcon: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" strokeWidth={1.5} /><circle cx="6" cy="12" r="3" strokeWidth={1.5} /><circle cx="18" cy="19" r="3" strokeWidth={1.5} /><path strokeWidth={1.5} d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>,
    AnimatedIcon: ShareAnimated,
  },
  {
    title: 'Terima & Cairkan',
    description: 'Terima pesan dan gift dalam bentuk kredit yang dapat kamu cairkan kapan saja. Ubah kreativitasmu jadi penghasilan.',
    accent: '#14b8a6', glow: 'rgba(20,184,166,0.4)',
    staticIcon: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    AnimatedIcon: EarnAnimated,
  },
]

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */

export default function CaraKerjaTabs() {
  const [activeRole, setActiveRole] = useState<Role>('sender')
  const [active, setActive] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [iconPhase, setIconPhase] = useState<'in' | 'out'>('in')
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const prevActive = useRef(0)

  const currentSteps = activeRole === 'sender' ? senderSteps : creatorSteps
  const cur = currentSteps[active]

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setIsVisible(true) }, { threshold: 0.05 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // Scroll-driven step detection
  useEffect(() => {
    const handleScroll = () => {
      const refs = stepRefs.current
      if (!refs.length) return
      const vc = window.innerHeight * 0.45
      let ci = 0, cd = Infinity
      refs.forEach((ref, i) => {
        if (!ref) return
        const r = ref.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - vc)
        if (d < cd) { cd = d; ci = i }
      })
      if (ci !== prevActive.current) {
        prevActive.current = ci
        setIconPhase('out')
        setTimeout(() => { setActive(ci); setIconPhase('in') }, 350)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentSteps.length, activeRole])

  const handleTabSwitch = (role: Role) => {
    if (role === activeRole) return
    setIconPhase('out')
    setTimeout(() => {
      setActiveRole(role)
      setActive(0)
      prevActive.current = 0
      setIconPhase('in')
    }, 300)
  }

  const IconComp = cur.AnimatedIcon

  return (
    <section ref={sectionRef} id="cara-kerja" className="relative">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[200px] transition-all duration-1000"
          style={{ background: cur.glow.replace('0.4', '0.04') }} />
      </div>

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-10">
        <div className={`text-center mb-10 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Cara Kerja</h2>
          <p className="text-zinc-400 text-lg">Mulai dalam hitungan menit. Pilih peranmu dan ikuti langkah mudah berikut.</p>
        </div>
        <div className={`flex justify-center transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex p-1.5 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10">
            <button onClick={() => handleTabSwitch('sender')}
              className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeRole === 'sender' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {activeRole === 'sender' && <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl animate-scale-in" />}
              <span className="relative z-10">Sebagai Pengirim</span>
            </button>
            <button onClick={() => handleTabSwitch('creator')}
              className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeRole === 'creator' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {activeRole === 'creator' && <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl animate-scale-in" />}
              <span className="relative z-10">Sebagai Creator</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ SPLIT LAYOUT ═══ */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row md:gap-16 lg:gap-24">

          {/* LEFT — Sticky icon */}
          <div className="md:w-[45%] flex justify-center">
            <div className="md:sticky md:top-[20vh] md:h-fit py-8 md:py-0">
              <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
                {/* Rings */}
                <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
                <div className="absolute inset-5 rounded-full border border-dashed border-white/[0.03]"
                  style={{ animation: isVisible ? 'slowSpin 40s linear infinite' : 'none' }} />
                <div className="absolute inset-12 rounded-full border border-white/[0.02]" />

                {/* Accent ring glow */}
                <div className="absolute inset-0 rounded-full transition-all duration-700"
                  style={{ boxShadow: `inset 0 0 80px ${cur.glow.replace('0.4', '0.07')}, 0 0 100px ${cur.glow.replace('0.4', '0.04')}` }} />

                {/* Dots */}
                <div className="absolute w-1.5 h-1.5 rounded-full bg-white/20" style={{ top: '10%', left: '15%', animation: 'floatDot 4s ease-in-out infinite' }} />
                <div className="absolute w-1 h-1 rounded-full bg-white/15" style={{ bottom: '12%', right: '18%', animation: 'floatDot 5s ease-in-out infinite 1s' }} />
                <div className="absolute w-1 h-1 rounded-full" style={{ top: '18%', right: '12%', animation: 'floatDot 3.5s ease-in-out infinite 0.5s', background: cur.accent + '30' }} />

                {/* Animated icon */}
                <div className="relative z-10 transition-all duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{
                    opacity: iconPhase === 'in' ? 1 : 0,
                    transform: iconPhase === 'in' ? 'scale(1) translateY(0) rotate(0deg)' : 'scale(0.5) translateY(20px) rotate(-10deg)',
                    filter: iconPhase === 'in' ? 'blur(0)' : 'blur(10px)',
                  }}>
                  {/* Glow */}
                  <div className="absolute inset-0 blur-[35px] rounded-full -z-10 transition-all duration-700"
                    style={{ background: cur.glow.replace('0.4', '0.35'), transform: 'scale(2)' }} />
                  {/* Box */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center transition-all duration-700 relative overflow-visible"
                    style={{
                      background: `linear-gradient(135deg, ${cur.accent}22, ${cur.accent}08)`,
                      border: `1.5px solid ${cur.accent}30`,
                      boxShadow: `0 0 40px ${cur.glow.replace('0.4', '0.2')}, inset 0 0 30px ${cur.glow.replace('0.4', '0.05')}`,
                      color: cur.accent,
                    }}>
                    <IconComp />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Scroll descriptions */}
          <div className="md:w-[55%]">
            {currentSteps.map((step, i) => {
              const isAct = active === i
              return (
                <div key={`${activeRole}-s-${i}`}
                  ref={el => { stepRefs.current[i] = el }}
                  className="min-h-[55vh] md:min-h-[65vh] flex items-center">
                  <div className="py-8 md:py-16 w-full">
                    {/* Step label */}
                    <div className="flex items-center gap-3 mb-5 transition-all duration-500"
                      style={{ opacity: isAct ? 1 : 0.25 }}>
                      <div className="h-[1px] transition-all duration-700"
                        style={{ width: isAct ? '32px' : '16px', background: isAct ? step.accent : 'rgba(255,255,255,0.1)' }} />
                      <span className="text-xs font-mono tracking-widest uppercase transition-colors duration-500"
                        style={{ color: isAct ? step.accent : 'rgba(255,255,255,0.25)' }}>
                        Step {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl font-bold mb-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        color: isAct ? 'white' : 'rgba(255,255,255,0.15)',
                        transform: isAct ? 'translateX(0)' : 'translateX(-10px)',
                      }}>
                      {step.title}
                    </h3>
                    {/* Desc */}
                    <p className="text-base sm:text-lg leading-relaxed max-w-md transition-all duration-700"
                      style={{
                        color: isAct ? 'rgba(161,161,170,1)' : 'rgba(161,161,170,0.15)',
                        transform: isAct ? 'translateX(0)' : 'translateX(-6px)',
                        transitionDelay: isAct ? '100ms' : '0ms',
                      }}>
                      {step.description}
                    </p>
                    {/* Accent line */}
                    <div className="mt-6 h-[2px] rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        width: isAct ? '60px' : '0px',
                        background: isAct ? step.accent : 'transparent',
                        boxShadow: isAct ? `0 0 10px ${step.glow.replace('0.4', '0.3')}` : 'none',
                      }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12">
        <div className={`text-center transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <Link href={activeRole === 'sender' ? '/auth/login' : '/auth/register'}
            className={`group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 ${activeRole === 'sender' ? 'bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/40' : 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/40'}`}>
            {activeRole === 'sender' ? 'Cari Creator Sekarang' : 'Daftar Jadi Creator'}
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ═══ SECTION TRANSITION — flowing trail to Kenapa Fanonym ═══ */}
      <div className="relative h-32 overflow-hidden pointer-events-none">
        {/* Center vertical line */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1px] h-full"
          style={{ background: `linear-gradient(to bottom, ${cur.accent}25, rgba(139,92,246,0.15), transparent)`, transition: 'background 1s ease' }} />
        {/* Branching lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M50 0 Q 35 50, 30 100" fill="none" stroke="rgba(139,92,246,0.06)" strokeWidth="0.3" />
          <path d="M50 0 Q 65 50, 70 100" fill="none" stroke="rgba(139,92,246,0.06)" strokeWidth="0.3" />
        </svg>
        {/* Glowing dot traveling down */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${cur.accent}80, transparent)`,
            animation: 'dotTravel 3s ease-in-out infinite',
            transition: 'background 1s ease',
          }} />
        {/* Scattered tiny stars in transition zone */}
        <div className="absolute w-1 h-1 rounded-full bg-white/10" style={{ left: '30%', top: '40%', animation: 'starTwinkle 3s ease-in-out infinite' }} />
        <div className="absolute w-0.5 h-0.5 rounded-full bg-white/10" style={{ left: '70%', top: '60%', animation: 'starTwinkle 4s ease-in-out infinite 1s' }} />
        <div className="absolute w-0.5 h-0.5 rounded-full bg-white/08" style={{ left: '45%', top: '70%', animation: 'starTwinkle 3.5s ease-in-out infinite 0.5s' }} />
      </div>

      <style>{`
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-8px) scale(1.3); opacity: 0.6; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.08; } 50% { opacity: 0.4; }
        }
        @keyframes dotTravel {
          0% { top: -5%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* Search */
        @keyframes searchMove {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(3px, -2px); }
          50% { transform: translate(-2px, 2px); }
          75% { transform: translate(2px, 1px); }
        }
        @keyframes scanVert {
          0% { transform: translateX(-50%) translateY(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(-50%) translateY(35px); opacity: 0; }
        }
        @keyframes foundPop {
          0%, 70% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }

        /* Credit Card */
        @keyframes cardTilt {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          30% { transform: rotate(2deg) translateY(-2px); }
          70% { transform: rotate(-1deg) translateY(1px); }
        }
        @keyframes numTick {
          0% { transform: translateY(0); } 33% { transform: translateY(-2px); }
          66% { transform: translateY(1px); } 100% { transform: translateY(0); }
        }
        @keyframes dollarBounce {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-4px) scale(1.2); opacity: 1; }
        }
        @keyframes chipShine {
          0%, 100% { background: rgba(234,179,8,0.1); }
          50% { background: rgba(234,179,8,0.35); box-shadow: 0 0 6px rgba(234,179,8,0.3); }
        }

        /* Send */
        @keyframes rocketFly {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(3px, -5px) rotate(-8deg); }
          50% { transform: translate(1px, -2px) rotate(-3deg); }
          75% { transform: translate(-1px, -4px) rotate(-5deg); }
        }
        @keyframes speedLine {
          0% { transform: scaleX(0) translateX(0); opacity: 0; }
          40% { transform: scaleX(1) translateX(-5px); opacity: 0.8; }
          100% { transform: scaleX(0.3) translateX(-15px); opacity: 0; }
        }
        @keyframes exhaust {
          0% { transform: translate(-50%, 0) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%, 12px) scale(0); opacity: 0; }
        }

        /* Register */
        @keyframes personPop {
          0%, 30% { transform: scale(0) translateX(-5px); opacity: 0; }
          50% { transform: scale(1.2) translateX(0); opacity: 1; }
          70% { transform: scale(1) translateX(0); opacity: 0.8; }
          100% { transform: scale(0.8) translateX(3px); opacity: 0; }
        }
        @keyframes plusFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-5px) scale(1.4); opacity: 1; }
        }

        /* Share */
        @keyframes wave {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        /* Earn */
        @keyframes coinFlip {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
        @keyframes currencyCycle {
          0%, 20% { opacity: 0; transform: scale(0) translateY(4px); }
          25%, 45% { opacity: 1; transform: scale(1) translateY(0); }
          50%, 100% { opacity: 0; transform: scale(0.7) translateY(-4px); }
        }
        @keyframes sparkUp {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-16px) scale(0); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
