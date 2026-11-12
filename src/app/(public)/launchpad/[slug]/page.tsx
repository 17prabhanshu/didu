import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Monitor,
  Terminal,
} from "lucide-react";
import { AI_TOOLS, type AITool, type ToolStep } from "@/lib/ai-launchpad";
import { BreadcrumbJSONLD, FAQJSONLD, JSONLD } from "@/components/seo/JSONLD";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tecrese.com";

export const revalidate = 3600;

export function generateStaticParams() {
  return AI_TOOLS.map((tool) => ({ slug: tool.id }));
}

function getTool(slug: string): AITool | undefined {
  return AI_TOOLS.find((tool) => tool.id === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) return { title: "Tool Not Found" };

  const title = `How to Install ${tool.name} (${tool.provider}) - Setup Guide`;
  const description = `Install ${tool.name} on macOS, Linux, or Windows. Copy-paste commands for installation, authentication, and your first ${tool.category.toLowerCase()} session.`;

  return {
    title,
    description,
    alternates: { canonical: `/launchpad/${tool.id}` },
    openGraph: {
      title,
      description,
      url: `/launchpad/${tool.id}`,
      type: "article",
    },
  };
}

function CommandBlock({ label, step }: { label: string; step: ToolStep }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-foreground text-background">
      <div className="flex items-center gap-2 border-b border-background/10 px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5 text-background/60" />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-background/60">
          {label}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="whitespace-pre-wrap break-words font-mono">{step.unix}</code>
      </pre>
      {step.note ? (
        <p className="border-t border-background/10 px-4 py-2.5 text-xs text-background/60">
          {step.note}
        </p>
      ) : null}
    </div>
  );
}

function WindowsCommandBlock({ step }: { step: ToolStep }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/50">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2.5">
        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Windows (PowerShell)
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="whitespace-pre-wrap break-words font-mono">{step.windows}</code>
      </pre>
    </div>
  );
}

