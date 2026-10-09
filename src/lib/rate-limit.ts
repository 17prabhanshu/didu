interface RateLimitConfig {
  interval: number // ms
  maxRequests: number
}

interface RateLimitData {
  count: number
  resetAt: number
}

export function rateLimit(config: RateLimitConfig) {
  const store = new Map<string, RateLimitData>()

  const check = async (identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> => {
    const now = Date.now()
    const record = store.get(identifier)

    if (record) {
      if (now > record.resetAt) {
        store.set(identifier, { count: 1, resetAt: now + config.interval })
        return { success: true, remaining: config.maxRequests - 1, reset: now + config.interval }
      } else {
        const newCount = record.count + 1
        store.set(identifier, { ...record, count: newCount })
        if (newCount > config.maxRequests) {
          return { success: false, remaining: 0, reset: record.resetAt }
        }
        return { success: true, remaining: config.maxRequests - newCount, reset: record.resetAt }
      }
    } else {
      store.set(identifier, { count: 1, resetAt: now + config.interval })
      
      // Cleanup expired entries
      for (const [key, val] of store.entries()) {
        if (now > val.resetAt) {
          store.delete(key)
        }
      }

      return { success: true, remaining: config.maxRequests - 1, reset: now + config.interval }
    }
  }

  return { check }
}
