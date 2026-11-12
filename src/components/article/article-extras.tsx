import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/cards/article-card";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import type { TocHeading } from "@/lib/toc";
import type { AITool } from "@/lib/ai-launchpad";

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-2xl border border-border/60 bg-card/40 p-5 lg:sticky lg:top-24"
    >
      <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : undefined}>
            <a
              href={`#${heading.id}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface AuthorBioProps {
  author?: {
    name: string;
    slug: string;
    bio?: string | null;
    avatar?: string | null;
    expertise?: string | null;
  } | null;
}

export function AuthorBio({ author }: AuthorBioProps) {
  if (!author) return null;

  return (
    <section className="mt-16 rounded-3xl border border-border/60 bg-card/40 p-6 sm:p-8">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Written by
      </p>
      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-2 ring-primary/20">
          {author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-heading text-xl font-bold text-primary">
              {author.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <Link
            href={`/authors/${author.slug}`}
            className="font-heading text-xl font-bold transition-colors hover:text-primary"
          >
            {author.name}
          </Link>
          {author.expertise ? (
            <p className="mt-0.5 text-xs font-medium text-primary">{author.expertise}</p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {author.bio ||
              "Researching AI agents, developer tooling, and the infrastructure behind the agentic web."}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const xUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Share
      </span>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
        </svg>
      </a>
    </div>
  );
}

export function ToolSetupCard({ tool }: { tool: AITool }) {
  return (
    <aside className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Hands-on setup
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold">Install {tool.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tool.tagline} · {tool.pricing}
          </p>
        </div>
        <Link
          href={`/launchpad/${tool.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90"
        >
          Setup guide <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}

export function ArticleNewsletter() {
  return (
    <section className="mt-12 overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
        Weekly briefing
      </p>
      <h2 className="mt-2 font-heading text-2xl font-black tracking-tight">
        Get the next guide in your inbox
      </h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        One practical AI workflow every week. No spam, unsubscribe anytime.
      </p>
      <div className="mt-4 max-w-md">
        <NewsletterForm variant="footer" />
      </div>
    </section>
  );
}

interface RelatedArticlesProps {
  articles: any[];
  href?: string;
  label?: string;
}

export function RelatedArticles({
  articles,
  href = "/guides",
  label = "All guides",
}: RelatedArticlesProps) {
  if (!articles.length) return null;

  return (
    <section className="mt-16 border-t border-border/50 pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-heading text-2xl font-black tracking-tight">Keep reading</h2>
        <Link href={href} className="text-sm font-bold text-primary hover:underline">
          {label} &rarr;
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id || article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
