import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { headingId } from "@/lib/toc";

function nodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (React.isValidElement(node)) {
    return nodeText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

/**
 * Renders article markdown with explicit Tailwind styles.
 * The project does not use @tailwindcss/typography, so element styles are
 * mapped here instead of relying on `prose` classes.
 */
export function ArticleBody({ body }: { body: string }) {
  // Headings are rendered in document order, so this counter keeps IDs in sync
  // with extractHeadings() even when two headings share the same text.
  const seen = new Map<string, number>();
  const idFor = (children: React.ReactNode) => {
    const base = headingId(nodeText(children));
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };

  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 mt-12 font-heading text-4xl font-extrabold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={idFor(children)}
              className="mb-5 mt-10 scroll-mt-24 font-heading text-3xl font-bold tracking-tight"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={idFor(children)}
              className="mb-4 mt-8 scroll-mt-24 font-heading text-2xl font-bold"
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-6 text-lg leading-relaxed text-foreground/80">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-6 list-disc space-y-2 pl-6 text-foreground/80">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 list-decimal space-y-2 pl-6 text-foreground/80">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-4 hover:text-accent"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-6 border-l-4 border-primary/40 pl-5 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          pre: ({ children }) => (
            <pre className="mb-6 overflow-x-auto rounded-2xl border border-border/60 bg-muted/60 p-5 text-sm leading-relaxed">
              {children}
            </pre>
          ),
          code: ({ className, children }) =>
            className ? (
              <code className="font-mono text-sm text-foreground">{children}</code>
            ) : (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
                {children}
              </code>
            ),
          table: ({ children }) => (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-t border-border/50 px-3 py-2 align-top text-foreground/80">
              {children}
            </td>
          ),
          hr: () => <hr className="my-10 border-border" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
