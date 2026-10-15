'use client';

/**
 * 渐变氛围背景（质感精修版）：大尺度低透明模糊椭圆做超慢轨道漂移 + 自转。
 *
 * 精修点：色块 320→480px、透明度 0.45→0.32（更弥散）、椭圆形态 + 60s 慢自转
 * （模糊边缘产生形态变化）、三色块互质周期（14s/17s/21s）避免同步循环感。
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

/** 互质周期与相位各异的漂移轨道（椭圆八字形），下标循环取用 */
const ORBITS = [
  { duration: 14, x: [0, 64, 0, -64, 0], y: [28, 0, -28, 0, 28] },
  { duration: 17, x: [0, -56, 0, 56, 0], y: [-24, 0, 24, 0, -24] },
  { duration: 21, x: [0, 48, -48, 0, 48], y: [0, 32, 0, -32, 0] },
];

export function Aurora({
  colors = ['#7c3aed', '#06b6d4', '#f472b6'],
  blobs = 3,
  height = 320,
  blur = 120,
  className,
  style,
}: AuroraProps) {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height,
        borderRadius: 16,
        isolation: 'isolate',
        ...style,
      }}
    >
      {Array.from({ length: blobs }).map((_, i) => {
        const orbit = ORBITS[i % ORBITS.length];
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 480,
              height: 320,
              borderRadius: '50%',
              background: colors[i % colors.length],
              filter: `blur(${blur}px)`,
              opacity: 0.32,
              left: `${8 + i * 24}%`,
              top: `${10 + (i % 2) * 34}%`,
            }}
            animate={
              reduced
                ? undefined
                : {
                    x: orbit.x,
                    y: orbit.y,
                    rotate: [0, i % 2 === 0 ? 360 : -360],
                  }
            }
            transition={
              reduced
                ? undefined
                : {
                    x: { duration: orbit.duration, repeat: Infinity, ease: 'easeInOut' },
                    y: { duration: orbit.duration, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
                  }
            }
          />
        );
      })}
    </div>
  );
}
