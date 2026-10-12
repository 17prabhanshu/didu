export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles, Code2, Share2 } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = await db.glossaryTerm.findUnique({ where: { slug } });
  if (!term) return { title: 'Term Not Found | Tecrese' };

  return {
    title: `${term.term} - Definition & Technical Explanation | Tecrese Glossary`,
    description: term.simpleExplanation || term.definition || `Learn what ${term.term} means in autonomous AI agents and architectures.`,
  };
}

export default async function DictionaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const term = await db.glossaryTerm.findUnique({
    where: { slug },
  });

  if (!term) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.term,
    "description": term.definition || term.simpleExplanation,
    "inDefinedTermSet": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tecrese.com'}/dictionary`,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tecrese.com'}/dictionary/${term.slug}`,
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Dynamic Background Orb */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-20 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <ScrollReveal>
          <Link
            href="/dictionary"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-10 bg-card/60 backdrop-blur-md px-4 py-2 rounded-full border border-border"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Glossary
          </Link>

          <div className="bg-card/80 backdrop-blur-xl border border-border p-8 md:p-12 rounded-[2.5rem] shadow-xl mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
              <BookOpen className="w-3.5 h-3.5" />
              Glossary Definition
            </div>

            <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight mb-6">
              {term.term}
            </h1>

            {term.simpleExplanation && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 text-foreground/90">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">Plain English / TL;DR</span>
                <p className="text-lg leading-relaxed">{term.simpleExplanation}</p>
              </div>
            )}

            {term.definition && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <h3 className="font-heading text-xl font-bold mb-3">Definition</h3>
                <p className="text-foreground/80 leading-relaxed">{term.definition}</p>
              </div>
            )}

            {term.technicalExplanation && (
              <div className="bg-muted/40 border border-border rounded-2xl p-6 mt-8">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <Code2 className="w-4 h-4 text-primary" /> Technical Architecture
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
                  {term.technicalExplanation}
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
