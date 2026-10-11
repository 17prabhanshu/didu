import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSession, getSession, deleteSession, requireAuth, requireRole } from '@/lib/session'
import { db } from '@/lib/db'

// Use vi.hoisted to define mocks before hoisting
const { mockCookies, mockRedirect, mockVerifyToken, mockGenerateToken, mockGetSessionExpiryDate } = vi.hoisted(() => ({
  mockCookies: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  mockRedirect: vi.fn(),
  mockVerifyToken: vi.fn(),
  mockGenerateToken: vi.fn().mockReturnValue('mock-jwt-token'),
  mockGetSessionExpiryDate: vi.fn().mockReturnValue(new Date(Date.now() + 30 * 60 * 1000)),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookies),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

// Mock auth module's verifyToken, generateToken, getSessionExpiryDate
vi.mock('@/lib/auth', () => ({
  verifyToken: mockVerifyToken,
  generateToken: mockGenerateToken,
  getSessionExpiryDate: mockGetSessionExpiryDate,
}))

describe('Session Library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookies.get.mockReset()
    mockCookies.set.mockReset()
    mockCookies.delete.mockReset()
    mockRedirect.mockReset()
    mockVerifyToken.mockReset()
    mockGenerateToken.mockReset()
    mockGetSessionExpiryDate.mockReset()
    // Default mock: return SUPER_ADMIN
    mockVerifyToken.mockReturnValue({ userId: 'test-user-id', role: 'SUPER_ADMIN' })
    mockGenerateToken.mockReturnValue('mock-jwt-token')
    mockGetSessionExpiryDate.mockReturnValue(new Date(Date.now() + 30 * 60 * 1000))
  })

  describe('createSession', () => {
    it('should create a session and set cookie', async () => {
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
      expect(mockCookies.set).toHaveBeenCalled()
    })
  })

  describe('getSession', () => {
    it('should return session data for valid token', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'valid-token' })

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
      mockCookies.get.mockReturnValueOnce(undefined)

      const session = await getSession()
      expect(session).toBeNull()
    })

    it('should return null for expired session', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'expired-token' })

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
      mockCookies.get.mockReturnValueOnce({ value: 'token-to-delete' })

      await deleteSession()
      expect(db.session.deleteMany).toHaveBeenCalledWith({
        where: { token: 'token-to-delete' },
      })
      expect(mockCookies.delete).toHaveBeenCalled()
    })
  })

  describe('requireAuth', () => {
    it('should return session for authenticated user', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'valid-token' })

      vi.mocked(db.session.findUnique).mockResolvedValueOnce({
        id: 'session-123',
        userId: 'user-123',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      })

      const session = await requireAuth()
      expect(session).toEqual({
        userId: 'test-user-id',
        role: 'SUPER_ADMIN',
        sessionId: 'session-123',
      })
    })

    it('should redirect for unauthenticated user', async () => {
      mockCookies.get.mockReturnValueOnce(undefined)

      const session = await requireAuth()
      expect(session).toBeNull()
      expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
    })
  })

  describe('requireRole', () => {
    it('should return session for authorized role', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'valid-token' })

      vi.mocked(db.session.findUnique).mockResolvedValueOnce({
        id: 'session-123',
        userId: 'user-123',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      })

      const session = await requireRole(['SUPER_ADMIN', 'EDITOR'])
      expect(session).toEqual({
        userId: 'test-user-id',
        role: 'SUPER_ADMIN',
        sessionId: 'session-123',
      })
    })

    it('should throw for unauthorized role', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'valid-token' })

      // Override verifyToken to return AUTHOR role
      mockVerifyToken.mockReturnValueOnce({ userId: 'test-user-id', role: 'AUTHOR' })

      vi.mocked(db.session.findUnique).mockResolvedValueOnce({
        id: 'session-123',
        userId: 'user-123',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      })

      await expect(requireRole(['SUPER_ADMIN', 'EDITOR'])).rejects.toThrow('Forbidden')
    })
  })
})