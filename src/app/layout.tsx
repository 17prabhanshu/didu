import type { Metadata } from "next";
// PRIVACY/SECURITY: Fonts are self-hosted via next/font/local. The woff2 files in
// ./fonts were downloaded from Google Fonts once and committed to the repo, so the
// app never contacts fonts.googleapis.com / fonts.gstatic.com at build OR runtime.
// This prevents any visitor IP from ever reaching Google's servers.
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Providers } from "@/components/providers";
import { PixelCat } from "@/components/animations/pixel-cat";
import CookieConsent from "@/components/cookie-consent/CookieConsent";
import { OrganizationJSONLD, WebsiteJSONLD } from "@/components/seo/JSONLD";

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
    default: "Tecrese - The Intelligence Layer for the Agentic Internet",
  },
  description: "The intelligence layer for the agentic internet. Discover, compare, and integrate AI agents, tools, and models.",
  keywords: [
    "AI agents",
    "AI tools",
    "machine learning models",
    "agentic AI",
    "LLM applications",
    "model context protocol",
    "autonomous agents",
    "coding agents",
  ],
  authors: [{ name: "Tecrese Editorial Team" }],
  creator: "Tecrese",
  publisher: "Tecrese",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tecrese.com",
    siteName: "Tecrese",
    title: "Tecrese - The Intelligence Layer for the Agentic Internet",
    description: "The intelligence layer for the agentic internet. Discover, compare, and integrate AI agents, tools, and models.",
    images: [
      {
        url: "/api/og?type=default",
        width: 1200,
        height: 630,
        alt: "Tecrese - The Intelligence Layer for the Agentic Internet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tecrese - The Intelligence Layer for the Agentic Internet",
    description: "The intelligence layer for the agentic internet. Discover, compare, and integrate AI agents, tools, and models.",
    images: ["/api/og?type=default"],
    creator: "@tecrese",
  },
  icons: {
    icon: [
      { url: "/images/brand/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/images/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/images/brand/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/images/brand/apple-touch-icon.svg", type: "image/svg+xml", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "manifest",
        url: "/manifest.webmanifest",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <OrganizationJSONLD />
        <WebsiteJSONLD />
        <ThemeProvider defaultTheme="system" storageKey="agentverse-theme">
          <Providers>
            <PixelCat />
            {children}
            <CookieConsent />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}