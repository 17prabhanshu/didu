"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";

interface NewsletterFormProps {
  variant?: "footer" | "homepage" | "page";
  className?: string;
}

export function NewsletterForm({ variant = "footer", className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Subscription failed. Please try again.");
      }

      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    if (variant === "homepage") {
      return (
        <div className="bg-background/90 text-foreground p-6 rounded-3xl border border-primary/20 max-w-xl mx-auto text-center shadow-lg animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-heading text-xl font-bold mb-1">You&apos;re Subscribed!</h3>
          <p className="text-sm text-muted-foreground">
            Check your inbox for your welcome briefing and intelligence updates.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-primary/10 border border-primary/20 text-foreground p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in">
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-xs uppercase tracking-wider text-primary">Subscribed!</p>
          <p className="text-xs text-muted-foreground mt-0.5">Welcome aboard! Check your inbox shortly.</p>
        </div>
      </div>
    );
  }

  if (variant === "homepage") {
    return (
      <div className={`w-full max-w-2xl mx-auto ${className}`}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center relative px-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="YOUR EMAIL"
            className="px-8 py-6 rounded-full flex-1 text-foreground bg-background border-none focus:outline-none focus:ring-4 focus:ring-primary text-lg font-bold uppercase tracking-wider disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-6 bg-primary text-primary-foreground font-black tracking-widest uppercase rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Subscribe"}
          </button>
        </form>
        {error && (
          <p className="text-red-400 text-sm mt-3 font-medium flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}
      </div>
    );
  }

  // Footer / standard variant
  return (
    <div className={`space-y-2 ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="newsletter-email-input" className="sr-only">Email address</label>
        <div className="flex gap-2">
          <input
            id="newsletter-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="Enter your email"
            className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
          </button>
        </div>
      </form>
      {error && (
        <p className="text-destructive text-xs flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
