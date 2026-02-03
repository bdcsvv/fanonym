'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function CreatorRedirect() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  useEffect(() => {
    router.replace(`/profile/${username}`)
  }, [username, router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  )
}
