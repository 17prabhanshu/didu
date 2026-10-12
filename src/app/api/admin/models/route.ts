import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const models = await db.model.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return NextResponse.json(models)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to fetch models' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const body = await req.json()
    const model = await db.model.create({
      data: {
        name: body.name,
        slug: body.slug,
        provider: body.provider,
        status: body.status || 'DRAFT',
      }
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'Model',
      entityId: model.id,
      metadata: { name: model.name, provider: model.provider, status: model.status },
      userId: session.userId,
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(model)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to create model' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
