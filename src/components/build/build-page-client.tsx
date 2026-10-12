"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, ChevronDown, ExternalLink, GitBranch, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

interface BuildResource {
  name: string;
  slug: string;
  description: string;
  category: string;
  githubUrl?: string;
  websiteUrl?: string;
  stars?: number;
  language?: string;
  featured?: boolean;
}

const mockFrameworks: BuildResource[] = [
  {
    name: "LangChain",
    slug: "langchain",
    description: "The most popular framework for building LLM applications with composable chains and agents.",
    category: "Orchestration",
    githubUrl: "https://github.com/langchain-ai/langchain",
    websiteUrl: "https://langchain.com",
    stars: 85000,
    language: "Python/JS",
    featured: true,
  },
  {
    name: "AutoGen",
    slug: "autogen",
    description: "Microsoft's framework for building multi-agent conversation systems with human-in-the-loop.",
    category: "Multi-Agent",
    githubUrl: "https://github.com/microsoft/autogen",
    websiteUrl: "https://microsoft.github.io/autogen",
    stars: 28000,
    language: "Python",
    featured: true,
  },
  {
    name: "CrewAI",
    slug: "crewai",
    description: "Framework for orchestrating role-playing autonomous AI agents that work as a crew.",
    category: "Multi-Agent",
    githubUrl: "https://github.com/joaomdmoura/crewAI",
    websiteUrl: "https://crewai.com",
    stars: 18000,
    language: "Python",
    featured: true,
  },
  {
    name: "LangGraph",
    slug: "langgraph",
    description: "Stateful, cyclic graphs for building complex agent workflows with built-in persistence.",
    category: "Orchestration",
    githubUrl: "https://github.com/langchain-ai/langgraph",
    websiteUrl: "https://langchain-ai.github.io/langgraph",
    stars: 8500,
    language: "Python/JS",
    featured: true,
  },
  {
    name: "Semantic Kernel",
    slug: "semantic-kernel",
    description: "Microsoft's SDK for integrating AI services with conventional programming languages.",
    category: "Enterprise",
    githubUrl: "https://github.com/microsoft/semantic-kernel",
    websiteUrl: "https://learn.microsoft.com/semantic-kernel",
    stars: 17000,
    language: "C#/Python/Java",
    featured: false,
  },
  {
    name: "LlamaIndex",
    slug: "llamaindex",
    description: "Data framework for connecting custom data sources to LLMs for RAG and agents.",
    category: "RAG",
    githubUrl: "https://github.com/run-llama/llama_index",
    websiteUrl: "https://llamaindex.ai",
    stars: 29000,
    language: "Python/JS",
    featured: false,
  },
  {
    name: "Haystack",
    slug: "haystack",
    description: "End-to-end framework for building production-ready LLM applications and pipelines.",
    category: "Enterprise",
    githubUrl: "https://github.com/deepset-ai/haystack",
    websiteUrl: "https://haystack.deepset.ai",
    stars: 15000,
    language: "Python",
    featured: false,
  },
  {
    name: "AutoGPT",
    slug: "autogpt",
    description: "Experimental autonomous agent that chains LLM calls to achieve goals independently.",
    category: "Autonomous",
    githubUrl: "https://github.com/Significant-Gravitas/AutoGPT",
    websiteUrl: "https://agpt.co",
    stars: 160000,
    language: "Python",
    featured: false,
  },
];

const mockMcpServers: BuildResource[] = [
  {
    name: "Filesystem MCP",
    slug: "filesystem-mcp",
    description: "Official MCP server for secure file system access and manipulation.",
    category: "File Operations",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    stars: 1200,
    language: "TypeScript",
    featured: true,
  },
  {
    name: "GitHub MCP",
    slug: "github-mcp",
    description: "MCP server for GitHub repository management, issues, PRs, and code search.",
    category: "Code Hosting",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    stars: 900,
    language: "TypeScript",
    featured: true,
  },
  {
    name: "PostgreSQL MCP",
    slug: "postgresql-mcp",
    description: "MCP server for querying and managing PostgreSQL databases.",
    category: "Databases",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    stars: 800,
    language: "TypeScript",
    featured: true,
  },
  {
    name: "Browser MCP",
    slug: "browser-mcp",
    description: "MCP server for web automation, scraping, and browser control via Playwright.",
    category: "Web Automation",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/browser",
    stars: 1500,
    language: "TypeScript",
    featured: false,
  },
  {
    name: "Slack MCP",
    slug: "slack-mcp",
    description: "MCP server for Slack workspace integration - channels, messages, users.",
    category: "Communication",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    stars: 600,
    language: "TypeScript",
    featured: false,
  },
  {
    name: "Docker MCP",
    slug: "docker-mcp",
    description: "MCP server for container management and orchestration.",
    category: "Infrastructure",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/docker",
    stars: 700,
    language: "TypeScript",
    featured: false,
  },
];

