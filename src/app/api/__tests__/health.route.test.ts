import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/health/route'
import { db } from '@/lib/db'

describe('Health API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return healthy status when database is connected', async () => {
    vi.mocked(db.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks.database).toBe('connected')
    expect(data.timestamp).toBeDefined()
  })

  it('should return unhealthy status when database is disconnected', async () => {
    vi.mocked(db.$queryRaw).mockRejectedValueOnce(new Error('Connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.database).toBe('disconnected')
  })
})