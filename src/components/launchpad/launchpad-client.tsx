"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Sparkles,
  Bot,
  GitBranch,
  Cpu,
  Braces,
  Copy,
  Check,
  ExternalLink,
  Search,
  RotateCcw,
  BookOpen,
  CircleCheck,
  Circle,
  Monitor,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  AI_TOOLS,
  TOOL_CATEGORIES,
  type AITool,
  type Platform,
  type ToolStep,
} from "@/lib/ai-launchpad";

const ICONS: Record<string, typeof Terminal> = {
  codex: Terminal,
  antigravity: Sparkles,
  "claude-code": Bot,
  "copilot-cli": GitBranch,
  ollama: Cpu,
  "gemini-api": Braces,
};

function CopyButton({
  code,
  label = "Copy",
  className,
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
        copied && "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
        className
      )}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function StepBlock({
  tool,
  step,
  index,
  platform,
}: {
  tool: AITool;
  step: ToolStep;
  index: number;
  platform: Platform;
}) {
  const code = step[platform];

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-background/60">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-muted/30 px-3.5 py-2">
        <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <span
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
              tool.accent.bg,
              tool.accent.text
            )}
          >
            {index + 1}
          </span>
          {step.label}
        </span>
        <CopyButton code={code} />
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 text-[12px] leading-relaxed">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
      {step.note ? (
        <p className="px-3.5 pb-2.5 text-[11px] leading-relaxed text-muted-foreground">{step.note}</p>
      ) : null}
    </div>
  );
}

function ToolCard({
  tool,
  platform,
  isDone,
  onToggleDone,
}: {
  tool: AITool;
  platform: Platform;
  isDone: boolean;
  onToggleDone: () => void;
}) {
  const Icon = ICONS[tool.id] ?? Terminal;
  const steps = [tool.install, tool.auth, tool.run, tool.example];
  const allCommands = [
    `# ${tool.name} — ${tool.provider}`,
    "",
    ...steps.flatMap((step) => [`# ${step.label}`, step[platform], ""]),
  ].join("\n");

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2rem] border bg-card/50 backdrop-blur-sm transition-all",
        isDone
          ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5"
          : "border-border/50 hover:border-primary/40"
      )}
    >
      <div className={cn("h-1.5 w-full bg-gradient-to-r", tool.accent.gradient)} />
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border",
                tool.accent.bg,
                tool.accent.border
              )}
            >
              <Icon className={cn("h-7 w-7", tool.accent.text)} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-2xl font-bold">{tool.name}</h2>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    tool.accent.bg,
                    tool.accent.text,
                    tool.accent.border
                  )}
                >
                  {tool.category}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {tool.provider} · {tool.pricing}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDone}
            aria-pressed={isDone}
            aria-label={isDone ? `Mark ${tool.name} as not set up` : `Mark ${tool.name} as set up`}
            className={cn(
              "shrink-0 rounded-full border p-2 transition-colors",
              isDone
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {isDone ? <CircleCheck className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </button>
        </div>

        <p className="mb-2 font-medium">{tool.tagline}</p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>

        <div className="mb-5 flex flex-wrap gap-2">
          {tool.requires.map((requirement) => (
            <span
              key={requirement}
              className="rounded-full border border-border/50 bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              {requirement}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <StepBlock
              key={step.label}
              tool={tool}
              step={step}
              index={index}
              platform={platform}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href={tool.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <BookOpen className="h-4 w-4" /> Docs
            </Link>
            {tool.githubUrl ? (
              <Link
                href={tool.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <GitBranch className="h-4 w-4" /> GitHub
              </Link>
            ) : null}
            <Link
              href={tool.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" /> Website
            </Link>
          </div>
          <CopyButton code={allCommands} label="Copy all" />
        </div>
      </div>
    </article>
  );
}

export function LaunchpadClient() {
  const [platform, setPlatform] = useState<Platform>("unix");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof TOOL_CATEGORIES)[number]>("All");

  useEffect(() => {
    try {
      if (localStorage.getItem("launchpad-platform") === "windows") {
        setPlatform("windows");
      }
      const saved = localStorage.getItem("launchpad-progress");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompleted(new Set(parsed.filter((id): id is string => typeof id === "string")));
        }
      }
    } catch {
      // localStorage can be unavailable in private browsing; defaults are fine.
    }
  }, []);

  const choosePlatform = (next: Platform) => {
    setPlatform(next);
    try {
      localStorage.setItem("launchpad-platform", next);
    } catch {
      // Ignore storage failures.
    }
  };

  const toggleDone = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem("launchpad-progress", JSON.stringify([...next]));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  };

  const resetProgress = () => {
    setCompleted(new Set());
    try {
      localStorage.removeItem("launchpad-progress");
    } catch {
      // Ignore storage failures.
    }
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return AI_TOOLS.filter((tool) => {
      const matchesCategory = category === "All" || tool.category === category;
      const matchesQuery =
        !needle ||
        [tool.name, tool.provider, tool.tagline, tool.description, tool.category]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const progress = Math.round((completed.size / AI_TOOLS.length) * 100);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Controls */}
      <div className="mb-8 rounded-[2rem] border border-border/50 bg-card/50 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Your setup progress</span>
              <span className="font-mono text-sm text-muted-foreground">
                {completed.size}/{AI_TOOLS.length} · {progress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => choosePlatform("unix")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  platform === "unix"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Terminal className="h-3.5 w-3.5" /> macOS / Linux
              </button>
              <button
                type="button"
                onClick={() => choosePlatform("windows")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  platform === "windows"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Monitor className="h-3.5 w-3.5" /> Windows
              </button>
            </div>

            {completed.size > 0 ? (
              <button
                type="button"
                onClick={resetProgress}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools, providers, or categories..."
            className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TOOL_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Tool cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {filtered.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              platform={platform}
              isDone={completed.has(tool.id)}
              onToggleDone={() => toggleDone(tool.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border px-6 py-16 text-center">
          <Search className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="mb-2 font-heading text-xl font-bold">No tools match that search</h3>
          <p className="text-sm text-muted-foreground">
            Try a different name, provider, or category.
          </p>
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[2rem] border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm sm:flex-row sm:text-left">
        <div>
          <h3 className="font-heading text-xl font-bold">Want to go deeper?</h3>
          <p className="text-sm text-muted-foreground">
            Read the guides or add your own tool to the directory.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40"
          >
            Browse guides <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Submit a tool <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