const mockDevTools: BuildResource[] = [
  {
    name: "LangSmith",
    slug: "langsmith",
    description: "Debugging, testing, and monitoring platform for LLM applications.",
    category: "Observability",
    websiteUrl: "https://langsmith.com",
    stars: 0,
    language: "SaaS",
    featured: true,
  },
  {
    name: "Langfuse",
    slug: "langfuse",
    description: "Open-source LLM engineering platform for tracing, evals, and prompt management.",
    category: "Observability",
    githubUrl: "https://github.com/langfuse/langfuse",
    websiteUrl: "https://langfuse.com",
    stars: 6500,
    language: "TypeScript",
    featured: true,
  },
  {
    name: "Phoenix (Arize)",
    slug: "phoenix",
    description: "AI observability for embeddings, LLM traces, and retrieval evaluation.",
    category: "Observability",
    githubUrl: "https://github.com/Arize-ai/phoenix",
    websiteUrl: "https://arize.com/phoenix",
    stars: 3200,
    language: "Python",
    featured: false,
  },
  {
    name: "PromptLayer",
    slug: "promptlayer",
    description: "Prompt engineering platform with versioning, A/B testing, and analytics.",
    category: "Prompt Engineering",
    websiteUrl: "https://promptlayer.com",
    stars: 0,
    language: "SaaS",
    featured: false,
  },
  {
    name: "Helicone",
    slug: "helicone",
    description: "Open-source LLM observability with caching, rate limiting, and cost tracking.",
    category: "Observability",
    githubUrl: "https://github.com/helicone/helicone",
    websiteUrl: "https://helicone.ai",
    stars: 2800,
    language: "TypeScript",
    featured: false,
  },
];

export function BuildPageClient() {
  const [activeTab, setActiveTab] = useState<"frameworks" | "mcp" | "tools">("frameworks");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "frameworks", label: "Frameworks", count: mockFrameworks.length, icon: Sparkles },
    { id: "mcp", label: "MCP Servers", count: mockMcpServers.length, icon: Filter },
    { id: "tools", label: "Dev Tools", count: mockDevTools.length, icon: Search },
  ];

  const getResources = () => {
    switch (activeTab) {
      case "frameworks": return mockFrameworks;
      case "mcp": return mockMcpServers;
      case "tools": return mockDevTools;
    }
  };

  const resources = getResources().filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(resources.map((r) => r.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Build with AI
              </span>
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
                Frameworks, MCP Servers & Dev Tools
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                Discover the best tools for building autonomous AI agents. Compare frameworks, find MCP servers for integrations, and explore observability platforms.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="px-2 py-0.5 text-xs rounded-full bg-background/50">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Category Filters */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <ScrollReveal key={resource.slug} delay={index * 0.05}>
                <article className={cn(
                  "group relative p-6 rounded-2xl border transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5",
                  resource.featured ? "border-primary/20 bg-primary/5" : "bg-card"
                )}>
                  {resource.featured && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                      Featured
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {resource.name}
                      </h3>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                        {resource.category}
                      </span>
                    </div>
                    {resource.stars && resource.stars > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <GitBranch className="w-3 h-3" />
                        {resource.stars >= 1000 ? `${(resource.stars / 1000).toFixed(1)}k` : resource.stars}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  {resource.language && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-muted/50 text-muted-foreground mb-4">
                      <span className="w-2 h-2 rounded-full bg-primary/50" />
                      {resource.language}
                    </span>
                  )}

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {resource.githubUrl && (
                      <Link
                        href={resource.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        <GitBranch className="w-4 h-4" />
                        GitHub
                      </Link>
                    )}
                    {resource.websiteUrl && (
                      <Link
                        href={resource.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </Link>
                    )}
                    <Link
                      href={`/${activeTab === "frameworks" ? "frameworks" : activeTab === "mcp" ? "mcp-servers" : "tools"}/${resource.slug}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>

          {resources.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Submit your framework, MCP server, or dev tool to be included in the Tecrese directory.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-5 h-5" />
            Submit a Resource
          </Link>
        </div>
      </section>
    </div>
  );
}