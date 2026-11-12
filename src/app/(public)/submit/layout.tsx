import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Tool, Agent, or Article",
  description:
    "Submit an AI tool, agent, or article for review by the Tecrese editorial team.",
  robots: { index: false, follow: true },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
