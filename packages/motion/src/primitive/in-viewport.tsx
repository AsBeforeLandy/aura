'use client';

/**
 * 进入视口触发：包装任意内容，进入视口时淡入上移。
 * 与 Reveal 的区别：InViewport 语义是「触发器」，Reveal 是「揭示样式」——
 * 需要自定义进场形态（缩放、滑入等）时用 InViewport 包 motion 子元素。
 */

import { motion, type HTMLMotionProps } from 'motion/react';
import { motionDurations, motionEases, type DurationToken } from '../tokens';

export interface InViewportProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport' | 'transition'> {
  /** 只播放一次；默认 true */
  once?: boolean;
  /** IntersectionObserver rootMargin（提前/延后触发） */
  margin?: string;
  duration?: DurationToken;
  /** 进场位移距离（px）；0 则只淡入 */
  offset?: number;
}

export function InViewport({
  once = true,
  margin = '0px 0px -64px 0px',
  duration = 'normal',
  offset = 16,
  style,
  children,
  ...rest
}: InViewportProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin }}
      transition={{ duration: motionDurations[duration], ease: motionEases.decelerate }}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
