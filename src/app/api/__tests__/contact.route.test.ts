import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/contact/route'
import { db } from '@/lib/db'

// Helper to create a mock request
function createMockRequest(body: any, contentType: string) {
  let formData: any = null
  let jsonBody: any = null
  
  if (contentType.includes('application/json')) {
    jsonBody = body
  } else {
    formData = body
  }

  return {
    headers: {
      get: vi.fn().mockReturnValue(contentType),
    },
    json: vi.fn().mockResolvedValue(jsonBody),
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as Request
}

describe('Contact API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 for missing required fields', async () => {
    const request = createMockRequest({ name: 'Test', email: 'test@example.com' }, 'application/json')

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

    const request = createMockRequest({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message',
    }, 'application/json')

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

    const formData = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'name') return 'Test User'
        if (key === 'email') return 'test@example.com'
        if (key === 'message') return 'Test message'
        if (key === 'subject') return ''
        return null
      }),
    }

    const request = createMockRequest(formData, 'multipart/form-data')

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})