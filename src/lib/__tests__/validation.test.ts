import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  changePasswordSchema,
  articleSchema,
  agentSchema,
  toolSchema,
  modelSchema,
  securityAlertSchema,
  glossaryTermSchema,
  categorySchema,
  tagSchema,
  contributorProfileSchema,
  redirectSchema,
  newsletterSchema,
  mediaSchema,
  searchSchema,
} from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct email and password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('changePasswordSchema', () => {
    it('should validate strong password', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject weak password (no uppercase)', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'newpass123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject weak password (no lowercase)', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'NEWPASS123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject weak password (no number)', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass',
      })
      expect(result.success).toBe(false)
    })

    it('should reject password shorter than 8 characters', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'Pass1',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('articleSchema', () => {
    const validArticle = {
      title: 'Test Article',
      slug: 'test-article',
      body: 'Article body content',
      contentType: 'ARTICLE' as const,
      status: 'DRAFT' as const,
      authorId: 'author-123',
    }

    it('should validate correct article', () => {
      const result = articleSchema.safeParse(validArticle)
      expect(result.success).toBe(true)
    })

    it('should reject missing title', () => {
      const result = articleSchema.safeParse({ ...validArticle, title: '' })
      expect(result.success).toBe(false)
    })

    it('should reject invalid slug format', () => {
      const result = articleSchema.safeParse({ ...validArticle, slug: 'Invalid Slug' })
      expect(result.success).toBe(false)
    })

    it('should reject invalid contentType', () => {
      const result = articleSchema.safeParse({ ...validArticle, contentType: 'INVALID' })
      expect(result.success).toBe(false)
    })
  })

  describe('agentSchema', () => {
    const validAgent = {
      name: 'Test Agent',
      description: 'A test agent',
      capabilities: ['capability1', 'capability2'],
      framework: 'LangChain',
    }

    it('should validate correct agent', () => {
      const result = agentSchema.safeParse(validAgent)
      expect(result.success).toBe(true)
    })

    it('should reject missing name', () => {
      const result = agentSchema.safeParse({ ...validAgent, name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('toolSchema', () => {
    it('should validate correct tool', () => {
      const result = toolSchema.safeParse({
        name: 'Test Tool',
        description: 'A test tool',
        homepage: 'https://example.com',
        apiEndpoint: 'https://api.example.com',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL', () => {
      const result = toolSchema.safeParse({
        name: 'Test Tool',
        description: 'A test tool',
        homepage: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('newsletterSchema', () => {
    it('should validate correct email and age', () => {
      const result = newsletterSchema.safeParse({
        email: 'test@example.com',
        age: 25,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = newsletterSchema.safeParse({
        email: 'invalid-email',
        age: 25,
      })
      expect(result.success).toBe(false)
    })

    it('should reject age below 13', () => {
      const result = newsletterSchema.safeParse({
        email: 'test@example.com',
        age: 10,
      })
      expect(result.success).toBe(false)
    })

    it('should reject age above 120', () => {
      const result = newsletterSchema.safeParse({
        email: 'test@example.com',
        age: 150,
      })
      expect(result.success).toBe(false)
    })

    it('should accept age as string (coerce)', () => {
      const result = newsletterSchema.safeParse({
        email: 'test@example.com',
        age: '25',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.age).toBe(25)
      }
    })
  })

  describe('searchSchema', () => {
    it('should validate correct search params', () => {
      const result = searchSchema.safeParse({
        query: 'test query',
        page: 1,
        limit: 20,
      })
      expect(result.success).toBe(true)
    })

    it('should use defaults for page and limit', () => {
      const result = searchSchema.safeParse({
        query: 'test',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
      }
    })

    it('should reject query too short', () => {
      const result = searchSchema.safeParse({
        query: 'a',
      })
      expect(result.success).toBe(false)
    })

    it('should reject query too long', () => {
      const result = searchSchema.safeParse({
        query: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('should reject limit over 100', () => {
      const result = searchSchema.safeParse({
        query: 'test',
        limit: 150,
      })
      expect(result.success).toBe(false)
    })
  })
})