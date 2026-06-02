import React from 'react';
import type { IconProps } from '../types';

export const EmptyDefault: React.FC<IconProps> = ({ size = 200, className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 200 160" width={size} height={size * 0.8}>
      <rect x="30" y="40" width="140" height="100" rx="12" ry="12" fill="var(--aura-bg-tertiary, #f5f5f5)" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1.5" />
      <line x1="56" y1="72" x2="144" y2="72" stroke="var(--aura-border, #d9d9d9)" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="90" x2="120" y2="90" stroke="var(--aura-border, #d9d9d9)" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="108" x2="132" y2="108" stroke="var(--aura-border, #d9d9d9)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="24" r="12" fill="var(--aura-bg-secondary, #fafafa)" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1.5" />
      <circle cx="100" cy="24" r="4" fill="var(--aura-border, #d9d9d9)" />
    </svg>
  </span>
);

export const Empty404: React.FC<IconProps> = ({ size = 200, className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 200 160" width={size} height={size * 0.8}>
      <text x="100" y="90" textAnchor="middle" dominantBaseline="middle" fontSize="60" fontWeight="bold" fill="var(--aura-text-tertiary, #bfbfbf)" fontFamily="inherit">404</text>
      <line x1="30" y1="120" x2="170" y2="120" stroke="var(--aura-border, #d9d9d9)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
);
