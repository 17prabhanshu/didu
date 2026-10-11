import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/admin/me/route'
import { db } from '@/lib/db'

describe('Admin Me API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 for unauthenticated user', async () => {
    vi.spyOn(await import('@/lib/session'), 'getSession').mockResolvedValueOnce(null)

    const request = new Request('http://localhost/api/admin/me')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 for non-existent user', async () => {
    vi.spyOn(await import('@/lib/session'), 'getSession').mockResolvedValueOnce({
      userId: 'non-existent',
      role: 'EDITOR',
      sessionId: 'session-123',
    })
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null)

    const request = new Request('http://localhost/api/admin/me')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return user data for authenticated user', async () => {
    vi.spyOn(await import('@/lib/session'), 'getSession').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      avatar: null,
      role: 'EDITOR',
      passwordHash: 'hash',
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const request = new Request('http://localhost/api/admin/me')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      avatar: null,
      role: 'EDITOR',
    })
  })
})