'use client';

/**
 * 磁吸悬停：children 跟随指针做弹簧偏移，离开后回位。
 * reduced-motion 下不跟随。
 */

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { motionSprings } from '../tokens';

export interface MagneticProps {
  children: ReactNode;
  /** 跟随强度 0~1：1 表示完全贴合指针相对中心的偏移 */
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Magnetic({
  children,
  strength = 0.35,
  className,
  style,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, motionSprings.spring);
  const y = useSpring(my, motionSprings.spring);

  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ display: 'inline-block', ...style, x, y }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mx.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        my.set((e.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
