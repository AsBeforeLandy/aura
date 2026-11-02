'use client';

/**
 * 滚动缩放揭示：卡片随滚动从 `from` 缩放至 1，并伴随淡入。
 * 现代 landing 页的 sticky 卡片揭示形态（配合使用方的滚动空间）。
 *
 * - 只动画 transform 与 opacity；
 * - reduced-motion 下静态呈现。
 */

import type { RefObject } from 'react';
import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { useScrollContainer } from '../hooks/use-scroll-container';

export interface ScrollScaleCardProps {
  children: React.ReactNode;
  /** 起始缩放（如 0.9） */
  from?: number;
  /** 起始透明度 */
  fromOpacity?: number;
  /**
   * 滚动容器。缺省时自动向上查找最近的可滚动祖先；
   * 卡片位于内层滚动容器（抽屉 / 表格 / demo 预览框）时无需手动传。
   */
  container?: RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollScaleCard({
  children,
  from = 0.9,
  fromOpacity = 0.5,
  container,
  className,
  style,
}: ScrollScaleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollContainer = useScrollContainer(ref, container);
  const { scrollYProgress } = useScroll({
    target: ref,
    container: scrollContainer,
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
