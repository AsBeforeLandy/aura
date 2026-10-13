'use client';

/**
 * 键盘焦点环的圆角跟随：容器内 focusin/focusout 委托，
 * 环以弹簧动画移动到焦点元素的位置与尺寸（对齐 Material focus ring 的体验）。
 *
 * 环为 aria-hidden 装饰层，不拦截指针与焦点。
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface FocusRingProps {
  children: ReactNode;
  /** 环的圆角（px） */
  radius?: number;
  /** 环颜色；默认读 --aura-motion-focus-color（可在主题层覆盖），回退紫色 */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface RingRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function FocusRing({
  children,
  radius = 10,
  color,
  className,
  style,
}: FocusRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<RingRect | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const container = el.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      setRect({
        top: r.top - container.top,
        left: r.left - container.left,
        width: r.width,
        height: r.height,
      });
    };
    const onFocusOut = () => setRect(null);
    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);
    return () => {
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const ringColor = color ?? 'var(--aura-motion-focus-color, #534ab7)';

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
      // 容器自身不产生焦点，环只在子元素聚焦时出现
      tabIndex={-1}
    >
      {rect && (
        <motion.div
          aria-hidden
          initial={false}
          animate={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            opacity: 1,
          }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            borderRadius: radius,
            boxShadow: `0 0 0 2px ${ringColor}`,
          }}
        />
      )}
      {children}
    </div>
  );
}
