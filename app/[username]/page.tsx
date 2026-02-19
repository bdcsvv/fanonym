'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Redirect fanonym.id/username → /profile/username
// This gives the clean URL format
export default function UsernameRedirect() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  useEffect(() => {
    if (username) {
      router.replace(`/profile/${username}`)
    }
  }, [username, router])

  return null
}
