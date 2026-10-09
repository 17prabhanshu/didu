import type { Metadata } from "next";
// PRIVACY/SECURITY: Fonts are self-hosted via next/font/local. The woff2 files in
// ./fonts were downloaded from Google Fonts once and committed to the repo, so the
// app never contacts fonts.googleapis.com / fonts.gstatic.com at build OR runtime.
// This prevents any visitor IP from ever reaching Google's servers.
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

const syne = localFont({
  src: "./fonts/syne-latin.woff2",
  variable: "--font-heading",
  display: "swap",
  weight: "400 800",
});
const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "200 800",
});
const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 800",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tecrese.com'),
  title: {
    template: "%s | Tecrese",
    default: "Tecrese - Discover AI Agents and Tools",
  },
  description: "The premier platform for discovering, building, and learning about AI agents, tools, and the models that power them.",
  openGraph: {
    title: "Tecrese",
    description: "The premier platform for discovering, building, and learning about AI agents",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tecrese",
    description: "The premier platform for discovering, building, and learning about AI agents",
  },
};

import { Providers } from "@/components/providers";
import { PixelCat } from "@/components/animations/pixel-cat";
import { CookieBanner } from "@/components/layout/cookie-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider defaultTheme="system" storageKey="agentverse-theme">
          <Providers>
            <PixelCat />
            {children}
            <CookieBanner />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
