import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/admin/upload/route'
import { db } from '@/lib/db'

describe('Upload API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 for unauthenticated user', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockRejectedValueOnce(new Error('Forbidden'))

    const request = new NextRequest('http://localhost/api/admin/upload', {
      method: 'POST',
      body: new FormData(),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 400 for missing file', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    const formData = new FormData()
    const request = new NextRequest('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No file provided')
  })

  it('should return 400 for invalid file type', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', file)

    const request = new NextRequest('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.')
  })

  it('should upload file and return URL', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    vi.mocked(db.mediaAsset.create).mockResolvedValueOnce({
      id: 'media-123',
      filename: 'test.jpg',
      url: 'https://blob.url/test.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      altText: null,
      caption: null,
      description: null,
      attribution: null,
      copyright: null,
      width: null,
      height: null,
      uploadedById: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)

    const request = new NextRequest('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.url).toBe('https://blob.url/test.jpg')
    expect(data.asset).toBeDefined()
  })
})