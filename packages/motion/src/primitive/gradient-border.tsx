'use client';

/**
 * 流光渐变边框：旋转的 conic-gradient 底色层 + 内层实底内容，
 * 实现沿边框游走的光效（AI 产品卡片标配）。
 *
 * - 旋转只动画 transform（合成器友好），光效为一层 conic 渐变；
 * - reduced-motion 下呈现静态渐变边框；
 * - 内层内容背景可用 `background` prop 覆盖（默认跟随 --aura-motion-card-bg）。
 */

import { motion, useReducedMotion } from 'motion/react';

export interface GradientBorderProps {
  children: React.ReactNode;
  /** 边框粗细（px） */
  size?: number;
  /** 光效绕行一周时长（秒） */
  speed?: number;
  /** 渐变颜色序列（光带色） */
  colors?: string[];
  /** 内层背景（默认真空色令牌回退） */
  background?: string;
  /** 圆角（px） */
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function GradientBorder({
  children,
  size = 1.5,
  speed = 4,
  colors = ['#534ab7', '#1d9e75', '#534ab7'],
  background = 'var(--aura-motion-card-bg, #ffffff)',
  radius = 12,
  className,
  style,
}: GradientBorderProps) {
  const reduced = useReducedMotion();
  const [c1, c2] = [colors[0] ?? '#534ab7', colors[1] ?? '#1d9e75'];

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radius,
        padding: size,
        ...style,
      }}
    >
      {/* 旋转的 conic 光带层 */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '200%',
          aspectRatio: '1',
          marginLeft: '-100%',
          marginTop: '-100%',
          background: `conic-gradient(from 0deg, transparent 0%, ${c1} 14%, ${c2} 26%, transparent 42%, transparent 100%)`,
        }}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      />
      {/* 内层实底，露出边缘 1px 光带 */}
      <div
        style={{
          position: 'relative',
          borderRadius: Math.max(radius - size, 0),
          background,
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
