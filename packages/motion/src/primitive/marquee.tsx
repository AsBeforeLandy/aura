'use client';

/**
 * 无缝滚动横幅（logo 墙 / 公告跑马灯）：内容复制两份，位移 -50% 后无缝回绕。
 *
 * - 只动画 transform（合成器友好）；
 * - 单份内容宽度需 ≥ 容器宽度，否则回绕处会露出空隙；
 * - reduced-motion 下静态展示（不滚动）。
 */

import { motion, useReducedMotion } from 'motion/react';

export interface MarqueeProps {
  children: React.ReactNode;
  /** 滚动一轮（内容总长的一半）的时长（秒） */
  duration?: number;
  /** 滚动方向 */
  direction?: 'left' | 'right';
  /** 两份内容之间的间距（px） */
  gap?: number;
  /** 额外间距（如 padding），会在两份内容之间保留 */
  className?: string;
  style?: React.CSSProperties;
}

export function Marquee({
  children,
  duration = 18,
  direction = 'left',
  gap = 48,
  className,
  style,
}: MarqueeProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div
        className={className}
        style={{ display: 'flex', gap, overflow: 'hidden', ...style }}
      >
        {children}
      </div>
    );
  }

  const track = (
    <div style={{ display: 'flex', alignItems: 'center', gap, flexShrink: 0 }}>
      {children}
    </div>
  );

  return (
    <div
      className={className}
      style={{ overflow: 'hidden', position: 'relative', ...style }}
      aria-hidden={false}
    >
      <motion.div
        style={{ display: 'flex', gap, width: 'max-content' }}
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {track}
        {track}
      </motion.div>
    </div>
  );
}
