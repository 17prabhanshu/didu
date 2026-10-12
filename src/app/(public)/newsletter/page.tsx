export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Link from "next/link";
import { Mail, CheckCircle2, Sparkles, Shield, ArrowRight, BookOpen } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: 'Newsletter & Intelligence Briefings | Tecrese',
  description: 'Weekly intelligence briefing on autonomous AI agents, developer tooling, and foundational models.',
};

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string }>;
}) {
  const { subscribed } = await searchParams;

  const recentBriefings = await db.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: { category: true, author: true },
  }).catch(() => []);

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/20 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-20 px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Subscribed Success Banner */}
        {subscribed === 'true' && (
          <div className="mb-12 p-6 rounded-3xl bg-green-500/10 border border-green-500/30 text-foreground flex items-start gap-4 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="w-10 h-10 rounded-2xl bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-green-700 dark:text-green-400">Subscription Confirmed!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You&apos;re officially on the Tecrese intelligence list. We have sent a confirmation email to your inbox. Check out our recent briefings below in the meantime!
              </p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Weekly Intelligence Dispatch
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            The Agentic Internet, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              Filtered & Analyzed
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
            Join thousands of developers, researchers, and tech founders getting our weekly signal on autonomous agents, execution benchmarks, and model shifts.
          </p>

          {/* Form */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/70 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto">
            <h3 className="text-base font-bold mb-2">Subscribe to the Briefing</h3>
            <p className="text-xs text-muted-foreground mb-6">Zero spam. Sent every Tuesday. Unsubscribe anytime.</p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-card/50 backdrop-blur-sm border border-border/60 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2">Autonomous Agent Loops</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In-depth reviews on cognitive architectures, planning frameworks, and real-world multi-agent orchestration.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/60 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2">Security & Sandboxing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Prompt injection vulnerability disclosures, data-exfiltration audits, and MCP server sandbox guidelines.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/60 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2">Curated Directory Updates</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Early access to our latest indexed tools, benchmarks, and production-tested open-source repositories.
            </p>
          </div>
        </div>

        {/* Briefings Archive */}
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
            <div>
              <h2 className="font-heading text-3xl font-bold">Recent Briefings & Analysis</h2>
              <p className="text-sm text-muted-foreground mt-1">Read past editorial dispatches and deep dives</p>
            </div>
            <Link href="/news" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View all editorial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentBriefings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentBriefings.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group bg-card/60 hover:bg-card border border-border/60 hover:border-primary/50 p-6 rounded-3xl transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 font-mono">
                      <span>{article.category?.name || article.contentType}</span>
                      <span>{article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}</span>
                    </div>
                    <h3 className="font-heading text-xl font-bold group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.excerpt || article.subtitle || "Read the full intelligence analysis."}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Read briefing &rarr;</span>
                    <span className="text-muted-foreground font-normal">{article.readingTime || 4} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-border rounded-3xl text-muted-foreground">
              No archived briefings found yet. Check back next Tuesday!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
