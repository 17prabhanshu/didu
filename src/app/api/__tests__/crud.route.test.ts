import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, DELETE } from '@/app/api/admin/crud/route'
import { db } from '@/lib/db'

describe('Admin CRUD API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 for unauthenticated user', async () => {
      vi.spyOn(await import('@/lib/session'), 'requireRole').mockRejectedValueOnce(new Error('Forbidden'))

      const request = new Request('http://localhost/api/admin/crud?model=article')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return schema for model', async () => {
      vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
        userId: 'user-123',
        role: 'EDITOR',
        sessionId: 'session-123',
      })

      const request = new Request('http://localhost/api/admin/crud?model=article&action=schema')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schema).toBeDefined()
    })
  })

  describe('POST', () => {
    it('should return 401 for unauthenticated user', async () => {
      vi.spyOn(await import('@/lib/session'), 'requireRole').mockRejectedValueOnce(new Error('Forbidden'))

      const request = new Request('http://localhost/api/admin/crud', {
        method: 'POST',
        body: JSON.stringify({ model: 'article', data: { title: 'Test' } }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return 400 for missing model or data', async () => {
      vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
        userId: 'user-123',
        role: 'EDITOR',
        sessionId: 'session-123',
      })

      const request = new Request('http://localhost/api/admin/crud', {
        method: 'POST',
        body: JSON.stringify({ model: 'article' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing model or data')
    })

    it('should return 403 for non-super-admin trying to modify sensitive models', async () => {
      vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
        userId: 'user-123',
        role: 'EDITOR',
        sessionId: 'session-123',
      })

      const request = new Request('http://localhost/api/admin/crud', {
        method: 'POST',
        body: JSON.stringify({ model: 'user', data: { email: 'test@test.com' } }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Only Super Admins can modify system records.')
    })
  })

  describe('DELETE', () => {
    it('should return 403 for non-super-admin', async () => {
      vi.spyOn(await import('@/lib/session'), 'requireRole').mockRejectedValueOnce(new Error('Forbidden'))

      const request = new Request('http://localhost/api/admin/crud?model=article&id=123', {
        method: 'DELETE',
      })
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })
  })
})