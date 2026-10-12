import { NextResponse } from 'next/server'
import { getSession } from './session'
import { createAuditLog, AuditAction } from './audit'

export interface AuditContext {
  action: AuditAction
  entityType: string
  entityId?: string
  getEntityId?: (data: any) => string
  metadata?: Record<string, unknown>
}

export function withAudit<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  auditContext: AuditContext
): T {
  return (async (...args: any[]) => {
    const session = await getSession()
    const userId = session?.userId

    // Call the original handler
    const response = await handler(...args)

    // Only audit successful mutations
    if (response.ok || response.status === 201) {
      try {
        let entityId = auditContext.entityId
        let metadata = auditContext.metadata || {}

        // If handler returns entity data, extract ID
        if (!entityId && auditContext.getEntityId) {
          const responseClone = response.clone()
          const data = await responseClone.json().catch(() => null)
          if (data?.data?.id) {
            entityId = data.data.id
          } else if (data?.id) {
            entityId = data.id
          }
        }

        // Add response metadata
        if (response.status === 201) {
          metadata = { ...metadata, created: true }
        }

        if (entityId) {
          await createAuditLog({
            action: auditContext.action,
            entityType: auditContext.entityType,
            entityId,
            metadata,
            userId,
          })
        }
      } catch (auditError) {
        // Never let audit logging break the response
        console.error('Audit logging failed:', auditError)
      }
    }

    return response
  }) as T
}

// Convenience wrappers for common operations
export const auditCreate = (entityType: string, getEntityId?: (data: any) => string) =>
  withAudit as any // Type assertion for flexibility

export const auditUpdate = (entityType: string, entityIdParam: string = 'id') =>
  withAudit as any

export const auditDelete = (entityType: string, entityIdParam: string = 'id') =>
  withAudit as any