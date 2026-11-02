'use client';

/**
 * 滚动进度驱动：容器在视口内的滚动进度（0~1）通过 render prop 暴露，
 * 接到任意 MotionValue 消费点（style、SVG 属性、数字……）。
 */

import { useRef, type ReactNode, type RefObject } from 'react';
import { motion, useScroll, useSpring, type MotionValue } from 'motion/react';
import { useScrollContainer } from '../hooks/use-scroll-container';

/** 直接复用引擎的 offset 类型（字符串联合 + 模板字面量，比自造类型精确） */
type ScrollOffsetOption = NonNullable<
  Parameters<typeof useScroll>[0]
>['offset'];

export interface ScrollDrivenProps {
  children: (progress: MotionValue<number>) => ReactNode;
  /**
   * 进度语义：
   * - `'target'`（默认）：**元素在容器内的可见进度**（由 `offset` 定义 0 与 1 锚点）。
   *   适合"进入视口时揭示"。
   * - `'container'`：**滚动容器自身的滚动位置**——顶部 0、底部 1。
   *   适合阅读进度条 / 滚动叙事；无内层容器时等价于页面滚动进度。
   */
  mode?: 'container' | 'target';
  /** 仅 `mode='target'` 时生效：进度判定区间 */
  offset?: ScrollOffsetOption;
  /** 给进度加一层弹簧平滑（0 关闭） */
  smooth?: number;
  /**
   * 滚动容器。缺省时自动向上查找最近的可滚动祖先（抽屉 / 表格 / demo 预览框等），
   * 只有页面滚动时才回退到 window。**内层容器滚动场景无需手动传**。
   */
  container?: RefObject<HTMLElement | null>;
  style?: React.CSSProperties;
  className?: string;
}

export function ScrollDriven({
  children,
  mode = 'target',
  offset = ['start end', 'end start'],
  smooth = 0,
  container,
  style,
  className,
}: ScrollDrivenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollContainer = useScrollContainer(ref, container);

  // 容器自身的滚动位置（无内层容器时即页面滚动轴）：顶部 0 → 底部 1
  const containerScroll = useScroll({
    container: scrollContainer,
  }).scrollYProgress;
  // 元素相对容器的可见进度（需要 offset 锚点）
  const targetScroll = useScroll({
    target: ref,
    container: scrollContainer,
    offset,
  }).scrollYProgress;

  const raw = mode === 'container' ? containerScroll : targetScroll;
  const springed = useSpring(raw, {
    stiffness: 200,
    damping: 40,
  });
  const progress = smooth > 0 ? springed : raw;

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
        background: 'var(--aura-motion-focus-color, #7c3aed)',
        scaleX,
      }}
    />
  );
}
