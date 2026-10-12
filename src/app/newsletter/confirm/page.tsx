'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';

export default function NewsletterConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('Invalid or missing confirmation token.');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const res = await fetch(`/api/newsletter/confirm?token=${token}`, {
          method: 'POST',
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus('error');
          setMessage(data.error?.message || 'Confirmation failed. Please try again.');
          return;
        }

        setStatus('success');
      } catch {
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    };

    confirmSubscription();
  }, [token]);

  const renderStatus = () => {
    if (status === 'loading') {
      return (
        <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden p-4">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent pointer-events-none" />
          </div>
          <div className="w-full max-w-md relative z-10">
            <div className="bg-card/80 backdrop-blur-2xl border border-border/50 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2">Confirming Subscription</h1>
              <p className="text-muted-foreground">Please wait while we verify your email...</p>
              <div className="mt-8 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSuccess = () => (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/80 backdrop-blur-2xl border border-border/50 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-200">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2">Subscription Confirmed!</h1>
          <p className="text-muted-foreground mb-8">You&apos;re now subscribed to the Tecrese newsletter. You&apos;ll receive our latest insights on AI agents, tools, and models.</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 mb-6">
            <p className="font-medium">What happens next:</p>
            <ul className="list-disc list-inside text-left mt-2 space-y-1 text-green-800">
              <li>You&apos;ll receive our weekly AI intelligence briefing</li>
              <li>Exclusive access to agent comparisons and security alerts</li>
              <li>Early access to new directory features</li>
            </ul>
          </div>
          <Link
            href="/newsletter"
            className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            View Newsletter Archive
          </Link>
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/80 backdrop-blur-2xl border border-border/50 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-200">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2">Confirmation Failed</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <div className="space-y-3">
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Try Subscribing Again
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full border border-border/50 text-foreground py-3 px-6 rounded-xl font-bold hover:bg-muted/50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvalid = () => (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/80 backdrop-blur-2xl border border-border/50 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-200">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-6">This confirmation link is invalid or has expired.</p>
          <div className="space-y-3">
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Subscribe Again
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full border border-border/50 text-foreground py-3 px-6 rounded-xl font-bold hover:bg-muted/50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (status === 'loading') return renderStatus();
  if (status === 'success') return renderSuccess();
  if (status === 'error') return renderError();
  return renderInvalid();
}