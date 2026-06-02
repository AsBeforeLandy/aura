import React from 'react';
import type { IconProps } from '../types';

export const StarFilled: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} />
    </svg>
  </span>
);

export const StarEmpty: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} opacity={0.25} />
    </svg>
  </span>
);

export const StarHalf: React.FC<IconProps & { half?: 'left' | 'right' }> = ({ size = 24, color = 'currentColor', className, style, half = 'left' }) => {
  const clipId = React.useId();
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <defs>
          <clipPath id={clipId}>
            <rect x={half === 'left' ? '0' : '12'} y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} opacity={0.25} />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} clipPath={`url(#${clipId})`} />
      </svg>
    </span>
  );
};
