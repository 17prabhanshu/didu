import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

    it('should return null for invalid token', async () => {
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })
      const result = verifyToken('invalid-token')
      expect(result).toBeNull()
    })
  })
})