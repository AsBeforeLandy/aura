'use client';

/**
 * 滚动进度驱动：容器在视口内的滚动进度（0~1）通过 render prop 暴露，
 * 接到任意 MotionValue 消费点（style、SVG 属性、数字……）。
 */

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useSpring, type MotionValue } from 'motion/react';

/** 直接复用引擎的 offset 类型（字符串联合 + 模板字面量，比自造类型精确） */
type ScrollOffsetOption = NonNullable<Parameters<typeof useScroll>[0]>['offset'];

export interface ScrollDrivenProps {
  children: (progress: MotionValue<number>) => ReactNode;
  offset?: ScrollOffsetOption;
  /** 给进度加一层弹簧平滑（0 关闭） */
  smooth?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function ScrollDriven({
  children,
  offset = ['start end', 'end start'],
  smooth = 0,
  style,
  className,
}: ScrollDrivenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raw = useScroll({ target: ref, offset });
  const springed = useSpring(raw.scrollYProgress, { stiffness: 200, damping: 40 });
  const progress = smooth > 0 ? springed : raw.scrollYProgress;

  return (
    <div ref={ref} className={className} style={style}>
      {children(progress)}
    </div>
  );
}

/** 预置：顶部线性进度条（跟随页面纵向滚动） */
export function ScrollProgressBar({ smooth = 0.2 }: { smooth?: number }) {
  const { scrollYProgress } = useScroll();
  const springed = useSpring(scrollYProgress, { stiffness: 300, damping: 40 });
  const scaleX = smooth > 0 ? springed : scrollYProgress;
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        transformOrigin: '0 50%',
        background: 'var(--aura-motion-focus-color, #534ab7)',
        scaleX,
      }}
    />
  );
}
