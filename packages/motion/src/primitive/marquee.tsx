'use client';

/**
 * 无缝滚动横幅（logo 墙 / 公告跑马灯）：内容复制两份，位移 -50% 后无缝回绕。
 *
 * - 只动画 transform（合成器友好）；
 * - 单份内容宽度需 ≥ 容器宽度，否则回绕处会露出空隙；
 * - reduced-motion 下静态展示（不滚动）。
 *
 * 回绕对齐的关键：间距必须放在**每份内容的尾部**（paddingRight），而不是用
 * 外层 flex 的 gap。若用外层 gap，总宽为 2c + g，-50% 位移是 c + g/2，
 * 与一个完整周期（c + g）差 g/2，每次回绕都会「往回跳」一下（闪回）。
 * 改为尾部 padding 后总宽为 2(c + g)，-50% 正好等于一个周期。
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

  // 尾部 padding 保证「两份之间」与「份内元素之间」的间隔一致，
  // 从而 -50% 位移正好落在一个周期上。
  const trackStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap,
    flexShrink: 0,
    paddingRight: gap,
  };

  return (
    <div
      className={className}
      style={{ overflow: 'hidden', position: 'relative', ...style }}
    >
      <motion.div
        style={{ display: 'flex', width: 'max-content' }}
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        <div style={trackStyle}>{children}</div>
        {/* 副本对读屏隐藏，避免内容被重复播报 */}
        <div style={trackStyle} aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
