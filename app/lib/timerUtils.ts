// app/lib/timerUtils.ts

/**
 * Calculate time left from now until expiration date
 * Returns formatted string and raw milliseconds
 */
export function calculateTimeLeft(expiresAt: string | Date): {
  formatted: string
  milliseconds: number
  isExpired: boolean
} {
  const now = new Date().getTime()
  const expires = new Date(expiresAt).getTime()
  const diff = expires - now

  if (diff <= 0) {
    return {
      formatted: 'Expired',
      milliseconds: 0,
      isExpired: true
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  let formatted = ''
  
  if (days > 0) {
    formatted = `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    formatted = `${hours}j ${minutes}m ${seconds}d`
  } else if (minutes > 0) {
    formatted = `${minutes}m ${seconds}d`
  } else {
    formatted = `${seconds}d`
  }

  return {
    formatted,
    milliseconds: diff,
    isExpired: false
  }
}

/**
 * Check if a date is expired
 */
export function isExpired(expiresAt: string | Date | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() <= new Date().getTime()
}

/**
 * Add hours to current date
 */
export function addHours(hours: number, fromDate?: Date): Date {
  const date = fromDate ? new Date(fromDate) : new Date()
  date.setHours(date.getHours() + hours)
  return date
}

/**
 * Add days to current date
 */
export function addDays(days: number, fromDate?: Date): Date {
  const date = fromDate ? new Date(fromDate) : new Date()
  date.setDate(date.getDate() + days)
  return date
}

/**
 * Format date to Indonesian locale
 */
export function formatDateID(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get relative time (e.g., "2 jam lalu", "5 menit lalu")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date().getTime()
  const then = new Date(date).getTime()
  const diff = now - then

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} tahun lalu`
  if (months > 0) return `${months} bulan lalu`
  if (weeks > 0) return `${weeks} minggu lalu`
  if (days > 0) return `${days} hari lalu`
  if (hours > 0) return `${hours} jam lalu`
  if (minutes > 0) return `${minutes} menit lalu`
  return 'Baru saja'
}

/**
 * Check if date is within last 24 hours
 */
export function isWithin24Hours(date: string | Date): boolean {
  const now = new Date().getTime()
  const then = new Date(date).getTime()
  const diff = now - then
  const twentyFourHours = 24 * 60 * 60 * 1000
  return diff <= twentyFourHours
}

/**
 * Get warning level based on time left
 * Returns: 'safe', 'warning', 'critical', 'expired'
 */
export function getTimeWarningLevel(expiresAt: string | Date | null): 'safe' | 'warning' | 'critical' | 'expired' {
  if (!expiresAt) return 'safe'
  
  const { milliseconds, isExpired: expired } = calculateTimeLeft(expiresAt)
  
  if (expired) return 'expired'
  
  const oneHour = 60 * 60 * 1000
  const threeHours = 3 * oneHour
  
  if (milliseconds <= oneHour) return 'critical'
  if (milliseconds <= threeHours) return 'warning'
  return 'safe'
}

/**
 * Get color class based on warning level
 */
export function getTimeColorClass(level: 'safe' | 'warning' | 'critical' | 'expired'): string {
  const colors = {
    safe: 'text-green-400 bg-green-500/20 border-green-500/30',
    warning: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    critical: 'text-red-400 bg-red-500/20 border-red-500/30',
    expired: 'text-zinc-500 bg-zinc-700/20 border-zinc-700/30'
  }
  return colors[level]
}
