import React from 'react';
import type { IconProps } from '../types';

export const ResultSuccess: React.FC<IconProps> = ({ size = 72, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9,12 11,14 15,10" />
    </svg>
  </span>
);

export const ResultError: React.FC<IconProps> = ({ size = 72, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  </span>
);

export const ResultWarning: React.FC<IconProps> = ({ size = 72, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </span>
);

export const ResultInfo: React.FC<IconProps> = ({ size = 72, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  </span>
);

export const NotFound: React.FC<IconProps> = ({ size = 200, className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 200 120" width={size} height={size * 0.6}>
      <text x="100" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="64" fontWeight="bold" fill="var(--aura-text-tertiary, #bfbfbf)" fontFamily="inherit">404</text>
      <line x1="20" y1="90" x2="180" y2="90" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="30" r="6" fill="var(--aura-bg-tertiary, #f5f5f5)" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1" />
      <circle cx="160" cy="40" r="4" fill="var(--aura-bg-tertiary, #f5f5f5)" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1" />
    </svg>
  </span>
);

export const Forbidden: React.FC<IconProps> = ({ size = 200, className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 200 120" width={size} height={size * 0.6}>
      <rect x="70" y="20" width="60" height="50" rx="4" fill="var(--aura-bg-tertiary, #f5f5f5)" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1.5" />
      <rect x="90" y="30" width="20" height="8" rx="4" fill="var(--aura-text-tertiary, #bfbfbf)" />
      <circle cx="100" cy="50" r="6" fill="var(--aura-text-tertiary, #bfbfbf)" />
      <rect x="97" y="54" width="6" height="10" rx="2" fill="var(--aura-text-tertiary, #bfbfbf)" />
      <text x="100" y="95" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--aura-text-tertiary, #bfbfbf)" fontFamily="inherit">403</text>
    </svg>
  </span>
);

export const ServerError: React.FC<IconProps> = ({ size = 200, className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 200 120" width={size} height={size * 0.6}>
      <rect x="60" y="25" width="80" height="50" rx="4" fill="var(--aura-bg-tertiary, #f5f5f5)" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1.5" />
      <line x1="70" y1="40" x2="130" y2="40" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1" strokeLinecap="round" />
      <line x1="70" y1="50" x2="120" y2="50" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1" strokeLinecap="round" />
      <line x1="70" y1="60" x2="110" y2="60" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1" strokeLinecap="round" />
      <text x="100" y="100" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--aura-text-tertiary, #bfbfbf)" fontFamily="inherit">500</text>
    </svg>
  </span>
);
