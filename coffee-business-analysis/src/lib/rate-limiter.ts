/**
 * RATE LIMITER UTILITY
 * 
 * src/lib/rate-limiter.ts
 * Prevents API abuse with rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

// In-memory storage (use Redis in production for multiple servers)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export class RateLimiter {
  private interval: number
  private uniqueTokenPerInterval: number

  constructor(options: RateLimitOptions) {
    this.interval = options.interval
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval
  }

  async check(request: NextRequest, limit: number): Promise<{ success: boolean; remaining: number }> {
    // Get identifier (IP address or user ID)
    const identifier = this.getIdentifier(request)
    
    const now = Date.now()
    const tokenData = rateLimitMap.get(identifier)

    // First request or window expired
    if (!tokenData || now > tokenData.resetTime) {
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.interval,
      })
      return { success: true, remaining: limit - 1 }
    }

    // Within rate limit
    if (tokenData.count < limit) {
      tokenData.count++
      return { success: true, remaining: limit - tokenData.count }
    }

    // Rate limit exceeded
    return { success: false, remaining: 0 }
  }

  private getIdentifier(request: NextRequest): string {
    // Try to get IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    return ip
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // Strict: 10 requests per minute
  strict: new RateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10,
  }),
  
  // Standard: 30 requests per minute
  standard: new RateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30,
  }),
  
  // Relaxed: 100 requests per minute
  relaxed: new RateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100,
  }),
}

// Middleware wrapper for API routes
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  limiter: RateLimiter = rateLimiters.standard,
  limit: number = 30
): Promise<NextResponse> {
  const result = await limiter.check(request, limit)

  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter: 60 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
        }
      }
    )
  }

  const response = await handler()
  
  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  
  return response
}

// Cleanup every 5 minutes
setInterval(() => {
  rateLimiters.strict.cleanup()
  rateLimiters.standard.cleanup()
  rateLimiters.relaxed.cleanup()
}, 5 * 60 * 1000)