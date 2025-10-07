// Simple in-memory rate limiting for development
// For production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: Request) => string
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return (request: Request): { success: boolean; remaining: number; resetTime: number } => {
    const key = keyGenerator ? keyGenerator(request) : getDefaultKey(request)
    const now = Date.now()
    const resetTime = now + windowMs

    const entry = rateLimitStore.get(key)

    if (!entry || entry.resetTime < now) {
      // First request or window expired
      rateLimitStore.set(key, { count: 1, resetTime })
      return { success: true, remaining: maxRequests - 1, resetTime }
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return { success: false, remaining: 0, resetTime: entry.resetTime }
    }

    // Increment counter
    entry.count++
    rateLimitStore.set(key, entry)

    return { success: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime }
  }
}

function getDefaultKey(request: Request): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"
  return `rate_limit:${ip}`
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute
