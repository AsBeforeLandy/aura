import React from 'react';
import type { IconProps } from '../types';

export const SpinIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
    </svg>
  </span>
);
