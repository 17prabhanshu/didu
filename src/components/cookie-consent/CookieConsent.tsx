'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie, CheckCheck } from 'lucide-react';

const CONSENT_KEY = 'tecrese-cookie-consent';
const CONSENT_VERSION = '1.0';

interface CookieConsentData {
  version: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentData>({
    version: CONSENT_VERSION,
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          setPreferences(parsed);
        } else {
          setShow(true);
        }
      } catch {
        setShow(true);
      }
    } else {
      setShow(true);
    }
  }, []);

  const savePreferences = (newPrefs: Partial<CookieConsentData>) => {
    const updated = { ...preferences, ...newPrefs, timestamp: Date.now() };
    setPreferences(updated);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));

    // Apply cookie settings
    if (!newPrefs.analytics) {
      // Remove analytics cookies
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('_ga') || name.startsWith('_gid') || name.startsWith('_gat')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }
    if (!newPrefs.marketing) {
      // Remove marketing cookies
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('_fbp') || name.startsWith('_gcl')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }

    setShow(false);
  };

  const acceptAll = () => {
    savePreferences({ analytics: true, marketing: true });
  };

  const rejectAll = () => {
    savePreferences({ analytics: false, marketing: false });
  };

  const togglePreference = (key: 'analytics' | 'marketing') => {
    savePreferences({ [key]: !preferences[key] });
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 id="cookie-title" className="text-lg font-heading font-bold">Cookie Preferences</h2>
                <p id="cookie-description" className="text-sm text-muted-foreground mt-0.5">
                  We use cookies to enhance your experience. Choose what you&apos;re comfortable with.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShow(false)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Dismiss cookie banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Essential - Always on */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCheck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Essential Cookies</h3>
                  <p className="text-sm text-muted-foreground">Required for the website to function properly. Cannot be disabled.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked disabled className="sr-only" />
                <span className="relative inline-flex h-6 w-11 flex-items-center rounded-full bg-green-500 transition-colors" />
              </label>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Analytics Cookies</h3>
                  <p className="text-sm text-muted-foreground">Help us understand how visitors interact with our site (page views, traffic sources).</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="sr-only"
                />
                <span className={`relative inline-flex h-6 w-11 flex-items-center rounded-full transition-colors ${preferences.analytics ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${preferences.analytics ? 'translate-x-5' : 'translate-x-0'}`} />
                </span>
              </label>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Marketing Cookies</h3>
                  <p className="text-sm text-muted-foreground">Used to deliver personalized ads and measure campaign effectiveness.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                  className="sr-only"
                />
                <span className={`relative inline-flex h-6 w-11 flex-items-center rounded-full transition-colors ${preferences.marketing ? 'bg-purple-500' : 'bg-muted'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${preferences.marketing ? 'translate-x-5' : 'translate-x-0'}`} />
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
              <button
                onClick={acceptAll}
                className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Accept All
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 border border-border/50 text-foreground py-3 px-6 rounded-xl font-bold hover:bg-muted/50 transition-colors"
              >
                Reject Optional
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDetails ? 'Show Less' : 'Customize Preferences'}
              </button>
            </div>

            {/* Details */}
            {showDetails && (
              <div className="pt-4 border-t border-border/50 space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Necessary:</strong> Session management, security, authentication. Always active.
                </p>
                <p>
                  <strong>Analytics:</strong> Page views, traffic sources, user behavior (Google Analytics).
                </p>
                <p>
                  <strong>Marketing:</strong> Ad personalization, campaign measurement (Meta, Google Ads).
                </p>
                <p>
                  You can change your preferences anytime in the footer or by clearing cookies.
                </p>
                <Link href="/cookies" className="text-primary hover:underline">
                  Read our full Cookie Policy
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function togglePreference(key: 'analytics' | 'marketing') {
  // This will be called from the component's savePreferences
}