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
function createMockFile(name: string, type: string, size = 1024) {
  return {
    name,
    type,
    size,
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(size)),
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

describe('Upload API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFileTypeFromBuffer.mockReset()
  })

  it('should return 403 for unauthenticated user', async () => {
    vi.spyOn(await import('@/lib/session'), 'requireRole').mockRejectedValueOnce(new Error('Forbidden'))

    const request = createMockRequest()

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

    const request = createMockRequest(undefined)

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

    // Mock file-type to return null (invalid type)
    mockFileTypeFromBuffer.mockResolvedValueOnce(null)

    const file = createMockFile('test.txt', 'text/plain')
    const request = createMockRequest(file)

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

    // Mock file-type to return valid JPEG
    mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: 'image/jpeg', ext: 'jpg' })

    // Mock BLOB_READ_WRITE_TOKEN to use Vercel Blob
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-token')

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

    const file = createMockFile('test.jpg', 'image/jpeg')
    const request = createMockRequest(file)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.url).toBe('https://mock-blob.url/test.jpg')
    expect(data.asset).toBeDefined()
  })
})