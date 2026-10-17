'use client';

/**
 * 滚动缩放揭示：卡片随滚动从 `from` 缩放至 1，并伴随淡入。
 * 现代 landing 页的 sticky 卡片揭示形态（配合使用方的滚动空间）。
 *
 * - 只动画 transform 与 opacity；
 * - reduced-motion 下静态呈现。
 */

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export interface ScrollScaleCardProps {
  children: React.ReactNode;
  /** 起始缩放（如 0.9） */
  from?: number;
  /** 起始透明度 */
  fromOpacity?: number;
  /** 进度映射区间：卡片进入视口底边 → 到达视口中部完成 */
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollScaleCard({
  children,
  from = 0.9,
  fromOpacity = 0.5,
  className,
  style,
}: ScrollScaleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [from, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [fromOpacity, 1]);

  if (reduced) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ scale, opacity, willChange: 'transform, opacity', ...style }}
    >
      {children}
    </motion.div>
  );
}
