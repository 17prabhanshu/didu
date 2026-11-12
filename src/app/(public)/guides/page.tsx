export const revalidate = 300;
import { db } from "@/lib/db";
import { TiltCard } from "@/components/animations/tilt-card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata = { title: 'Guides & Tutorials' };

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
];

const FALLBACK_GUIDES = [
  {
    title: "Building Your First AI Agent with LangChain",
    description:
      "A hands-on tutorial covering setup, tool creation, agent configuration, and testing with LangChain.",
    slug: "building-first-ai-agent-langchain",
    featuredImage: null,
    readingTime: 12,
    category: null,
  },
  {
    title: "What Is Agentic AI? A Complete Guide",
    description:
      "Everything you need to know about agentic AI, from the observe-think-act loop to real-world applications.",
    slug: "what-is-agentic-ai-complete-guide",
    featuredImage: null,
    readingTime: 10,
    category: null,
  },
  {
    title: "How to Evaluate AI Agent Performance",
    description:
      "Metrics, benchmarks, and practical strategies for measuring task completion, tool use, safety, and cost.",
    slug: "how-to-evaluate-ai-agent-performance",
    featuredImage: null,
    readingTime: 6,
    category: null,
  },
];

export default async function GuidesPage() {
  let guides: Array<{
    title: string;
    description: string | null;
    slug: string;
    featuredImage: string | null;
    readingTime: number | null;
    category: { name: string } | null;
  }> = [];

  try {
    guides = await db.article.findMany({
      where: {
        status: 'PUBLISHED',
        contentType: { in: ['GUIDE', 'TUTORIAL'] },
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        title: true,
        excerpt: true,
        slug: true,
        featuredImage: true,
        readingTime: true,
        category: { select: { name: true } },
      },
    }).then((articles) =>
      articles.map((article) => ({
        title: article.title,
        description: article.excerpt,
        slug: article.slug,
        featuredImage: article.featuredImage,
        readingTime: article.readingTime,
        category: article.category,
      }))
    );
  } catch (error) {
    console.error('Failed to load guides:', error);
  }

  const items = guides.length > 0 ? guides : FALLBACK_GUIDES;

  return (
    <div className="relative min-h-screen pb-24">
      <div className="pointer-events-none absolute right-1/4 top-0 -z-10 h-[50vw] w-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply" />

      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16 max-w-4xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />
              Learn by building
            </span>
            <h1 className="mb-6 font-heading text-5xl font-extrabold tracking-tight md:text-7xl">
              Platform{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Guides
              </span>
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Learn how to architect, secure, and deploy agentic workflows with our comprehensive
              tutorials.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((guide, i) => {
            const image = guide.featuredImage || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
            return (
              <ScrollReveal key={guide.slug} delay={i * 0.1}>
                <Link href={`/guides/${guide.slug}`} className="block h-full">
                  <TiltCard className="h-full">
                    <div className="group flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/50">
                      <div className="relative h-56 w-full shrink-0 overflow-hidden border-b border-border/50 bg-muted">
                        <img
                          src={image}
                          alt={guide.title}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                          {guide.category ? (
                            <span className="rounded-full border border-white/20 bg-background/70 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm">
                              {guide.category.name}
                            </span>
                          ) : null}
                          {guide.readingTime ? (
                            <span className="rounded-full border border-white/20 bg-background/70 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm">
                              {guide.readingTime} min read
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-8">
                        <h2 className="mb-3 font-heading text-2xl font-bold leading-tight">
                          {guide.title}
                        </h2>
                        <p className="flex-1 leading-relaxed text-muted-foreground">
                          {guide.description}
                        </p>
                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
                          Read guide
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
