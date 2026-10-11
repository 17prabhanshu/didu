import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/newsletter/route'
import { db } from '@/lib/db'

describe('Newsletter API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email', age: 25 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid email address')
  })

  it('should return 400 for age below 13', async () => {
    const request = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', age: 10 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('You must be at least 13 years old to subscribe')
  })

  it('should return 400 for age above 120', async () => {
    const request = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', age: 150 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Age must be 120 or less')
  })

  it('should subscribe new user and return success', async () => {
    vi.mocked(db.newsletterSubscriber.upsert).mockResolvedValueOnce({
      id: 'sub-123',
      email: 'test@example.com',
      age: 25,
      status: 'ACTIVE',
      subscribedAt: new Date(),
      unsubscribedAt: null,
      createdAt: new Date(),
    })

    const request = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', age: 25 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Subscribed successfully!')
    expect(db.newsletterSubscriber.upsert).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      update: {
        status: 'ACTIVE',
        age: 25,
        subscribedAt: expect.any(Date),
        unsubscribedAt: null,
      },
      create: {
        email: 'test@example.com',
        age: 25,
        status: 'ACTIVE',
        subscribedAt: expect.any(Date),
      },
    })
  })

  it('should handle FormData input', async () => {
    vi.mocked(db.newsletterSubscriber.upsert).mockResolvedValueOnce({
      id: 'sub-123',
      email: 'test@example.com',
      age: 25,
      status: 'ACTIVE',
      subscribedAt: new Date(),
      unsubscribedAt: null,
      createdAt: new Date(),
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('age', '25')

    const request = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should coerce age from string to number', async () => {
    vi.mocked(db.newsletterSubscriber.upsert).mockResolvedValueOnce({
      id: 'sub-123',
      email: 'test@example.com',
      age: 25,
      status: 'ACTIVE',
      subscribedAt: new Date(),
      unsubscribedAt: null,
      createdAt: new Date(),
    })

    const request = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', age: '25' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})