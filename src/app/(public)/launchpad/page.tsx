import { Metadata } from "next";
import { Terminal, Copy, Monitor, ShieldCheck } from "lucide-react";
import { LaunchpadClient } from "@/components/launchpad/launchpad-client";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export const metadata: Metadata = {
  title: "AI Launchpad | Install GPT, Gemini, Claude & Antigravity",
  description:
    "Copy-paste commands to install and run the six AI tools shaping agentic development: OpenAI Codex, Google Antigravity, Claude Code, GitHub Copilot CLI, Ollama, and the Gemini API.",
};

export default function LaunchpadPage() {
  return (
    <div className="relative min-h-screen pb-24">
      {/* Background orbs */}
      <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[50vw] w-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-10 h-[40vw] w-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/20 via-accent/5 to-transparent mix-blend-multiply dark:bg-emerald-900/20" />

      <section className="relative overflow-hidden pb-12 pt-32 lg:pt-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-4xl text-center">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Terminal className="h-4 w-4" />
                AI Launchpad
              </span>
              <h1 className="mb-6 font-heading text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                Your AI stack,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  running in minutes
                </span>
                .
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Install, authenticate, and run the tools shaping agentic development. Pick your
                operating system, copy the commands, and go.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Copy,
                  title: "Copy-paste ready",
                  description: "Every command verified against official docs.",
                },
                {
                  icon: Monitor,
                  title: "macOS, Linux & Windows",
                  description: "Switch platforms and commands update instantly.",
                },
                {
                  icon: ShieldCheck,
                  title: "Track your setup",
                  description: "Check off tools and keep progress in your browser.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 text-left backdrop-blur-sm"
                >
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
              Before you start: install Node.js 22+ for npm-based tools, keep Git handy, and have an
              account or API key for the tools you want to use.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <LaunchpadClient />
    </div>
  );
}
