'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, CheckCheck, Settings2 } from 'lucide-react';

const CONSENT_KEY = 'tecrese-cookie-consent';
const CONSENT_VERSION = '1.0';

interface CookieConsentData {
  version: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const DEFAULT_PREFERENCES: CookieConsentData = {
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: 0,
};

function clearCookies(prefixes: string[]) {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (prefixes.some((prefix) => name.startsWith(prefix))) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentData>(DEFAULT_PREFERENCES);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookieConsentData;
        if (parsed.version === CONSENT_VERSION) {
          setPreferences(parsed);
          return;
        }
      } catch {
        // Fall through and ask again.
      }
    }
    setShow(true);
  }, []);

  const savePreferences = (next: Partial<CookieConsentData>) => {
    const updated: CookieConsentData = {
      ...preferences,
      ...next,
      version: CONSENT_VERSION,
      necessary: true,
      timestamp: Date.now(),
    };

    setPreferences(updated);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('tecrese-consent-change'));

    if (!updated.analytics) {
      clearCookies(['_ga', '_gid', '_gat']);
    }
    if (!updated.marketing) {
      clearCookies(['_fbp', '_gcl']);
    }

    setShow(false);
    setShowDetails(false);
  };

  const acceptAll = () => savePreferences({ analytics: true, marketing: true });
  const rejectAll = () => savePreferences({ analytics: false, marketing: false });
  const togglePreference = (key: 'analytics' | 'marketing') =>
    setPreferences((current) => ({ ...current, [key]: !current[key] }));

  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
      role="region"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex flex-1 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Cookie className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 id="cookie-title" className="text-sm font-bold">
                Cookies &amp; privacy
              </h2>
              <p id="cookie-description" className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                We use essential cookies to run Tecrese and optional analytics to understand which content helps.
                Read our{' '}
                <Link href="/cookies" className="text-primary underline underline-offset-2 hover:text-accent">
                  cookie policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={rejectAll}
              className="flex-1 rounded-full border border-border/60 px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted/50 sm:flex-none"
            >
              Essential only
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 sm:flex-none"
            >
              Accept all
            </button>
            <button
              onClick={() => setShowDetails((value) => !value)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="Customize cookie preferences"
              aria-expanded={showDetails}
            >
              <Settings2 className="h-4 w-4" />
            </button>
            <button
              onClick={rejectAll}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="Dismiss cookie banner and keep essential cookies only"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3 border-t border-border/60 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <CheckCheck className="h-4 w-4 shrink-0 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Essential</p>
                  <p className="text-xs text-muted-foreground">Required for login, security, and core site features.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Always on</span>
            </div>

            {(
              [
                {
                  key: 'analytics' as const,
                  title: 'Analytics',
                  description: 'Anonymous page views and traffic sources so we know what to write next.',
                },
                {
                  key: 'marketing' as const,
                  title: 'Marketing',
                  description: 'Campaign measurement and ad personalization. Off by default.',
                },
              ]
            ).map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-muted/30 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <span className="relative inline-flex shrink-0 items-center">
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={() => togglePreference(item.key)}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
                  <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            ))}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => savePreferences({})}
                className="rounded-full bg-foreground px-5 py-2 text-xs font-bold text-background transition-opacity hover:opacity-90"
              >
                Save choices
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
