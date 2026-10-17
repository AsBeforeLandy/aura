'use client';

/**
 * 骨架屏光泽扫过（精修版）：
 * - 光带改为 55% 宽度的柔和渐变（原全宽扫掠过于生硬）；
 * - 新增 `index`：相邻骨架块按序号错峰出光（0.12s/位），多块组合时有节奏
 *   而非"整页同时闪"；
 * - 引擎驱动的 transform 循环（合成器友好），reduced-motion 下呈现静止底色。
 */

import { motion, useReducedMotion } from 'motion/react';

export interface SkeletonShimmerProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  /** 扫过一轮的时长（秒） */
  duration?: number;
  /** 兄弟序号：错峰出光的相位偏移（0.12s/位） */
  index?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonShimmer({
  width = '100%',
  height = 16,
  radius = 8,
  duration = 1.4,
  index = 0,
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
        background: 'rgba(127, 127, 127, 0.14)',
        ...style,
      }}
    >
      {!reduced && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '55%',
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent)',
          }}
          initial={{ x: '-60%' }}
          animate={{ x: '180%' }}
          transition={{
            repeat: Infinity,
            duration,
            ease: 'linear',
            repeatDelay: 0.35,
            delay: (index % 6) * 0.12,
          }}
        />
      )}
    </div>
  );
}
