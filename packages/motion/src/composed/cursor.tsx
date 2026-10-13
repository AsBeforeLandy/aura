'use client';

/**
 * 自定义光标跟随：点 + 环双层弹簧跟随，悬停 [data-cursor] 元素时环放大。
 *
 * 触屏设备与 reduced-motion 环境不渲染（不做任何 DOM）。
 * 提醒：启用后建议在容器层为鼠标环境隐藏系统光标（cursor: none 由业务决定）。
 */

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

export interface CursorProps {
  variant?: 'dot-ring' | 'blob';
  /** 触发放大的选择器（事件委托） */
  hoverTargets?: string;
  /** 点的尺寸（px） */
  size?: number;
  /** 环放大倍数 */
  hoverScale?: number;
}

export function Cursor({
  variant = 'dot-ring',
  hoverTargets = '[data-cursor]',
  size = 8,
  hoverScale = 2.4,
}: CursorProps) {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const dotSpring = useSpring(dotX, { stiffness: 900, damping: 50 });
  const dotSpringY = useSpring(dotY, { stiffness: 900, damping: 50 });
  const ringX = useSpring(dotX, { stiffness: 250, damping: 28 });
  const ringY = useSpring(dotY, { stiffness: 250, damping: 28 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setEnabled(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled || reduced) return;
    const move = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      setHovering(!!(e.target as HTMLElement).closest?.(hoverTargets));
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, [enabled, reduced, hoverTargets, dotX, dotY]);

  if (!enabled || reduced) return null;

  const isBlob = variant === 'blob';
  return (
    <div aria-hidden style={{ pointerEvents: 'none' }}>
      {/* 环（慢弹簧，悬停放大） */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: size * 4,
          height: size * 4,
          borderRadius: '50%',
          border: '1.5px solid var(--aura-motion-focus-color, #534ab7)',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
        animate={{ scale: hovering ? hoverScale : 1, opacity: hovering ? 0.9 : 0.5 }}
        transition={{ duration: 0.18 }}
      />
      {/* 点（快弹簧） */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: dotSpring,
          y: dotSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: isBlob ? size : size,
          height: isBlob ? size : size,
          borderRadius: '50%',
          background: 'var(--aura-motion-focus-color, #534ab7)',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </div>
  );
}
