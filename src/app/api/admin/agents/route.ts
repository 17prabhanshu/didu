import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const agents = await db.agent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return NextResponse.json(agents)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to fetch agents' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const body = await req.json()
    const agent = await db.agent.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        status: body.status || 'DRAFT',
      }
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'Agent',
      entityId: agent.id,
      metadata: { name: agent.name, status: agent.status },
      userId: session.userId,
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(agent)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to create agent' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
