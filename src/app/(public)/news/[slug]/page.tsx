export const revalidate = 300;
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ArticleBody } from "@/components/article/article-body";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { ArticleJSONLD, BreadcrumbJSONLD } from "@/components/seo/JSONLD";
import { extractHeadings } from "@/lib/toc";
import { findToolForArticle } from "@/lib/related-tool";
import {
  ArticleNewsletter,
  AuthorBio,
  RelatedArticles,
  ShareLinks,
  TableOfContents,
  ToolSetupCard,
} from "@/components/article/article-extras";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tecrese.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';

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
      featuredImage: true,
    },
  });

  if (!article) return { title: 'Article Not Found' };

  const isGuide = article.contentType === 'GUIDE' || article.contentType === 'TUTORIAL';

  // Guides are canonical under /guides. Redirecting during metadata resolution
  // lets Next issue a real HTTP redirect before the article body streams.
  if (isGuide) {
    redirect(`/guides/${slug}`);
  }

  const canonical = `${SITE_URL}/news/${slug}`;

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || article.subtitle || undefined,
    alternates: { canonical },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || undefined,
      url: canonical,
      type: 'article',
      images: article.featuredImage ? [article.featuredImage] : undefined,
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

  // Guides have a canonical home under /guides. Redirect rather than render a
  // duplicate copy of the same article under /news.
  if (article.contentType === 'GUIDE' || article.contentType === 'TUTORIAL') {
    redirect(`/guides/${slug}`);
  }

  const related = await db.article.findMany({
    where: { status: 'PUBLISHED', slug: { not: slug } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: { author: true, category: true },
  });

  const publishedAt = article.publishedAt || article.createdAt;
  const updatedAt = article.updatedAt;
  const showUpdated = updatedAt.getTime() - publishedAt.getTime() > 24 * 60 * 60 * 1000;
  const articleUrl = `${SITE_URL}/news/${slug}`;
  const headings = extractHeadings(article.body);
  const relatedTool = findToolForArticle(
    article.title,
    article.subtitle,
    article.excerpt,
    article.body
  );
  const description = article.seoDescription || article.excerpt || article.subtitle || article.title;

  return (
    <article className="relative min-h-screen pb-24">
      <ArticleJSONLD
        type="NewsArticle"
        title={article.title}
        description={description}
        url={articleUrl}
        image={article.featuredImage || FALLBACK_IMAGE}
        datePublished={publishedAt.toISOString()}
        dateModified={updatedAt.toISOString()}
        author={{
          name: article.author?.name || 'Tecrese Editorial Team',
          url: article.author?.slug
            ? `${SITE_URL}/authors/${article.author.slug}`
            : `${SITE_URL}/authors`,
        }}
        category={article.category?.name}
        tags={article.keywords?.split(',').map((keyword) => keyword.trim()).filter(Boolean)}
        readingTime={article.readingTime ?? 5}
      />
      <BreadcrumbJSONLD
        items={[
          { name: 'Home', url: SITE_URL },
          { name: 'News', url: `${SITE_URL}/news` },
          { name: article.title, url: articleUrl },
        ]}
      />

      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute top-[20vh] left-0 w-[30vw] h-[30vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10 dark:bg-emerald-900/10" />

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border/30 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {article.category && (
              <Badge variant="secondary" className="px-3 py-1 font-mono">{article.category.name}</Badge>
            )}
            <Badge className="px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30">{article.contentType}</Badge>
            <span className="text-sm font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readingTime} min read
            </span>
            {showUpdated && (
              <span className="text-sm font-mono text-muted-foreground flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Updated {formatDate(updatedAt)}
              </span>
            )}
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              {article.subtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-full bg-primary/20 overflow-hidden ring-4 ring-background">
                {article.author?.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.author.avatar} alt={article.author.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <div className="font-bold text-lg">{article.author?.name || 'Tecrese Editorial Team'}</div>
                <div className="text-sm text-muted-foreground font-mono">
                  Published {formatDate(publishedAt)}
                  {showUpdated ? ` · Updated ${formatDate(updatedAt)}` : ''}
                </div>
              </div>
            </div>
            <ShareLinks url={articleUrl} title={article.title} />
          </div>
        </div>
      </header>

      {/* Featured Image or Editorial Art */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 mb-16">
        <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/30 bg-muted">
          {article.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={FALLBACK_IMAGE} alt="Editorial illustration" className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      {/* Article Body */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div className="order-2 min-w-0 lg:order-1">
            <ArticleBody body={article.body} />

            {relatedTool ? <ToolSetupCard tool={relatedTool} /> : null}

            {/* E-E-A-T Editorial Trust Signal */}
            <div className="mt-16 bg-muted/30 border border-border rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Editorial standards applied</h4>
                  <p className="text-sm text-muted-foreground">
                    This content was independently reviewed by the Tecrese Intelligence Team.{' '}
                    <Link href="/about/editorial-policy" className="font-semibold text-primary hover:underline">
                      Read our editorial policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            <AuthorBio author={article.author} />
            <ArticleNewsletter />
            <RelatedArticles articles={related} href="/news" label="All news" />
          </div>

          <aside className="order-1 lg:order-2 lg:self-start">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </div>
    </article>
  );
}
