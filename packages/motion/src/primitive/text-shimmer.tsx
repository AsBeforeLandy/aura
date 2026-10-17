'use client';

/**
 * 文字流光：background-clip: text + 渐变背景位移动画（AI 生成中的经典质感）。
 *
 * - 文字本体透明，用渐变绘制字形；高光沿文字单向流过；
 * - 默认高光为半透明白（深底场景）；浅底场景请传深色 highlightColor；
 * - reduced-motion 下呈现静态单色文字。
 */

import { motion, useReducedMotion } from 'motion/react';

export interface TextShimmerProps {
  children: string;
  /** 一轮流光时长（秒） */
  duration?: number;
  /** 高光带宽（占文字宽度的百分比，越大越柔） */
  spread?: number;
  /** 文字底色；默认 currentColor（继承文字颜色） */
  baseColor?: string;
  /** 高光颜色；默认半透明白（深底） */
  highlightColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function TextShimmer({
  children,
  duration = 2.2,
  spread = 12,
  baseColor = 'currentColor',
  highlightColor = 'rgba(255, 255, 255, 0.75)',
  className,
  style,
}: TextShimmerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  const gradient = `linear-gradient(90deg, ${baseColor} ${50 - spread}%, ${highlightColor} 50%, ${baseColor} ${50 + spread}%)`;

  return (
    <motion.span
      className={className}
      style={{
        display: 'inline-block',
        backgroundImage: gradient,
        backgroundSize: '200% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        ...style,
      }}
      animate={{ backgroundPosition: ['150% 0%', '-50% 0%'] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {children}
    </motion.span>
  );
}
