import { db } from './db'
import { getSession } from './session'

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'PUBLISH' 
  | 'UNPUBLISH' 
  | 'ARCHIVE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'PASSWORD_RESET' 
  | 'PASSWORD_CHANGE'
  | 'ROLE_CHANGE'
  | 'EXPORT'
  | 'IMPORT'

export interface AuditLogInput {
  action: AuditAction
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
  userId?: string
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    // If userId not provided, try to get from session
    let userId = input.userId
    if (!userId) {
      const session = await getSession()
      if (session) userId = session.userId
    }

    await db.auditLog.create({
      data: {
        userId: userId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: (input.metadata || {}) as any,
      },
    })
  } catch (error) {
    // Never throw - audit logging should not break the main operation
    console.error('Audit log creation failed:', error)
  }
}

export async function getAuditLogs(filters: {
  userId?: string
  entityType?: string
  entityId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
} = {}) {
  const where: Record<string, unknown> = {}
  
  if (filters.userId) where.userId = filters.userId
  if (filters.entityType) where.entityType = filters.entityType
  if (filters.entityId) where.entityId = filters.entityId
  if (filters.action) where.action = filters.action
  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) (where.createdAt as Record<string, Date>).gte = filters.startDate
    if (filters.endDate) (where.createdAt as Record<string, Date>).lte = filters.endDate
  }

  return db.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters.limit || 50,
    skip: filters.offset || 0,
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  })
}

export async function getAuditLogStats() {
  const [total, byAction, byEntityType, recent] = await Promise.all([
    db.auditLog.count(),
    db.auditLog.groupBy({ by: ['action'], _count: { action: true } }),
    db.auditLog.groupBy({ by: ['entityType'], _count: { entityType: true } }),
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    })
  ])

  return { total, byAction, byEntityType, recent }
}