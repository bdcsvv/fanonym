'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const features = [
  {
    id: 'aman',
    title: 'Aman',
    description: 'Data dan identitasmu dilindungi dengan enkripsi tingkat tinggi. Tidak ada yang bisa melacak pesanmu.',
    highlight: 'Enkripsi End-to-End',
    number: '01',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    glow: 'rgba(139,92,246,0.35)',
    accent: '#8b5cf6',
    bgCard: 'from-violet-900/40 via-purple-900/30 to-transparent',
    number_color: '#8b5cf6',
  },
  {
    id: 'anonim',
    title: 'Anonim',
    description: 'Identitasmu 100% tersembunyi. Kirim pesan tanpa rasa khawatir identitasmu akan terungkap.',
    highlight: '100% Private',
    number: '02',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    glow: 'rgba(168,85,247,0.35)',
    accent: '#a855f7',
    bgCard: 'from-purple-900/40 via-fuchsia-900/20 to-transparent',
    number_color: '#a855f7',
  },
  {
    id: 'mudah',
    title: 'Mudah',
    description: 'Proses simpel dan cepat. Daftar, beli kredit, langsung kirim pesan pertamamu dalam hitungan detik.',
    highlight: '< 1 Menit Setup',
    number: '03',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    glow: 'rgba(217,70,239,0.35)',
    accent: '#d946ef',
    bgCard: 'from-fuchsia-900/40 via-violet-900/20 to-transparent',
    number_color: '#d946ef',
  },
]

