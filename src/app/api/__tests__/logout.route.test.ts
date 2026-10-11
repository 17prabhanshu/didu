import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/logout/route'

describe('Logout API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete session and return success', async () => {
    vi.spyOn(await import('@/lib/session'), 'deleteSession').mockResolvedValueOnce(undefined)

    const request = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})