export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { ArticleCard } from "@/components/cards/article-card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await db.author.findUnique({ where: { slug } });
  if (!author) return { title: 'Author Not Found | Tecrese' };

  return {
    title: `${author.name} - Profile & Articles | Tecrese`,
    description: author.bio || `Explore articles and research published by ${author.name} on Tecrese.`,
  };
}

export default async function AuthorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const author = await db.author.findUnique({
    where: { slug },
    include: {
      articlesAuthored: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, author: true },
      },
    },
  });

  if (!author) return notFound();

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-20 px-4 sm:px-6 lg:px-8 max-w-5xl">
        <ScrollReveal>
          <Link
            href="/authors"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-10 bg-card/60 backdrop-blur-md px-4 py-2 rounded-full border border-border"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Authors
          </Link>

          {/* Author Header Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border p-8 md:p-12 rounded-[2.5rem] shadow-xl mb-16 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 rounded-3xl bg-muted border border-border/70 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-black text-5xl text-primary">
                  {author.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight">{author.name}</h1>
                {author.expertise && (
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider mt-2">
                    {author.expertise}
                  </span>
                )}
              </div>

              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                {author.bio || "Staff contributor and researcher evaluating AI agent architectures and ecosystem trends."}
              </p>

              <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {author.articlesAuthored.length} Published Articles
                </span>
              </div>
            </div>
          </div>

          {/* Articles Section */}
          <div>
            <h2 className="font-heading text-3xl font-bold mb-8 pb-3 border-b border-border/50">
              Articles by {author.name}
            </h2>

            {author.articlesAuthored.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {author.articlesAuthored.map((article: any) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
                No published articles found for this author yet.
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
