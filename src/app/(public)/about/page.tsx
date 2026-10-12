import Link from "next/link";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { ShieldCheck, Cpu, Sparkles, Compass, Mail, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const metadata = {
  title: 'About Tecrese | The Intelligence Layer for Autonomous AI',
  description: 'Tecrese is the premier directory, benchmarking index, and intelligence layer for autonomous AI agents, developer tooling, and foundational models.',
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 left-0 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/20 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-20 px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Header Hero */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Our Mission & Vision
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Curating the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Intelligence Layer</span> of Tomorrow
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Thousands of AI tools launch every month. Most are thin wrappers. Tecrese exists to filter out the noise and benchmark truly autonomous, production-grade AI agents, execution frameworks, and reasoning models.
            </p>
          </div>
        </ScrollReveal>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <ScrollReveal delay={0.1}>
            <div className="bg-card/70 backdrop-blur-sm border border-border/60 p-8 rounded-[2rem] h-full flex flex-col hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">Verified Autonomy</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We test every listed agent on practical loop benchmarks: planning, tool use, memory recall, and error recovery—not just marketing taglines.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-card/70 backdrop-blur-sm border border-border/60 p-8 rounded-[2rem] h-full flex flex-col hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 border border-accent/20">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">Security & Privacy First</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Autonomous agents hold terminal access and API keys. We audit each agent for prompt injection resilience, sandboxing, and telemetry leakage.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="bg-card/70 backdrop-blur-sm border border-border/60 p-8 rounded-[2rem] h-full flex flex-col hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">Open Ecosystem</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                From Model Context Protocol (MCP) servers to local open-weights LLMs, we champion open-source modularity and transparent benchmarks.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Founder Story Section */}
        <ScrollReveal delay={0.2}>
          <div className="bg-card border border-border/70 rounded-[2.5rem] p-8 md:p-12 mb-20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block">The Founder</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Built by Builders, for Builders
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
                <p>
                  Hey, I&apos;m <strong>Prabhanshu Shekhar</strong>, founder and lead architect of Tecrese.
                </p>
                <p>
                  When autonomous coding agents and LLM-driven developer workflows first emerged, I found myself spending dozens of hours testing frameworks, comparing token costs, and verifying whether an &ldquo;autonomous agent&rdquo; was genuinely capable or just a brittle prototype.
                </p>
                <p>
                  I created Tecrese to be the single source of truth: a lightning-fast, meticulously curated index that gives developers and enterprises the exact data they need to select their AI stack with confidence.
                </p>
              </div>

              {/* Founder Social Links */}
              <div className="flex flex-wrap items-center gap-4 pt-8 mt-6 border-t border-border">
                <a
                  href="https://github.com/17prabhanshu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-sm font-medium transition-colors border border-border/50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
                <a
                  href="https://x.com/tecrese"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-sm font-medium transition-colors border border-border/50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X (Twitter)
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
                <a
                  href="https://linkedin.com/company/tecrese"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-sm font-medium transition-colors border border-border/50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                  LinkedIn
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors ml-auto"
                >
                  <Mail className="w-4 h-4" />
                  Direct Inquiry
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Editorial Policy & Standards */}
        <ScrollReveal delay={0.3}>
          <div className="bg-card/40 border border-border/50 rounded-3xl p-8 md:p-10 text-center max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl font-bold mb-3">Have a Tool or Agent to Showcase?</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              We welcome submissions from open-source creators and enterprise AI labs. Every submission undergoes our editorial and benchmark verification before publication.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/contact"
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Submit an Agent
              </Link>
              <Link
                href="/newsletter"
                className="px-6 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
              >
                Subscribe to Weekly Briefing
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
