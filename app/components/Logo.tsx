'use client'

import Link from 'next/link'

interface LogoProps {
  variant?: 'text' | 'mask'  // text = homepage, mask = dashboard etc
  size?: 'sm' | 'md' | 'lg'
  linkTo?: string
}

export default function Logo({ variant = 'text', size = 'md', linkTo = '/' }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const LogoContent = () => (
    <span className={`${sizes[size]} font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]`}>
      fanonym
    </span>
  )

  if (linkTo) {
    return (
      <Link href={linkTo} className="flex items-center">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
