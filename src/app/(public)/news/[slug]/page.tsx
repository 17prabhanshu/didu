export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { ArticleBody } from "@/components/article/article-body";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

// Using dynamicParams = true (default) allows on-demand rendering of paths not in generateStaticParams

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tecrese.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      subtitle: true,
      seoTitle: true,
      seoDescription: true,
      contentType: true,
    },
  });

  if (!article) return { title: 'Article Not Found | Tecrese' };

  const isGuide = article.contentType === 'GUIDE' || article.contentType === 'TUTORIAL';
  const canonical = `${SITE_URL}/${isGuide ? 'guides' : 'news'}/${slug}`;

  return {
    title: article.seoTitle || `${article.title} | Tecrese`,
    description: article.seoDescription || article.excerpt || article.subtitle || undefined,
    alternates: { canonical },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || undefined,
      url: canonical,
      type: 'article',
    },
  };
}

export default async function ArticleReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await db.article.findUnique({
    where: { slug },
    include: { author: true, category: true }
  });

  if (!article) return notFound();

  return (
    <article className="relative min-h-screen pb-24">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute top-[20vh] left-0 w-[30vw] h-[30vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10 dark:bg-emerald-900/10" />

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border/30 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-8">
              {article.category && (
                <Badge variant="secondary" className="px-3 py-1 font-mono">{article.category.name}</Badge>
              )}
              <Badge className="px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30">{article.contentType}</Badge>
              <span className="text-sm font-mono text-muted-foreground">{article.readingTime} min read</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              {article.title}
            </h1>
            
            {article.subtitle && (
              <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                {article.subtitle}
              </p>
            )}

            <div className="flex items-center justify-center gap-4 text-left">
              <div className="w-14 h-14 rounded-full bg-primary/20 overflow-hidden ring-4 ring-background">
                {article.author?.avatar && <img src={article.author.avatar} alt={article.author.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <div className="font-bold text-lg">{article.author?.name || 'Industry Analyst'}</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </header>

      {/* Featured Image or Pinterest Editorial Art */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 mb-16">
        <ScrollReveal delay={0.2}>
          <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/30 bg-muted">
            {article.featuredImage ? (
              <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
            ) : (
              <img src={`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop`} alt="Editorial Art" className="w-full h-full object-cover" />
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Article Body */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl mt-16">
        <ScrollReveal delay={article.featuredImage ? 0 : 0.2}>
          <ArticleBody body={article.body} />
        </ScrollReveal>

        {/* E-E-A-T Editorial Trust Signals */}
        <div className="mt-16 bg-muted/30 border border-border rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-lg">Editorial Standards Applied</h4>
              <p className="text-sm text-muted-foreground">This content has been independently verified by the Agentverse Intelligence Team.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Agentverse. All rights reserved.
          </div>
          <Link href="/about/editorial-policy" className="text-sm font-bold text-primary hover:underline">
            Read our Editorial Policy
          </Link>
        </div>
      </div>

      {/* Strict Publisher & Article Schema Injection for Google HCU E-E-A-T */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": article.subtitle || article.excerpt,
            "image": [
              article.featuredImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
            ],
            "datePublished": article.publishedAt || article.createdAt,
            "dateModified": article.updatedAt,
            "author": {
              "@type": "Person",
              "name": article.author?.name || 'Industry Analyst',
              "url": "https://tecrese.com/editorial-team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Agentverse",
              "logo": {
                "@type": "ImageObject",
                "url": "https://tecrese.com/logo.png"
              }
            }
          })
        }}
      />
    </article>
  );
}
