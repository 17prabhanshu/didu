import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/search/route'
import { db } from '@/lib/db'

describe('Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array for query less than 2 characters', async () => {
    const request = new Request('http://localhost/api/search?q=a')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should return empty array for missing query', async () => {
    const request = new Request('http://localhost/api/search')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should search across multiple models', async () => {
    vi.mocked(db.article.findMany).mockResolvedValueOnce([
      { id: 'art-1', title: 'Test Article', slug: 'test-article', excerpt: 'Test excerpt', contentType: 'ARTICLE' }
    ])
    vi.mocked(db.agent.findMany).mockResolvedValueOnce([
      { id: 'agent-1', name: 'Test Agent', slug: 'test-agent', description: 'Test description' }
    ])
    vi.mocked(db.tool.findMany).mockResolvedValueOnce([])
    vi.mocked(db.model.findMany).mockResolvedValueOnce([])

    const request = new Request('http://localhost/api/search?q=test')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('title')
    expect(data[0]).toHaveProperty('type')
    expect(data[0]).toHaveProperty('url')
    expect(data[0]).toHaveProperty('description')
  })

  it('should limit results to 8', async () => {
    // Create 10 mock articles
    const articles = Array.from({ length: 10 }, (_, i) => ({
      id: `art-${i}`,
      title: `Test Article ${i}`,
      slug: `test-article-${i}`,
      excerpt: 'Test excerpt',
      contentType: 'ARTICLE',
    }))
    vi.mocked(db.article.findMany).mockResolvedValueOnce(articles)
    vi.mocked(db.agent.findMany).mockResolvedValueOnce([])
    vi.mocked(db.tool.findMany).mockResolvedValueOnce([])
    vi.mocked(db.model.findMany).mockResolvedValueOnce([])

    const request = new Request('http://localhost/api/search?q=test')
    const response = await GET(request)
    const data = await response.json()

    expect(data.length).toBeLessThanOrEqual(8)
  })
})