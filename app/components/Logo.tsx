'use client'

import Link from 'next/link'

interface LogoProps {
  variant?: 'text' | 'mask'  // text = homepage, mask = dashboard etc
  size?: 'sm' | 'md' | 'lg'
  linkTo?: string
}

export default function Logo({ variant = 'text', size = 'md', linkTo = '/' }: LogoProps) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  }

  const LogoContent = () => (
    <img 
      src={variant === 'text' ? '/logo-text.png' : '/logo-mask.png'}
      alt="Fanonym"
      className={`${sizes[size]} w-auto object-contain`}
    />
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
