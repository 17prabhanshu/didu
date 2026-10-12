export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Link from "next/link";
import { UserCheck, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export const metadata = {
  title: 'Authors & Analysts | Tecrese',
  description: 'Meet the researchers, benchmark analysts, and engineers contributing to the Tecrese intelligence index.',
};

export default async function AuthorsIndexPage() {
  const authors = await db.author.findMany({
    include: {
      articlesAuthored: {
        where: { status: 'PUBLISHED' },
        select: { id: true },
      },
    },
    orderBy: { name: 'asc' },
  }).catch(() => []);

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-20 px-4 sm:px-6 lg:px-8 max-w-5xl">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <UserCheck className="w-3.5 h-3.5" />
              Editorial Intelligence Staff
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Authors & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Analysts</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Meet our domain specialists evaluating autonomy loops, token efficiency, and AI system safety.
            </p>
          </div>
        </ScrollReveal>

        {authors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {authors.map((author: any) => (
              <ScrollReveal key={author.id}>
                <Link
                  href={`/authors/${author.slug}`}
                  className="group bg-card/70 hover:bg-card border border-border/70 hover:border-primary/50 p-8 rounded-3xl transition-all shadow-sm hover:shadow-xl flex gap-6 items-start"
                >
                  <div className="w-20 h-20 rounded-2xl bg-muted border border-border/60 shrink-0 overflow-hidden flex items-center justify-center relative">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading font-black text-2xl text-primary">
                        {author.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-heading text-2xl font-bold group-hover:text-primary transition-colors">
                        {author.name}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                    {author.expertise && (
                      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                        {author.expertise}
                      </span>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {author.bio || "Staff analyst evaluating AI benchmarks and developer workflows."}
                    </p>
                    <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{author.articlesAuthored?.length || 0} articles published</span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-dashed border-border rounded-3xl text-muted-foreground">
            No author profiles found.
          </div>
        )}
      </div>
    </div>
  );
}
