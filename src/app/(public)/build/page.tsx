import { TiltCard } from "@/components/animations/tilt-card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";

export const metadata = { title: 'Build | Agentverse' };

const BUILD_TOOLS = [
  {
    title: "Agent Frameworks",
    description: "Explore LangChain, AutoGen, CrewAI and more tools to construct multi-agent workflows.",
    href: "/tools",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Foundational Models",
    description: "Discover the best LLMs and VLMs to serve as the intelligence engine for your agents.",
    href: "/models",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "MCP Servers",
    description: "Connect your agents to external systems using the Model Context Protocol.",
    href: "/tools",
    img: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop"
  }
];

export default function BuildPage() {
  return (
    <div className="relative min-h-screen pb-24">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mb-24">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Future</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Everything you need to architect, deploy, and scale autonomous AI agents in one centralized hub.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BUILD_TOOLS.map((tool, i) => (
            <ScrollReveal key={tool.title} delay={i * 0.1}>
              <Link href={tool.href}>
                <TiltCard className="h-full">
                  <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] hover:border-primary/50 transition-colors overflow-hidden group">
                    <div className="w-full h-48 relative overflow-hidden bg-muted border-b border-border/50">
                      <img 
                        src={tool.img} 
                        alt={tool.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                    </div>
                    
                    <div className="p-8">
                      <h3 className="font-heading text-2xl font-bold mb-3">{tool.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
