'use client';

/**
 * 渐变氛围背景：数个大模糊色块缓慢漂移（GPU transform 循环）。
 * 用于登录页、empty 态、hero 区。reduced-motion 下呈静止渐变。
 */

import { motion, useReducedMotion } from 'motion/react';

export interface AuroraProps {
  /** 色块颜色序列，循环取用 */
  colors?: string[];
  /** 色块数量（默认 3） */
  blobs?: number;
  height?: number | string;
  /** 色块模糊半径（px）；模糊是静态 filter，不做 blur 动画（性能） */
  blur?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Aurora({
  colors = ['#7c3aed', '#06b6d4', '#f472b6'],
  blobs = 3,
  height = 320,
  blur = 80,
  className,
  style,
}: AuroraProps) {
  const reduced = useReducedMotion();
  const drift = [
    { x: [0, 48, -36, 0], y: [0, -32, 24, 0] },
    { x: [0, -40, 32, 0], y: [0, 28, -24, 0] },
    { x: [0, 32, 40, 0], y: [0, 24, -28, 0] },
  ];

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height,
        borderRadius: 16,
        ...style,
      }}
    >
      {Array.from({ length: blobs }).map((_, i) => {
        const d = drift[i % drift.length];
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: colors[i % colors.length],
              filter: `blur(${blur}px)`,
              opacity: 0.45,
              left: `${8 + i * 28}%`,
              top: `${16 + (i % 2) * 32}%`,
            }}
            animate={reduced ? undefined : { x: d.x, y: d.y }}
            transition={{ duration: 14 + i * 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}
