'use client';

import { forwardRef } from 'react';
import styles from './Logo.module.css';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'mark' | 'wordmark' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const baseStyles = `
  inline-flex items-center justify-center
  transition-all duration-300
`;

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const variantIcons = {
  default: (
    <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="50%" stopColor="#06B6D4"/>
          <stop offset="100%" stopColor="#22D3EE"/>
        </linearGradient>
        <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="64" cy="64" r="60" stroke="url(#logo-grad)" strokeWidth="3" fill="none" filter="url(#logo-glow)"/>
      <polygon points="64,8 112,26 112,62 64,106 16,62 16,26" fill="url(#logo-grad)" opacity="0.15"/>
      <g stroke="url(#logo-grad)" strokeWidth="2" fill="white">
        <circle cx="64" cy="64" r="10" filter="url(#logo-glow)"/>
        <circle cx="64" cy="20" r="6"/>
        <circle cx="100" cy="40" r="6"/>
        <circle cx="100" cy="88" r="6"/>
        <circle cx="64" cy="108" r="6"/>
        <circle cx="28" cy="88" r="6"/>
        <circle cx="28" cy="40" r="6"/>
        <line x1="64" y1="30" x2="64" y2="54" strokeWidth="1.5" opacity="0.6"/>
        <line x1="72" y1="50" x2="92" y2="44" strokeWidth="1.5" opacity="0.6"/>
        <line x1="72" y1="78" x2="92" y2="84" strokeWidth="1.5" opacity="0.6"/>
        <line x1="64" y1="98" x2="64" y2="74" strokeWidth="1.5" opacity="0.6"/>
        <line x1="44" y1="78" x2="36" y2="84" strokeWidth="1.5" opacity="0.6"/>
        <line x1="44" y1="50" x2="36" y2="44" strokeWidth="1.5" opacity="0.6"/>
        <line x1="64" y1="26" x2="64" y2="8" strokeWidth="1" opacity="0.4" strokeDasharray="4,4"/>
        <line x1="94" y1="38" x2="116" y2="22" strokeWidth="1" opacity="0.4" strokeDasharray="4,4"/>
        <line x1="94" y1="90" x2="116" y2="106" strokeWidth="1" opacity="0.4" strokeDasharray="4,4"/>
        <line x1="64" y1="102" x2="64" y2="120" strokeWidth="1" opacity="0.4" strokeDasharray="4,4"/>
        <line x1="34" y1="90" x2="12" y2="106" strokeWidth="1" opacity="0.4" strokeDasharray="4,4"/>
        <line x1="34" y1="38" x2="12" y2="22" strokeWidth="1" opacity="0.4" strokeDasharray="4,4"/>
      </g>
      <circle className="pulse-ring" cx="64" cy="64" r="50" stroke="url(#logo-grad)" strokeWidth="1" fill="none" opacity="0.3"/>
      <circle className="pulse-ring" cx="64" cy="64" r="42" stroke="url(#logo-grad)" strokeWidth="1" fill="none" opacity="0.2"/>
    </svg>
  ),
  mark: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="50%" stopColor="#06B6D4"/>
          <stop offset="100%" stopColor="#22D3EE"/>
        </linearGradient>
        <filter id="mark-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="30" stroke="url(#mark-grad)" strokeWidth="2.5" fill="none" filter="url(#mark-glow)"/>
      <circle cx="32" cy="32" r="8" fill="url(#mark-grad)" filter="url(#mark-glow)"/>
      <g stroke="url(#mark-grad)" strokeWidth="1.5" fill="white">
        <circle cx="32" cy="12" r="4"/>
        <circle cx="52" cy="22" r="4"/>
        <circle cx="52" cy="42" r="4"/>
        <circle cx="32" cy="52" r="4"/>
        <circle cx="12" cy="42" r="4"/>
        <circle cx="12" cy="22" r="4"/>
      </g>
    </svg>
  ),
  wordmark: (
    <svg viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="word-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
      <text x="0" y="36" fontFamily="Syne, sans-serif" fontSize="36" fontWeight="800" fill="url(#word-grad)" letterSpacing="-0.02em">
        Tecrese
      </text>
    </svg>
  ),
  full: (
    <svg viewBox="0 0 280 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" aria-label="Tecrese - The Intelligence Layer for the Agentic Internet">
      <defs>
        <linearGradient id="full-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="50%" stopColor="#06B6D4"/>
          <stop offset="100%" stopColor="#22D3EE"/>
        </linearGradient>
        <filter id="full-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="28" cy="28" r="26" stroke="url(#full-grad)" strokeWidth="2.5" fill="none" filter="url(#full-glow)"/>
      <circle cx="28" cy="28" r="7" fill="url(#full-grad)" filter="url(#full-glow)"/>
      <g stroke="url(#full-grad)" strokeWidth="1.5" fill="white">
        <circle cx="28" cy="6" r="4"/>
        <circle cx="46" cy="15" r="4"/>
        <circle cx="46" cy="41" r="4"/>
        <circle cx="28" cy="50" r="4"/>
        <circle cx="10" cy="41" r="4"/>
        <circle cx="10" cy="15" r="4"/>
      </g>
      <text x="70" y="40" fontFamily="Syne, sans-serif" fontSize="36" fontWeight="800" fill="url(#full-grad)" letterSpacing="-0.02em">
        Tecrese
      </text>
    </svg>
  ),
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ variant = 'default', size = 'md', className = '', style, ...props }, ref) => {
    const Icon = variantIcons[variant];
    const showPulse = variant === 'default' || variant === 'full';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${sizeClasses[size]} ${styles.container} ${className}`}
        style={style}
        {...props}
      >
        <div className={styles.iconWrapper}>
          {Icon}
          {showPulse && <span className={styles.pulseRing} aria-hidden="true" />}
        </div>
      </div>
    );
  }
);

Logo.displayName = 'Logo';

export default Logo;