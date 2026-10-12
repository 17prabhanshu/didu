'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = {
  email: (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return null;
  },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    const validator = forgotPasswordSchema[name as keyof typeof forgotPasswordSchema];
    return validator ? validator(value) : null;
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailError = validateField('email', email);
    if (emailError) {
      setError(emailError);
      setTouched({ email: true });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setEmail('');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden p-4">
      {/* Aesthetic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/80 backdrop-blur-2xl border border-border/50 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">Reset Password</h1>
            <p className="text-muted-foreground text-lg">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto border border-green-200">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Check your inbox</h2>
                <p className="text-muted-foreground text-lg">
                  If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Didn&apos;t receive it?</p>
                <ul className="space-y-1 text-left max-w-xs mx-auto">
                  <li>• Check your spam/junk folder</li>
                  <li>• Wait a few minutes for delivery</li>
                  <li>• Make sure you entered the correct email</li>
                </ul>
              </div>
              <Link
                href="/admin/login"
                className="block w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity mt-4"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@example.com"
                    disabled={loading}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-background/50 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      touched.email && validateField('email', email)
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-border/50 focus:border-primary'
                    }`}
                    aria-invalid={touched.email && !!validateField('email', email)}
                    aria-describedby={touched.email && validateField('email', email) ? 'email-error' : undefined}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {touched.email && validateField('email', email) && (
                  <p id="email-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {validateField('email', email)}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2" role="alert">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Remember your password?{' '}
              <Link href="/admin/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}