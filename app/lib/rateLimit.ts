// Simple in-memory rate limiter
// Resets on server restart, good enough for Vercel serverless

const attempts: Record<string, { count: number; resetAt: number }> = {}

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = attempts[key]

  if (!record || now > record.resetAt) {
    attempts[key] = { count: 1, resetAt: now + windowMs }
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxAttempts - record.count }
}

export function getRateLimitKey(ip: string, action: string): string {
  return `${action}:${ip}`
}
