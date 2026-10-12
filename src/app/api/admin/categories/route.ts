import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/session'

export async function GET(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to fetch categories' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR'])
    const body = await req.json()
    const category = await db.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
      }
    })
    return NextResponse.json(category)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to create category' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
