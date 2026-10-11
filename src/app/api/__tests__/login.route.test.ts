import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

describe('Login API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('Invalid email or password format.')
  })

  it('should return 401 for non-existent user', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('Invalid credentials')
  })

  it('should return 401 for invalid password', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      name: 'Test User',
      role: 'EDITOR',
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('Invalid credentials')
  })

  it('should return 200 and session for valid credentials', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      name: 'Test User',
      role: 'EDITOR',
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'correctpassword' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'EDITOR',
    })
  })
})