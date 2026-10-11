import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/contact/route'
import { db } from '@/lib/db'

describe('Contact API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@example.com' }), // missing message
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Name, email, and message are required.')
  })

  it('should create contact message and return success', async () => {
    vi.mocked(db.contactMessage.create).mockResolvedValueOnce({
      id: 'msg-123',
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message',
      status: 'UNREAD',
      createdAt: new Date(),
    })

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Message sent successfully!')
    expect(db.contactMessage.create).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        status: 'UNREAD',
      },
    })
  })

  it('should handle FormData input', async () => {
    vi.mocked(db.contactMessage.create).mockResolvedValueOnce({
      id: 'msg-123',
      name: 'Test User',
      email: 'test@example.com',
      subject: '',
      message: 'Test message',
      status: 'UNREAD',
      createdAt: new Date(),
    })

    const formData = new FormData()
    formData.append('name', 'Test User')
    formData.append('email', 'test@example.com')
    formData.append('message', 'Test message')

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})