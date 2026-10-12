import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/session'

export async function GET(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])
    const alerts = await db.securityAlert.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(alerts)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to fetch alerts' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR'])
    const body = await req.json()
    const alert = await db.securityAlert.create({
      data: {
        title: body.title,
        slug: body.slug,
        severity: body.severity,
        summary: body.summary,
        status: body.status || 'ACTIVE',
      }
    })
    return NextResponse.json(alert)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message === 'Forbidden' ? 'Forbidden' : 'Failed to create alert' },
      { status: error?.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
