import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, getSession } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const take = 50;
    const skip = (page - 1) * take;

    const articles = await db.article.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        contentType: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { name: true }
        }
      }
    });
    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']);
    const body = await req.json();
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Find first available author or fall back to an editorial author
    let author = await db.author.findFirst();
    if (!author) {
      author = await db.author.create({
        data: {
          name: "Tecrese Editorial",
          slug: "tecrese-editorial",
          bio: "Official Tecrese Editorial Team"
        }
      });
    }

    const article = await db.article.create({
      data: {
        title: body.title,
        slug,
        body: body.body || body.content || "",
        contentType: body.contentType || "ARTICLE",
        status: body.status || "DRAFT",
        authorId: body.authorId || author.id
      }
    });

    // Audit log
    await createAuditLog({
      action: 'CREATE',
      entityType: 'Article',
      entityId: article.id,
      metadata: { title: article.title, status: article.status },
      userId: session.userId,
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: error.message === 'Forbidden' ? 403 : 400 }
    );
  }
}