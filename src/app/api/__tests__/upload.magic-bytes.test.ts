import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/admin/upload/route'
import { db } from '@/lib/db'

// Use vi.hoisted to define mocks before hoisting
const { mockFileTypeFromBuffer } = vi.hoisted(() => ({
  mockFileTypeFromBuffer: vi.fn(),
}))

vi.mock('file-type', () => ({
  fileTypeFromBuffer: mockFileTypeFromBuffer,
}))

// Helper to create a mock File with arrayBuffer method
function createMockFile(name: string, type: string, size = 1024, magicBytes?: Uint8Array) {
  const mockArrayBuffer = magicBytes 
    ? Promise.resolve(magicBytes.buffer.slice(magicBytes.byteOffset, magicBytes.byteOffset + magicBytes.byteLength) as ArrayBuffer)
    : Promise.resolve(new ArrayBuffer(size))
  
  return {
    name,
    type,
    size,
    arrayBuffer: vi.fn().mockReturnValue(mockArrayBuffer),
  } as unknown as File
}

// Helper to create a mock request with formData
function createMockRequest(file?: File) {
  const mockFormData = {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'file') return file
      return undefined
    }),
  }
  return {
    formData: vi.fn().mockResolvedValue(mockFormData),
  } as unknown as Request
}

describe('Upload API - File Type Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFileTypeFromBuffer.mockReset()
  })

  it('should reject file with invalid magic bytes (txt with jpg extension)', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    // Mock file-type to return null (invalid type)
    mockFileTypeFromBuffer.mockResolvedValueOnce(null)

    const file = createMockFile('test.jpg', 'image/jpeg')
    const request = createMockRequest(file)

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
      url: 'https://mock-blob.url/test.jpg',
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

    // Mock file-type to return valid JPEG
    mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: 'image/jpeg', ext: 'jpg' })

    // Create a valid JPEG file (magic bytes: FF D8 FF)
    const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46])
    const file = createMockFile('test.jpg', 'image/jpeg', jpegHeader.length, jpegHeader)
    const request = createMockRequest(file)

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
      url: 'https://mock-blob.url/test.png',
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

    // Mock file-type to return valid PNG
    mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: 'image/png', ext: 'png' })

    // Create a valid PNG file (magic bytes: 89 50 4E 47 0D 0A 1A 0A)
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    const file = createMockFile('test.png', 'image/png', pngHeader.length, pngHeader)
    const request = createMockRequest(file)

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
      url: 'https://mock-blob.url/test.webp',
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

    // Mock file-type to return valid WebP
    mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: 'image/webp', ext: 'webp' })

    // Create a valid WebP file (magic bytes: 52 49 46 46 ... 57 45 42 50)
    const webpHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])
    const file = createMockFile('test.webp', 'image/webp', webpHeader.length, webpHeader)
    const request = createMockRequest(file)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should accept GIF file (in allowed list)', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockResolvedValueOnce({
      userId: 'user-123',
      role: 'EDITOR',
      sessionId: 'session-123',
    })

    vi.mocked(db.mediaAsset.create).mockResolvedValueOnce({
      id: 'media-123',
      filename: 'test.gif',
      url: 'https://mock-blob.url/test.gif',
      mimeType: 'image/gif',
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

    // Mock file-type to return valid GIF
    mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: 'image/gif', ext: 'gif' })

    // Create a GIF file (magic bytes: 47 49 46 38)
    const gifHeader = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    const file = createMockFile('test.gif', 'image/gif', gifHeader.length, gifHeader)
    const request = createMockRequest(file)

    const response = await POST(request)
    const data = await response.json()

    // GIF is in allowed list so it should be accepted
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})