export default async function LaunchpadToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) notFound();

  const pageUrl = `${SITE_URL}/launchpad/${tool.id}`;
  const otherTools = AI_TOOLS.filter((item) => item.id !== tool.id);

  const faqs = [
    {
      question: `How do I install ${tool.name}?`,
      answer: `On macOS or Linux, run: ${tool.install.unix}. On Windows PowerShell, run: ${tool.install.windows}. Then launch ${tool.name} and complete authentication.`,
    },
    {
      question: `Is ${tool.name} free?`,
      answer: `${tool.name} pricing: ${tool.pricing}. Check the official documentation for the latest plan limits.`,
    },
    {
      question: `Does ${tool.name} work on Windows?`,
      answer: `Yes. ${tool.name} supports Windows through PowerShell: ${tool.install.windows}. macOS and Linux use the shell command shown above.`,
    },
    {
      question: `What do I need before installing ${tool.name}?`,
      answer: `You need ${tool.requires.join(", ")}. The full setup usually takes about five minutes.`,
    },
  ];

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to install ${tool.name}`,
    description: `Install and run ${tool.name} from ${tool.provider} on macOS, Linux, or Windows.`,
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: tool.name }],
    supply: tool.requires.map((requirement) => ({
      "@type": "HowToSupply",
      name: requirement,
    })),
    step: [
      {
        "@type": "HowToStep",
        name: "Install",
        text: `Run ${tool.install.unix} on macOS or Linux, or ${tool.install.windows} on Windows PowerShell.`,
        url: `${pageUrl}#install`,
      },
      {
        "@type": "HowToStep",
        name: "Authenticate",
        text: `Run ${tool.auth.unix} and follow the sign-in prompts.`,
        url: `${pageUrl}#authenticate`,
      },
      {
        "@type": "HowToStep",
        name: "Start a session",
        text: `Run ${tool.run.unix} inside your project directory.`,
        url: `${pageUrl}#run`,
      },
    ],
  };

  return (
    <div className="relative min-h-screen pb-24">
      <JSONLD data={howToSchema} id="howto-schema" />
      <BreadcrumbJSONLD
        items={[
          { name: "Home", url: SITE_URL },
          { name: "AI Launchpad", url: `${SITE_URL}/launchpad` },
          { name: tool.name, url: pageUrl },
        ]}
      />
      <FAQJSONLD faqs={faqs} />

      <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[45vw] w-[45vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/15 via-primary/5 to-transparent mix-blend-multiply" />

      <section className="relative overflow-hidden pb-12 pt-28 lg:pt-36">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/launchpad"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-bold text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Launchpad
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-wider ${tool.accent.bg} ${tool.accent.text} ${tool.accent.border}`}>
              {tool.category}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {tool.provider} · {tool.pricing}
            </span>
          </div>

          <h1 className="mt-5 font-heading text-4xl font-black tracking-tight md:text-6xl">
            Install {tool.name}
          </h1>
          <p className="mt-4 max-w-3xl text-xl text-muted-foreground">{tool.tagline}</p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {tool.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
            <Link
              href={tool.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <BookOpen className="h-4 w-4" /> Official docs
            </Link>
            <Link
              href={tool.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" /> Website
            </Link>
            {tool.githubUrl ? (
              <Link
                href={tool.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
              >
                <GitBranch className="h-4 w-4" /> GitHub
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div className="min-w-0">
            <section id="before-you-start" className="scroll-mt-24">
              <h2 className="font-heading text-2xl font-black tracking-tight">Before you start</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {tool.requires.map((requirement) => (
                  <li
                    key={requirement}
                    className="flex items-start gap-2 rounded-xl border border-border/50 bg-card/40 p-3 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </section>

            <section id="install" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-black tracking-tight">
                Step 1: Install {tool.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick your operating system. Both commands install the latest stable release.
              </p>
              <div className="mt-4 space-y-3">
                <CommandBlock label="macOS / Linux" step={tool.install} />
                <WindowsCommandBlock step={tool.install} />
              </div>
            </section>

            <section id="authenticate" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-black tracking-tight">
                Step 2: Authenticate
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Launch the tool once and follow the sign-in flow. Credentials are stored locally by the CLI.
              </p>
              <div className="mt-4 space-y-3">
                <CommandBlock label="macOS / Linux" step={tool.auth} />
                <WindowsCommandBlock step={tool.auth} />
              </div>
            </section>

            <section id="run" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-black tracking-tight">
                Step 3: Start your first session
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Move into a project directory and start the tool. It will read the repository and wait for a prompt.
              </p>
              <div className="mt-4 space-y-3">
                <CommandBlock label="macOS / Linux" step={tool.run} />
                <WindowsCommandBlock step={tool.run} />
              </div>
            </section>

            <section id="try-it" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-black tracking-tight">Try a first prompt</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use a small, read-only task first. Once the output looks right, give the tool write access to a branch.
              </p>
              <div className="mt-4 space-y-3">
                <CommandBlock label="Example prompt" step={tool.example} />
                <WindowsCommandBlock step={tool.example} />
              </div>
            </section>

            <section className="mt-12 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-black tracking-tight">Next steps</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add MCP servers, connect a second model, or compare {tool.name} with the other tools in the launchpad.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/mcp-servers"
                  className="rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90"
                >
                  Browse MCP servers
                </Link>
                <Link
                  href="/guides"
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-bold transition-colors hover:bg-muted/50"
                >
                  Read setup guides
                </Link>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="font-heading text-2xl font-black tracking-tight">
                {tool.name} FAQ
              </h2>
              <div className="mt-4 divide-y divide-border/50 rounded-2xl border border-border/50">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group p-5">
                    <summary className="cursor-pointer list-none font-semibold marker:hidden">
                      {faq.question}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="font-heading text-2xl font-black tracking-tight">
                Other tools in the launchpad
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {otherTools.map((item) => (
                  <Link
                    key={item.id}
                    href={`/launchpad/${item.id}`}
                    className="group rounded-2xl border border-border/50 bg-card/40 p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-bold">{item.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.tagline}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav
              aria-label="On this page"
              className="rounded-2xl border border-border/60 bg-card/40 p-5"
            >
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                On this page
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  ["before-you-start", "Before you start"],
                  ["install", "Install"],
                  ["authenticate", "Authenticate"],
                  ["run", "Start a session"],
                  ["try-it", "First prompt"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-muted-foreground transition-colors hover:text-primary">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 rounded-2xl border border-border/60 bg-card/40 p-5">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Quick facts
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Provider</dt>
                  <dd className="font-medium">{tool.provider}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Category</dt>
                  <dd className="font-medium">{tool.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Pricing</dt>
                  <dd className="font-medium">{tool.pricing}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Platforms</dt>
                  <dd className="font-medium">macOS · Linux · Windows</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
