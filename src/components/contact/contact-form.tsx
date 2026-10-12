'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      _gotcha: formData.get('_gotcha') as string,
    };

    // Honeypot check
    if (data._gotcha) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to send message. Please try again.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-12 px-6 text-center bg-card/60 rounded-3xl border border-primary/20">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-heading text-2xl font-bold mb-3">Message Received!</h3>
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed mb-6">
          Thank you for reaching out. We have logged your inquiry and sent an alert to our team. We typically reply within 24–48 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
      {/* Honeypot field for spam bots */}
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Your Name</label>
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="Jane Doe"
            disabled={loading}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="jane@example.com"
            disabled={loading}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Subject</label>
        <select 
          name="subject" 
          disabled={loading}
          className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none disabled:opacity-50"
        >
          <option>General Inquiry</option>
          <option>Editorial / Guest Post</option>
          <option>Partnership / Sponsorship</option>
          <option>Tool Submission / Claim</option>
          <option>Report an Issue</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Message</label>
        <textarea 
          name="message" 
          required 
          rows={6}
          disabled={loading}
          placeholder="How can we help you?"
          className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none disabled:opacity-50" 
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full md:w-auto px-10 py-4 bg-primary text-primary-foreground font-bold rounded-full shadow-lg shadow-primary/25 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
