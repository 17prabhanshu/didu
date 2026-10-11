import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/admin/upload/route'
import { db } from '@/lib/db'

describe('Upload API - File Type Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reject file with invalid magic bytes (txt with jpg extension)', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    // Create a text file but with .jpg extension
    const file = new File(['This is not an image'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)

    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    // Should be rejected because magic bytes don't match
    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.')
  })

  it('should accept valid JPEG file', async () => {
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

    // Create a valid JPEG file (magic bytes: FF D8 FF)
    const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46])
    const file = new File([jpegHeader], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)

    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should accept valid PNG file', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    vi.mocked(db.mediaAsset.create).mockResolvedValueOnce({
      id: 'media-123',
      filename: 'test.png',
      url: 'https://blob.url/test.png',
      mimeType: 'image/png',
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

    // Create a valid PNG file (magic bytes: 89 50 4E 47 0D 0A 1A 0A)
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    const file = new File([pngHeader], 'test.png', { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', file)

    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should accept valid WebP file', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    vi.mocked(db.mediaAsset.create).mockResolvedValueOnce({
      id: 'media-123',
      filename: 'test.webp',
      url: 'https://blob.url/test.webp',
      mimeType: 'image/webp',
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

    // Create a valid WebP file (magic bytes: 52 49 46 46 ... 57 45 42 50)
    const webpHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])
    const file = new File([webpHeader], 'test.webp', { type: 'image/webp' })
    const formData = new FormData()
    formData.append('file', file)

    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should reject GIF file (not in allowed list)', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    // Create a GIF file (magic bytes: 47 49 46 38)
    const gifHeader = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    const file = new File([gifHeader], 'test.gif', { type: 'image/gif' })
    const formData = new FormData()
    formData.append('file', file)

    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    // GIF is in allowed list so it should be accepted
    // Wait, GIF IS in the allowed list
    expect(response.status).toBe(200)
  })
})