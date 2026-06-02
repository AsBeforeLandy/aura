import React from 'react';
import type { IconProps } from '../types';

export const CheckCircleOutline: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9,12 11,14 15,10" />
    </svg>
  </span>
);

export const CheckCircleFilled: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  </span>
);

export const CloseCircleOutline: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  </span>
);

export const CloseCircleFilled: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  </span>
);

export const WarningTriangleOutline: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </span>
);

export const WarningTriangleFilled: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  </span>
);

export const InfoCircleOutline: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  </span>
);

export const InfoCircleFilled: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  </span>
);

export const QuestionCircleOutline: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </span>
);
