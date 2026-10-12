import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/session'

export async function GET(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR'])
    const redirects = await db.redirect.findMany({
      orderBy: { source: 'asc' }
    })
    return NextResponse.json(redirects)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to fetch redirects' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR'])
    const body = await req.json()
    const redirect = await db.redirect.create({
      data: {
        source: body.source,
        destination: body.destination,
        statusCode: body.statusCode ?? 301,
      }
    })
    return NextResponse.json(redirect)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to create redirect' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
