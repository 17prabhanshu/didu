export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await db.article.findUnique({ where: { slug } });
  if (!guide) return { title: 'Guide Not Found | Tecrese' };

  return {
    title: `${guide.title} - Step-by-Step AI Guide | Tecrese`,
    description: guide.excerpt || guide.subtitle || `Comprehensive step-by-step tutorial: ${guide.title}`,
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const guide = await db.article.findUnique({
    where: { slug },
    include: { author: true, category: true },
  });

  if (!guide) return notFound();

  return (
    <article className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      {/* Header Banner */}
      <header className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8 bg-card/60 backdrop-blur-md px-4 py-2 rounded-full border border-border"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Guides
          </Link>

          <div className="flex items-center gap-3 mb-6">
            {guide.category && (
              <Badge variant="secondary" className="px-3 py-1 font-mono text-xs">{guide.category.name}</Badge>
            )}
            <Badge className="px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30 text-xs">
              {guide.contentType || "GUIDE"}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {guide.readingTime || 5} min read
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            {guide.title}
          </h1>

          {guide.subtitle && (
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              {guide.subtitle}
            </p>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-border/40">
            <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden ring-2 ring-primary/20 flex items-center justify-center">
              {guide.author?.avatar ? (
                <img src={guide.author.avatar} alt={guide.author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary">{guide.author?.name?.charAt(0) || "T"}</span>
              )}
            </div>
            <div>
              <div className="font-bold text-sm">{guide.author?.name || "Tecrese Intelligence Team"}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {guide.publishedAt ? formatDate(guide.publishedAt) : formatDate(guide.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Guide Content Body */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl mt-12">
        <ScrollReveal>
          <div className="prose prose-lg dark:prose-invert prose-headings:font-heading prose-headings:font-bold prose-a:text-primary hover:prose-a:text-accent prose-img:rounded-3xl max-w-none">
            {guide.body.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('# ')) return <h1 key={i} className="text-3xl font-heading mt-10 mb-5">{paragraph.replace('# ', '')}</h1>;
              if (paragraph.startsWith('## ')) return <h2 key={i} className="text-2xl font-heading mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
              if (paragraph.startsWith('### ')) return <h3 key={i} className="text-xl font-heading mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={i} className="list-disc pl-6 mb-6 space-y-1">
                    {paragraph.split('\n').map((item, j) => <li key={j}>{item.replace('- ', '')}</li>)}
                  </ul>
                );
              }
              return <p key={i} className="mb-6 text-foreground/85 leading-relaxed">{paragraph}</p>;
            })}
          </div>

          <div className="mt-16 p-8 bg-muted/30 border border-border rounded-3xl flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
            <div>
              <h4 className="font-heading font-bold text-base">Verified Practical Workflow</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                This guide has been tested and verified against the latest framework and model APIs.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </article>
  );
}
