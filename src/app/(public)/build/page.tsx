import { Metadata } from "next";
import { BuildPageClient } from "@/components/build/build-page-client";

export const metadata: Metadata = {
  title: "Build with AI | Frameworks, MCP Servers & Developer Tools",
  alternates: { canonical: "/build" },
  description: "Discover the best frameworks, MCP servers, and developer tools for building autonomous AI agents. Compare LangChain, AutoGen, CrewAI, and more.",
};

export default function BuildPage() {
  return <BuildPageClient />;
}