import React from 'react';
import type { IconProps } from '../types';

export const Home: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  </span>
);

export const User: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </span>
);

export const Settings: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </span>
);

export const Mail: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  </span>
);

export const Phone: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  </span>
);

export const Calendar: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  </span>
);

export const Clock: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  </span>
);

export const Bell: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  </span>
);

export const BellOff: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
      <path d="M18 8a6 6 0 0 0-9.33-5" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  </span>
);

export const Lock: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  </span>
);

export const Link: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  </span>
);

export const Loading: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.2" />
      <path d="M12 2v2c4.41 0 8 3.59 8 8h2c0-5.52-4.48-10-10-10z" />
    </svg>
  </span>
);
