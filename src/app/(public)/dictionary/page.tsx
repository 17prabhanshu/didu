export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Search, ArrowRight, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export const metadata = {
  title: 'AI Glossary & Dictionary | Tecrese',
  description: 'Comprehensive definitions and explanations of autonomous AI agents, tool calling, model context protocol, and cognitive architectures.',
};

export default async function DictionaryPage() {
  const terms = await db.glossaryTerm.findMany({
    orderBy: { term: 'asc' },
  }).catch(() => []);

  // Group terms alphabetically
  const groupedTerms: Record<string, any[]> = {};
  terms.forEach((t: any) => {
    const letter = (t.term?.[0] || "#").toUpperCase();
    if (!groupedTerms[letter]) groupedTerms[letter] = [];
    groupedTerms[letter].push(t);
  });

  const alphabet = Object.keys(groupedTerms).sort();

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-20 px-4 sm:px-6 lg:px-8 max-w-5xl">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <BookOpen className="w-3.5 h-3.5" />
              Agentic AI Lexicon
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              AI Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Dictionary</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Clear, technically rigorous definitions for the vocabulary shaping the autonomous agent ecosystem.
            </p>
          </div>
        </ScrollReveal>

        {/* Alphabet Navigation Jump Bar */}
        {alphabet.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-16 p-3 bg-card/60 backdrop-blur-md rounded-2xl border border-border">
            {alphabet.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        )}

        {/* Terms Grouped by Letter */}
        {alphabet.length > 0 ? (
          <div className="space-y-16">
            {alphabet.map((letter) => (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6 pb-2 border-b border-border">
                  <span className="font-heading text-3xl font-extrabold text-primary">{letter}</span>
                  <span className="text-xs text-muted-foreground font-mono">({groupedTerms[letter].length} terms)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groupedTerms[letter].map((term: any) => (
                    <Link
                      key={term.id}
                      href={`/dictionary/${term.slug}`}
                      className="group bg-card/60 hover:bg-card border border-border/70 hover:border-primary/50 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-heading text-xl font-bold group-hover:text-primary transition-colors mb-2">
                          {term.term}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {term.simpleExplanation || term.definition || "Read definition and technical breakdown."}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                        <span>Explore definition</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-dashed border-border rounded-3xl text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h3 className="font-heading text-xl font-bold mb-1">Lexicon In Development</h3>
            <p className="text-sm">Dictionary terms are being indexed. Please check back shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
