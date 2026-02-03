'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  linkTo?: string
}

export default function Logo({ size = 'md', linkTo = '/' }: LogoProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const LogoContent = () => (
    <span className={`${sizes[size]} font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent`}>
      fanonym
    </span>
  )

  if (linkTo) {
    return (
      <Link href={linkTo}>
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
