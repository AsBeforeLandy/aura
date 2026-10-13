'use client';

/**
 * 路由转场：Next.js App Router 的 `template.tsx` 模式。
 *
 * ```tsx
 * // app/template.tsx —— PageTransition 从本包入口导入
 * 'use client';
 * export default function Template({ children }: { children: React.ReactNode }) {
 *   return <PageTransition transitionKey={usePathname()}>{children}</PageTransition>;
 * }
 * ```
 */

import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';
import { motionDurations, motionEases, type DurationToken } from '../tokens';

export interface PageTransitionProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition'> {
  /** 路由标识（如 usePathname() 的返回值）；变化即触发转场 */
  transitionKey: string;
  /** wait = 旧页退完新页再进；sync = 交叉过渡（需要父容器相对定位） */
  mode?: 'wait' | 'sync';
  duration?: DurationToken;
}

export function PageTransition({
  transitionKey,
  mode = 'wait',
  duration = 'normal',
  style,
  children,
  ...rest
}: PageTransitionProps) {
  return (
    <AnimatePresence mode={mode} initial={false}>
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: motionDurations[duration], ease: motionEases.standard }}
        style={mode === 'sync' ? { position: 'relative', ...style } : style}
        {...rest}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
