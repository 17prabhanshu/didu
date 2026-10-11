import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSession, getSession, deleteSession, requireAuth, requireRole } from '@/lib/session'
import { db } from '@/lib/db'

describe('Session Library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSession', () => {
    it('should create a session and set cookie', async () => {
      const cookies = await import('next/headers')
      vi.mocked(cookies.cookies).mockReturnValueOnce({
        set: vi.fn(),
      } as any)

      vi.mocked(db.session.create).mockResolvedValueOnce({
        id: 'session-123',
        userId: 'user-123',
        token: 'mock-jwt-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      })

      const token = await createSession('user-123', 'EDITOR')
      expect(token).toBe('mock-jwt-token')
      expect(db.session.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          token: 'mock-jwt-token',
          expiresAt: expect.any(Date),
        },
      })
    })
  })

  describe('getSession', () => {
    it('should return session data for valid token', async () => {
      const cookies = await import('next/headers')
      vi.mocked(cookies.cookies).mockReturnValueOnce({
        get: vi.fn().mockReturnValue({ value: 'valid-token' }),
      } as any)

      vi.mocked(db.session.findUnique).mockResolvedValueOnce({
        id: 'session-123',
        userId: 'user-123',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      })

      const session = await getSession()
      expect(session).toEqual({
        userId: 'test-user-id',
        role: 'SUPER_ADMIN',
        sessionId: 'session-123',
      })
    })

    it('should return null for missing token', async () => {
      const cookies = await import('next/headers')
      vi.mocked(cookies.cookies).mockReturnValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any)

      const session = await getSession()
      expect(session).toBeNull()
    })

    it('should return null for expired session', async () => {
      const cookies = await import('next/headers')
      vi.mocked(cookies.cookies).mockReturnValueOnce({
        get: vi.fn().mockReturnValue({ value: 'expired-token' }),
      } as any)

      vi.mocked(db.session.findUnique).mockResolvedValueOnce({
        id: 'session-123',
        userId: 'user-123',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
      })

      const session = await getSession()
      expect(session).toBeNull()
    })
  })

  describe('deleteSession', () => {
    it('should delete session and clear cookie', async () => {
      const cookies = await import('next/headers')
      vi.mocked(cookies.cookies).mockReturnValueOnce({
        get: vi.fn().mockReturnValue({ value: 'token-to-delete' }),
        delete: vi.fn(),
      } as any)

      await deleteSession()
      expect(db.session.deleteMany).toHaveBeenCalledWith({
        where: { token: 'token-to-delete' },
      })
    })
  })

  describe('requireAuth', () => {
    it('should return session for authenticated user', async () => {
      vi.spyOn(await import('@/lib/session'), 'getSession').mockResolvedValueOnce({
        userId: 'user-123',
        role: 'EDITOR',
        sessionId: 'session-123',
      })

      const session = await requireAuth()
      expect(session).toEqual({
        userId: 'user-123',
        role: 'EDITOR',
        sessionId: 'session-123',
      })
    })

    it('should redirect for unauthenticated user', async () => {
      vi.spyOn(await import('@/lib/session'), 'getSession').mockResolvedValueOnce(null)
      const nav = await import('next/navigation')
      
      await expect(requireAuth()).rejects.toThrow()
      expect(nav.redirect).toHaveBeenCalledWith('/admin/login')
    })
  })

  describe('requireRole', () => {
    it('should return session for authorized role', async () => {
      vi.spyOn(await import('@/lib/session'), 'requireAuth').mockResolvedValueOnce({
        userId: 'user-123',
        role: 'SUPER_ADMIN',
        sessionId: 'session-123',
      })

      const session = await requireRole(['SUPER_ADMIN', 'EDITOR'])
      expect(session).toEqual({
        userId: 'user-123',
        role: 'SUPER_ADMIN',
        sessionId: 'session-123',
      })
    })

    it('should throw for unauthorized role', async () => {
      vi.spyOn(await import('@/lib/session'), 'requireAuth').mockResolvedValueOnce({
        userId: 'user-123',
        role: 'AUTHOR',
        sessionId: 'session-123',
      })

      await expect(requireRole(['SUPER_ADMIN', 'EDITOR'])).rejects.toThrow('Forbidden')
    })
  })
})