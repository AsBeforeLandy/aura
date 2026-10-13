'use client';

/**
 * 骨架屏光泽扫过：引擎驱动的 transform 循环（合成器友好），
 * reduced-motion 下呈现静止底色。
 */

import { motion, useReducedMotion } from 'motion/react';

export interface SkeletonShimmerProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  /** 扫过一轮的时长（秒） */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonShimmer({
  width = '100%',
  height = 16,
  radius = 8,
  duration = 1.4,
  className,
  style,
}: SkeletonShimmerProps) {
  const reduced = useReducedMotion();
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width,
        height,
        borderRadius: radius,
        background: 'rgba(127, 127, 127, 0.16)',
        ...style,
      }}
    >
      {!reduced && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration, ease: 'linear', repeatDelay: 0.2 }}
        />
      )}
    </div>
  );
}
