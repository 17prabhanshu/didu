import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const FALLBACK_ENTITIES = [
  { term: "Devin", url: "/agents/devin", type: "agent" },
  { term: "LangChain", url: "/tools/langchain", type: "tool" },
  { term: "Claude 3.5 Sonnet", url: "/models/claude-3-5-sonnet", type: "model" },
  { term: "AutoGPT", url: "/agents/autogpt", type: "agent" },
  { term: "Llama 3", url: "/models/llama-3", type: "model" },
];

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']); // SECURITY PATCH: Enforce RBAC
    const p = await params;
    const article = await db.article.findUnique({ where: { id: p.id } });
    
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    // Dynamically load published ecosystem entities from the database
    const entityMap = new Map<string, { term: string; url: string; type: string }>();
    for (const item of FALLBACK_ENTITIES) {
      entityMap.set(item.term.toLowerCase(), item);
    }

    try {
      const [agents, tools, models, glossary] = await Promise.all([
        db.agent.findMany({ where: { status: 'PUBLISHED' }, select: { name: true, slug: true }, take: 200 }),
        db.tool.findMany({ where: { status: 'PUBLISHED' }, select: { name: true, slug: true }, take: 200 }),
        db.model.findMany({ where: { status: 'PUBLISHED' }, select: { name: true, slug: true }, take: 200 }),
        db.glossaryTerm.findMany({ select: { term: true, slug: true }, take: 200 }),
      ]);

      for (const a of agents) {
        if (a.name?.length >= 3) entityMap.set(a.name.toLowerCase(), { term: a.name, url: `/agents/${a.slug}`, type: 'agent' });
      }
      for (const t of tools) {
        if (t.name?.length >= 3) entityMap.set(t.name.toLowerCase(), { term: t.name, url: `/tools/${t.slug}`, type: 'tool' });
      }
      for (const m of models) {
        if (m.name?.length >= 3) entityMap.set(m.name.toLowerCase(), { term: m.name, url: `/models/${m.slug}`, type: 'model' });
      }
      for (const g of glossary) {
        if (g.term?.length >= 3) entityMap.set(g.term.toLowerCase(), { term: g.term, url: `/glossary/${g.slug}`, type: 'glossary' });
      }
    } catch {
      // Fallback to static entities if DB tables are unavailable
    }

    // Sort longest terms first so specific multi-word names match before shorter substrings
    const entities = Array.from(entityMap.values()).sort((a, b) => b.term.length - a.term.length);

    let modifiedBody = article.body;
    let modifiedCount = 0;

    // Replace first unlinked occurrence of each known entity outside existing <a> tags
    for (const entity of entities) {
      const escapedTerm = escapeRegExp(entity.term);
      const regex = new RegExp(`(?<!href=["'])(?<!>)\\b(${escapedTerm})\\b(?![^<]*>|[^<>]*<\\/a>)`, 'gi');
      
      let replacedForEntity = false;
      const beforeStr = modifiedBody;
      modifiedBody = modifiedBody.replace(regex, (match) => {
        if (replacedForEntity) return match;
        replacedForEntity = true;
        return `<a href="${entity.url}" class="${entity.type}-link interactive font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all">${match}</a>`;
      });

      if (beforeStr !== modifiedBody) {
        modifiedCount++;
      }
    }

    if (modifiedCount > 0) {
      await db.article.update({
        where: { id: p.id },
        data: { body: modifiedBody }
      });
    }

    return NextResponse.json({ success: true, modifiedCount, totalEntitiesScanned: entities.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
