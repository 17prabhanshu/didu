import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth'

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
  genSalt: vi.fn().mockResolvedValue('salt'),
}))

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock-jwt-token'),
  verify: vi.fn().mockReturnValue({ userId: 'test-user-id', role: 'SUPER_ADMIN' }),
}))

describe('Auth Library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123'
      const hash = await hashPassword(password)
      expect(hash).toBe('hashed-password')
    })
  })

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const result = await verifyPassword('TestPassword123', 'hashed-password')
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const bcrypt = await import('bcryptjs')
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false)
      const result = await verifyPassword('WrongPassword', 'hashed-password')
      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const payload = { userId: 'user-123', role: 'EDITOR' }
      const token = generateToken(payload)
      expect(token).toBe('mock-jwt-token')
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const result = verifyToken('valid-token')
      expect(result).toEqual({ userId: 'test-user-id', role: 'SUPER_ADMIN' })
    })

    it('should return null for invalid token', () => {
      const jwt = await import('jsonwebtoken')
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })
      const result = verifyToken('invalid-token')
      expect(result).toBeNull()
    })
  })
})