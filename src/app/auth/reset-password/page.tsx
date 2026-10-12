'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const passwordSchema = {
  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
    if (!/[0-9]/.test(value)) return 'Must contain at least one number';
    return null;
  },
  confirmPassword: (value: string, password: string) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return null;
  },
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [tokenValid, setTokenValid] = useState(true);

  const validateField = (name: string, value: string) => {
    if (name === 'password') return passwordSchema.password(value);
    if (name === 'confirmPassword') return passwordSchema.confirmPassword(value, password);
    return null;
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenValid) return;

    setError('');

    const passwordError = validateField('password', password);
    const confirmError = validateField('confirmPassword', confirmPassword);

    if (passwordError || confirmError) {
      setError(passwordError || confirmError || '');
      setTouched({ password: true, confirmPassword: true });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (name: 'password' | 'confirmPassword', value: string) => {
    if (name === 'password') setPassword(value);
    else setConfirmPassword(value);
  };

  if (!tokenValid) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden p-4">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-card/80 backdrop-blur-2xl border border-border/50 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-200">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">Invalid Reset Link</h1>
            <p className="text-muted-foreground mb-6">This password reset link is invalid or has expired.</p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Request a New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">Set New Password</h1>
            <p className="text-muted-foreground text-lg">Your new password must be different from previous ones</p>
          </div>

          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto border border-green-200">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Password Reset Complete</h2>
                <p className="text-muted-foreground text-lg">Your password has been successfully updated.</p>
              </div>
              <Link
                href="/admin/login"
                className="block w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity mt-4"
              >
                Sign In with New Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => handlePasswordChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter new password"
                    disabled={loading}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl border bg-background/50 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      touched.password && validateField('password', password)
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-border/50 focus:border-primary'
                    }`}
                    aria-invalid={touched.password && !!validateField('password', password)}
                    aria-describedby={touched.password && validateField('password', password) ? 'password-error' : 'password-hint'}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p id="password-hint" className="mt-2 text-sm text-muted-foreground">
                  At least 8 characters with uppercase, lowercase, and number
                </p>
                {touched.password && validateField('password', password) && (
                  <p id="password-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {validateField('password', password)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm new password"
                    disabled={loading}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl border bg-background/50 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      touched.confirmPassword && validateField('confirmPassword', confirmPassword)
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-border/50 focus:border-primary'
                    }`}
                    aria-invalid={touched.confirmPassword && !!validateField('confirmPassword', confirmPassword)}
                    aria-describedby={touched.confirmPassword && validateField('confirmPassword', confirmPassword) ? 'confirm-error' : undefined}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {touched.confirmPassword && validateField('confirmPassword', confirmPassword) && (
                  <p id="confirm-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {validateField('confirmPassword', confirmPassword)}
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
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
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