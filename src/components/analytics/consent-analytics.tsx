"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "tecrese-cookie-consent";

/**
 * Loads Vercel Web Analytics only after the visitor opts into analytics.
 * The script is cookieless, but gating it keeps the consent banner honest.
 */
export function ConsentAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem(CONSENT_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        setEnabled(Boolean(parsed?.analytics));
      } catch {
        setEnabled(false);
      }
    };

    sync();
    window.addEventListener("tecrese-consent-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("tecrese-consent-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!enabled) return null;

  return <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />;
}
