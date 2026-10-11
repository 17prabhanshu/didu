import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  let limiter: ReturnType<typeof rateLimit>

  beforeEach(() => {
    vi.useFakeTimers()
    limiter = rateLimit({ interval: 60000, maxRequests: 5 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow requests under limit', async () => {
    const result = await limiter.check('user-1')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should track remaining requests', async () => {
    await limiter.check('user-1')
    await limiter.check('user-1')
    const result = await limiter.check('user-1')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('should block requests over limit', async () => {
    for (let i = 0; i < 5; i++) {
      await limiter.check('user-1')
    }
    const result = await limiter.check('user-1')
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset after interval', async () => {
    for (let i = 0; i < 5; i++) {
      await limiter.check('user-1')
    }
    
    // Fast-forward past the interval
    vi.advanceTimersByTime(61000)
    
    const result = await limiter.check('user-1')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should track different identifiers separately', async () => {
    await limiter.check('user-1')
    await limiter.check('user-1')
    const result = await limiter.check('user-2')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should return reset timestamp', async () => {
    const now = Date.now()
    vi.setSystemTime(now)
    
    const result = await limiter.check('user-1')
    expect(result.reset).toBe(now + 60000)
  })
})