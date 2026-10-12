export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Link from "next/link";
import { Search, Bot, Wrench, Cpu, FileText, ArrowRight, Filter, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: 'Search Directory & Intelligence | Tecrese',
  description: 'Search autonomous AI agents, developer tools, foundational models, and editorial articles.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type = "all" } = await searchParams;
  const searchTerm = q.trim();

  let results: {
    id: string;
    title: string;
    type: 'agent' | 'tool' | 'model' | 'news' | 'guide';
    url: string;
    description: string;
    badge?: string;
  }[] = [];

  if (searchTerm.length >= 2) {
    try {
      const [agents, tools, models, articles] = await Promise.all([
        db.agent.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }).catch(() => []),
        db.tool.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }).catch(() => []),
        db.model.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { provider: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }).catch(() => []),
        db.article.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { excerpt: { contains: searchTerm, mode: 'insensitive' } },
              { body: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }).catch(() => []),
      ]);

      agents.forEach((a: any) => {
        results.push({
          id: `agent-${a.id}`,
          title: a.name,
          type: 'agent',
          url: `/agents/${a.slug}`,
          description: a.description || 'Autonomous agent profile and benchmarks.',
          badge: 'Agent',
        });
      });

      tools.forEach((t: any) => {
        results.push({
          id: `tool-${t.id}`,
          title: t.name,
          type: 'tool',
          url: `/tools/${t.slug}`,
          description: t.description || 'Developer tool specs and integration details.',
          badge: 'Tool',
        });
      });

      models.forEach((m: any) => {
        results.push({
          id: `model-${m.id}`,
          title: m.name,
          type: 'model',
          url: `/models/${m.slug}`,
          description: `${m.provider} foundation model.`,
          badge: 'Model',
        });
      });

      articles.forEach((art: any) => {
        const isGuide = art.contentType === 'GUIDE' || art.contentType === 'TUTORIAL';
        results.push({
          id: `art-${art.id}`,
          title: art.title,
          type: isGuide ? 'guide' : 'news',
          url: isGuide ? `/guides/${art.slug}` : `/news/${art.slug}`,
          description: art.excerpt || art.subtitle || 'Editorial intelligence and analysis.',
          badge: art.contentType || 'Article',
        });
      });
    } catch (e) {
      console.error("Search query error:", e);
    }
  }

  // Filter by category if selected
  const filteredResults = type === "all" ? results : results.filter((r) => r.type === type);

  const counts = {
    all: results.length,
    agent: results.filter((r) => r.type === "agent").length,
    tool: results.filter((r) => r.type === "tool").length,
    model: results.filter((r) => r.type === "model").length,
    news: results.filter((r) => r.type === "news").length,
    guide: results.filter((r) => r.type === "guide").length,
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-20 px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight mb-4">
            Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Tecrese</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Search across autonomous agents, execution tools, foundation models, and briefings.
          </p>
        </div>

        {/* Search Bar Form */}
        <form method="GET" action="/search" className="max-w-2xl mx-auto mb-10">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-muted-foreground absolute left-5 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search agents, tools, news, frameworks (e.g. LangChain, Claude)..."
              className="w-full pl-14 pr-28 py-4 bg-card border border-border/80 rounded-full text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-lg transition-all"
            />
            {type !== "all" && <input type="hidden" name="type" value={type} />}
            <button
              type="submit"
              className="absolute right-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-full hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Pills */}
        {searchTerm && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { label: "All Results", val: "all", count: counts.all },
              { label: "Agents", val: "agent", count: counts.agent },
              { label: "Tools", val: "tool", count: counts.tool },
              { label: "Models", val: "model", count: counts.model },
              { label: "News", val: "news", count: counts.news },
              { label: "Guides", val: "guide", count: counts.guide },
            ].map((f) => (
              <Link
                key={f.val}
                href={`/search?q=${encodeURIComponent(searchTerm)}&type=${f.val}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  type === f.val
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{f.label}</span>
                <span className="opacity-70 text-[10px]">({f.count})</span>
              </Link>
            ))}
          </div>
        )}

        {/* Results List */}
        {searchTerm ? (
          filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="group block bg-card/70 hover:bg-card border border-border/70 hover:border-primary/50 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px] font-mono uppercase bg-primary/5 border-primary/20 text-primary">
                          {item.badge}
                        </Badge>
                      </div>
                      <h3 className="font-heading text-xl font-bold group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform shrink-0 mt-2" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center border border-dashed border-border rounded-3xl text-muted-foreground max-w-xl mx-auto">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 className="font-heading text-xl font-bold mb-1">No matching results found</h3>
              <p className="text-sm">
                No items matched &ldquo;{searchTerm}&rdquo;. Try checking for typos or searching for a broader keyword.
              </p>
            </div>
          )
        ) : (
          <div className="p-16 text-center border border-dashed border-border rounded-3xl text-muted-foreground max-w-xl mx-auto">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30 text-primary" />
            <h3 className="font-heading text-lg font-bold mb-1">Explore the Intelligence Layer</h3>
            <p className="text-xs max-w-md mx-auto">
              Type keywords above to discover autonomous agents, tools, models, benchmarks, and research briefings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
