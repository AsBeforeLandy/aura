'use client';

/**
 * AI 思考中的三点脉冲：三个圆点依次缩放 + 明暗呼吸（stagger 0.16s）。
 * reduced-motion 下呈现静态三点。
 */

import { motion, useReducedMotion } from 'motion/react';

export interface TypingDotsProps {
  /** 点数量 */
  count?: number;
  /** 点直径（px） */
  size?: number;
  /** 点间距（px） */
  gap?: number;
  /** 点颜色；默认 currentColor */
  color?: string;
  /** 单点一轮脉冲时长（秒） */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function TypingDots({
  count = 3,
  size = 6,
  gap = 5,
  color = 'currentColor',
  duration = 1.1,
  className,
  style,
}: TypingDotsProps) {
  const reduced = useReducedMotion();
  const dots = Array.from({ length: count }, (_, i) => i);

  if (reduced) {
    return (
      <span
        className={className}
        style={{ display: 'inline-flex', gap, alignItems: 'center', ...style }}
      >
        {dots.map((i) => (
          <span
            key={i}
            style={{ width: size, height: size, borderRadius: size / 2, background: color }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-label="正在输入"
      data-motion-state="playing"
      className={className}
      style={{ display: 'inline-flex', gap, alignItems: 'center', ...style }}
    >
      {dots.map((i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{ width: size, height: size, borderRadius: size / 2, background: color }}
          animate={{ scale: [0.55, 1, 0.55], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.16,
          }}
        />
      ))}
    </span>
  );
}
