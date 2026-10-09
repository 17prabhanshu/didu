import { z } from 'zod'

// Auth
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

// Article
export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  subtitle: z.string().max(200).optional(),
  excerpt: z.string().max(300).optional(),
  body: z.string().min(1, 'Body content is required'),
  contentType: z.enum(['ARTICLE', 'NEWS', 'GUIDE', 'TUTORIAL', 'REVIEW', 'COMPARISON', 'EXPLAINER', 'RESEARCH', 'SECURITY_ALERT']),
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'REJECTED', 'ARCHIVED']),
  categoryId: z.string().optional(),
  authorId: z.string().min(1, 'Author ID is required'),
  featuredImage: z.string().url().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional(),
  ogImage: z.string().url().optional(),
})

// Agent
export const agentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required'),
  avatar: z.string().url().optional(),
  capabilities: z.array(z.string()),
  framework: z.string(),
  homepage: z.string().url().optional(),
  github: z.string().url().optional(),
})

// Tool
export const toolSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  homepage: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
})

// Model
export const modelSchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.string().min(1),
  parameters: z.number().optional(),
  contextWindow: z.number().optional(),
  description: z.string().optional(),
})

// Security Alert
export const securityAlertSchema = z.object({
  title: z.string().min(1).max(200),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(1),
  affectedSystems: z.array(z.string()),
  remediation: z.string().optional(),
})

// Glossary Term
export const glossaryTermSchema = z.object({
  term: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  definition: z.string().min(1),
  relatedTerms: z.array(z.string()).optional(),
})

// Category
export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional(),
})

// Tag
export const tagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

// Contributor Profile
export const contributorProfileSchema = z.object({
  userId: z.string().min(1),
  bio: z.string().max(500).optional(),
  twitter: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
})

// Redirect
export const redirectSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  permanent: z.boolean().default(true),
})

// Newsletter
export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  // Age is required for signup and must be a plausible human age (13–120).
  // z.coerce handles the string value coming from FormData / query input.
  age: z.coerce
    .number({ error: 'Age is required' })
    .int('Age must be a whole number')
    .min(13, 'You must be at least 13 years old to subscribe')
    .max(120, 'Please enter a valid age'),
})

// Media
export const mediaSchema = z.object({
  url: z.string().url(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
  altText: z.string().optional(),
})

// Search
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.record(z.string(), z.any()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})
