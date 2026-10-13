'use client';

/**
 * 浏览器原生 View Transitions API 的渐进增强封装。
 *
 * - 支持的浏览器（Chrome/Edge 111+、Safari 18+）：`useViewTransition` 包裹的
 *   DOM 更新以原生转场呈现，`name` 元素参与共享元素过渡；
 * - 不支持的浏览器（Firefox）：保持原行为（无转场），功能完全不受影响。
 */

import { useCallback } from 'react';
import { motion } from 'motion/react';

/**
 * 以原生 View Transition 执行一次 DOM 更新。
 * 浏览器不支持时直接同步执行更新（渐进增强，功能零损失）。
 */
export function useViewTransition() {
  return useCallback((update: () => void) => {
    // TS lib.dom 已收录 startViewTransition 但签名与运行时存在版本差，
    // 这里用最小结构探测，不与 lib 类型对接
    const doc = document as unknown as {
      startViewTransition?: (update: () => void) => unknown;
    };
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(update);
      return;
    }
    update();
  }, []);
}

export interface ViewTransitionProps {
  /** 共享元素名：更新前后同名的元素会被浏览器自动衔接（对应 CSS view-transition-name） */
  name: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** 为元素标记共享元素名（等价于 CSS 的 view-transition-name） */
export function ViewTransition({ name, children, className, style }: ViewTransitionProps) {
  // React 的 CSSProperties 尚未收录该属性，显式断言
  const styleWithVT = { ...style, viewTransitionName: name } as React.CSSProperties;
  return (
    <motion.div className={className} style={styleWithVT}>
      {children}
    </motion.div>
  );
}
