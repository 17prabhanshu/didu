import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const tools = await db.tool.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return NextResponse.json(tools)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to fetch tools' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const body = await req.json()
    const tool = await db.tool.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        status: body.status || 'DRAFT',
      }
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'Tool',
      entityId: tool.id,
      metadata: { name: tool.name, status: tool.status },
      userId: session.userId,
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(tool)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to create tool' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
