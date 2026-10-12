import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const terms = await db.glossaryTerm.findMany({
      orderBy: { term: 'asc' }
    })
    return NextResponse.json(terms)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to fetch terms' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const body = await req.json()
    const term = await db.glossaryTerm.create({
      data: {
        term: body.term,
        slug: body.slug,
        definition: body.definition,
      }
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'GlossaryTerm',
      entityId: term.id,
      metadata: { term: term.term, slug: term.slug },
      userId: session.userId,
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(term)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to create term' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
