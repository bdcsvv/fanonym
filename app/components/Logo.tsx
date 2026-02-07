'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  linkTo?: string
  className?: string
}

export default function Logo({ size = 'md', linkTo, className = '' }: LogoProps) {
  const [dashboardUrl, setDashboardUrl] = useState('/')
  
  useEffect(() => {
    const checkUserAndSetUrl = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()
        
        if (profile?.user_type === 'creator') {
          setDashboardUrl('/dashboard/creator')
        } else if (profile?.user_type === 'sender') {
          setDashboardUrl('/dashboard/sender')
        }
      }
    }
    
    // Only check if no explicit linkTo provided
    if (!linkTo) {
      checkUserAndSetUrl()
    }
  }, [linkTo])

  const href = linkTo || dashboardUrl

  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <Link 
      href={href} 
      className={`font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)] ${sizes[size]} ${className}`}
    >
      fanonym
    </Link>
  )
}
