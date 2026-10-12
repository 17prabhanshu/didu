import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, rateLimiters, rateLimitHeaders } from '@/lib/rate-limiter';

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(req, rateLimiters.search);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many search requests. Please try again shortly." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type"); // optional filter: article, agent, tool, model
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "8", 10) || 8, 1), 25);

    if (!q || q.trim().length < 2) {
      return NextResponse.json([], {
        headers: rateLimitHeaders(rateLimit)
      });
    }

    const searchTerm = q.trim();

    const [articles, agents, tools, models] = await Promise.all([
      !type || type === 'article'
        ? db.article.findMany({
            where: {
              status: 'PUBLISHED',
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { body: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            take: 5,
            select: { id: true, title: true, slug: true, excerpt: true, contentType: true },
          })
        : Promise.resolve([]),
      !type || type === 'agent'
        ? db.agent.findMany({
            where: {
              status: 'PUBLISHED',
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            take: 3,
            select: { id: true, name: true, slug: true, description: true },
          })
        : Promise.resolve([]),
      !type || type === 'tool'
        ? db.tool.findMany({
            where: {
              status: 'PUBLISHED',
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            take: 3,
            select: { id: true, name: true, slug: true, description: true },
          })
        : Promise.resolve([]),
      !type || type === 'model'
        ? db.model.findMany({
            where: {
              status: 'ACTIVE',
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { provider: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            take: 3,
            select: { id: true, name: true, slug: true, provider: true },
          })
        : Promise.resolve([]),
    ]);

    const results = [
      ...(articles || []).map((a: any) => ({
        id: `article-${a.id}`,
        title: a.title,
        type: a.contentType?.toLowerCase() || 'article',
        url: `/${a.contentType?.toLowerCase() === 'news' ? 'news' : 'guides'}/${a.slug}`,
        description: (a.excerpt?.substring(0, 80) || '') + '...',
      })),
      ...(agents || []).map((a: any) => ({
        id: `agent-${a.id}`,
        title: a.name,
        type: 'agent',
        url: `/agents/${a.slug}`,
        description: (a.description?.substring(0, 80) || '') + '...',
      })),
      ...(tools || []).map((t: any) => ({
        id: `tool-${t.id}`,
        title: t.name,
        type: 'tool',
        url: `/tools/${t.slug}`,
        description: (t.description?.substring(0, 80) || '') + '...',
      })),
      ...(models || []).map((m: any) => ({
        id: `model-${m.id}`,
        title: m.name,
        type: 'model',
        url: `/models/${m.slug}`,
        description: `Model provided by ${m.provider || 'Unknown'}`,
      })),
    ];

    return NextResponse.json(results.slice(0, limit), {
      headers: rateLimitHeaders(rateLimit)
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal Search Error" }, { status: 500 });
  }
}