export default function KenapaFanonymCards() {
  const [active, setActive] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState('next')
  const [autoplay, setAutoplay] = useState(true)
  const containerRef = useRef(null)
  const autoplayRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const goTo = useCallback((index, dir) => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(dir)
    setTimeout(() => {
      setActive(index)
      setIsAnimating(false)
    }, 550)
  }, [isAnimating])

  const next = useCallback(() => {
    goTo((active + 1) % features.length, 'next')
  }, [active, goTo])

  useEffect(() => {
    if (!isVisible || !autoplay) return
    autoplayRef.current = setInterval(next, 3800)
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [isVisible, autoplay, next])

  const handleNav = (index) => {
    if (index === active || isAnimating) return
    setAutoplay(false)
    goTo(index, index > active ? 'next' : 'prev')
    setTimeout(() => setAutoplay(true), 7000)
  }

  const cur = features[active]
  const prevF = features[(active - 1 + features.length) % features.length]
  const nextF = features[(active + 1) % features.length]

  return (
    <div ref={containerRef} className="relative">

      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

          {/* 3-card stage */}
          <div className="relative flex items-center justify-center gap-5 h-[420px]">

            {/* PREV */}
            <div className="flex-shrink-0 cursor-pointer" style={{width:'255px'}} onClick={() => handleNav((active - 1 + features.length) % features.length)}>
              <div className="relative rounded-3xl p-7 border border-white/8 bg-white/[0.02] overflow-hidden h-[290px] hover:border-white/15 hover:scale-[1.02] transition-all duration-500"
                style={{transform:'perspective(900px) rotateY(28deg) scale(0.83)', opacity:0.4}}>
                <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 mb-4">{prevF.icon}</div>
                <span className="text-xs text-white/35 px-2.5 py-1 rounded-full border border-white/10 mb-3 inline-block">{prevF.highlight}</span>
                <h3 className="text-lg font-bold text-white/50 mb-2">{prevF.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">{prevF.description}</p>
              </div>
            </div>

            {/* ACTIVE CENTER */}
            <div className="flex-shrink-0 relative" style={{width:'430px', zIndex:10}}>
              {/* Glow */}
              <div className="absolute inset-0 rounded-3xl -z-10 blur-[70px] scale-75 transition-all duration-700"
                style={{background:`radial-gradient(ellipse, ${cur.glow}, transparent 70%)`}} />

              <div
                className="relative rounded-3xl p-8 overflow-hidden"
                style={{
                  height: '390px',
                  border: `1px solid ${cur.accent}44`,
                  background: `linear-gradient(145deg, ${cur.glow.replace('0.35','0.1')}, rgba(8,8,14,0.97) 70%)`,
                  boxShadow: `0 30px 90px -20px ${cur.glow.replace('0.35','0.55')}`,
                  transform: isAnimating
                    ? `perspective(1200px) rotateY(${direction === 'next' ? '-12deg' : '12deg'}) rotateZ(${direction === 'next' ? '-1.5deg' : '1.5deg'}) scale(0.95)`
                    : 'perspective(1200px) rotateY(0) rotateZ(0) scale(1)',
                  transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                {/* Conic sweep bg */}
                <div className="absolute inset-0 opacity-[0.18] pointer-events-none rounded-3xl"
                  style={{background:`conic-gradient(from -90deg at 115% 115%, ${cur.accent}, transparent 32%)`}} />

                {/* Spiral animation overlay during transition */}
                {isAnimating && (
                  <div className="absolute inset-0 rounded-3xl z-20 pointer-events-none overflow-hidden">
                    <div style={{
                      position:'absolute', inset:0,
                      background:`conic-gradient(from ${direction==='next'?'0deg':'270deg'}, transparent 0%, ${cur.accent}30 25%, transparent 50%)`,
                      animation:'spiralSpin 0.55s ease-out forwards',
                    }}/>
                  </div>
                )}

                {/* Number watermark */}
                <div className="absolute -right-3 -bottom-5 text-[140px] font-black leading-none pointer-events-none select-none"
                  style={{color:`${cur.accent}0e`}}>{cur.number}</div>

                {/* Icon */}
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white transition-all duration-500"
                  style={{
                    background:`linear-gradient(135deg, ${cur.accent}44, ${cur.accent}1a)`,
                    border:`1px solid ${cur.accent}44`,
                    boxShadow:`0 8px 32px ${cur.glow.replace('0.35','0.3')}`,
                    transform: isAnimating
                      ? `rotate(${direction==='next'?'180deg':'-180deg'}) scale(0.7)`
                      : 'rotate(0deg) scale(1)',
                  }}>
                  {cur.icon}
                </div>

                {/* Badge */}
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
                  style={{background:`${cur.accent}18`, color:cur.accent, borderColor:`${cur.accent}33`}}>
                  {cur.highlight}
                </span>

                {/* Title */}
                <h3 className="text-3xl font-bold text-white mb-4 transition-all duration-400"
                  style={{transform: isAnimating ? `translateX(${direction==='next'?'12px':'-12px'})` : 'translateX(0)', opacity: isAnimating ? 0.4 : 1}}>
                  {cur.title}
                </h3>

                {/* Desc */}
                <p className="text-zinc-400 leading-relaxed text-base transition-all duration-400"
                  style={{opacity: isAnimating ? 0 : 1}}>
                  {cur.description}
                </p>

                {/* Progress bar */}
                <div className="absolute bottom-7 left-8 right-8 h-[2px] bg-white/5 rounded-full overflow-hidden">
                  <div key={`${active}-${autoplay}`} className="h-full rounded-full"
                    style={{
                      background:`linear-gradient(90deg, ${cur.accent}, ${cur.accent}66)`,
                      animation: autoplay ? 'progressBar 3.8s linear forwards' : 'none',
                      width: autoplay ? undefined : '100%',
                    }} />
                </div>
              </div>
            </div>

            {/* NEXT */}
            <div className="flex-shrink-0 cursor-pointer" style={{width:'255px'}} onClick={() => handleNav((active + 1) % features.length)}>
              <div className="relative rounded-3xl p-7 border border-white/8 bg-white/[0.02] overflow-hidden h-[290px] hover:border-white/15 hover:scale-[1.02] transition-all duration-500"
                style={{transform:'perspective(900px) rotateY(-28deg) scale(0.83)', opacity:0.4}}>
                <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 mb-4">{nextF.icon}</div>
                <span className="text-xs text-white/35 px-2.5 py-1 rounded-full border border-white/10 mb-3 inline-block">{nextF.highlight}</span>
                <h3 className="text-lg font-bold text-white/50 mb-2">{nextF.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">{nextF.description}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-center gap-5 mt-8">
            <button onClick={() => handleNav((active - 1 + features.length) % features.length)}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group">
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              {features.map((f, i) => (
                <button key={f.id} onClick={() => handleNav(i)}
                  className="rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{
                    width: active===i ? '32px' : '8px',
                    height: '8px',
                    background: active===i ? cur.accent : 'rgba(255,255,255,0.15)',
                    boxShadow: active===i ? `0 0 12px ${cur.glow}` : 'none',
                  }} />
              ))}
            </div>

            <button onClick={() => handleNav((active + 1) % features.length)}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group">
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative rounded-3xl p-6 overflow-hidden mb-5"
            style={{
              border:`1px solid ${cur.accent}44`,
              background:`linear-gradient(145deg, ${cur.glow.replace('0.35','0.1')}, rgba(8,8,14,0.97))`,
              boxShadow:`0 20px 60px -15px ${cur.glow.replace('0.35','0.4')}`,
              transform: isAnimating ? `rotate(${direction==='next'?'-2.5deg':'2.5deg'}) scale(0.96)` : 'rotate(0) scale(1)',
              transition:'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              minHeight: '260px',
            }}>
            <div className="absolute inset-0 opacity-[0.14] pointer-events-none rounded-3xl"
              style={{background:`conic-gradient(from -90deg at 115% 115%, ${cur.accent}, transparent 30%)`}} />
            <div className="absolute -right-2 -bottom-4 text-[100px] font-black leading-none pointer-events-none select-none"
              style={{color:`${cur.accent}10`}}>{cur.number}</div>

            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white"
              style={{
                background:`linear-gradient(135deg, ${cur.accent}44, ${cur.accent}1a)`,
                border:`1px solid ${cur.accent}44`,
                transform: isAnimating ? 'rotate(180deg) scale(0.7)' : 'rotate(0) scale(1)',
                transition:'transform 0.5s ease-in-out',
              }}>
              {cur.icon}
            </div>
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold mb-4 border"
              style={{background:`${cur.accent}18`, color:cur.accent, borderColor:`${cur.accent}33`}}>
              {cur.highlight}
            </span>
            <h3 className="text-2xl font-bold text-white mb-3">{cur.title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">{cur.description}</p>
          </div>

          <div className="flex items-center justify-between px-1">
            <button onClick={() => handleNav((active - 1 + features.length) % features.length)}
              className="w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="flex gap-2.5">
              {features.map((f, i) => (
                <button key={f.id} onClick={() => handleNav(i)}
                  className="rounded-full transition-all duration-400"
                  style={{
                    width: active===i ? '28px' : '8px',
                    height:'8px',
                    background: active===i ? cur.accent : 'rgba(255,255,255,0.15)',
                  }} />
              ))}
            </div>
            <button onClick={() => handleNav((active + 1) % features.length)}
              className="w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progressBar { from{width:0%} to{width:100%} }
        @keyframes spiralSpin {
          from { transform: rotate(0deg) scale(1.5); opacity: 1; }
          to   { transform: rotate(${360}deg) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
