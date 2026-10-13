'use client';

/**
 * 进入视口时揭示：滚动浏览场景的默认进场（淡入 + 上移 16px）。
 *
 * 多个 Reveal 需要依次揭示时，用 `index` 传入序号（内部换算为 delay）；
 * 复杂的时序编排请用 `<Timeline>`。
 */

import { motion, type HTMLMotionProps } from 'motion/react';
import { motionDurations, motionEases, type DurationToken } from '../tokens';
import { useReducedMotion } from 'motion/react';

export interface RevealProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'> {
  /** 兄弟 Reveal 的序号，自动换算 80ms 步进延迟；缺省 0 */
  index?: number;
  /** 显式延迟（秒），与 index 二选一 */
  delay?: number;
  duration?: DurationToken;
  /** 视口判定边距，负值提前/正值延后触发；同 IntersectionObserver rootMargin */
  margin?: string;
  /** 是否只播放一次；默认 true（滚回上方不重播） */
  once?: boolean;
}

export function Reveal({
  index = 0,
  delay,
  duration = 'normal',
  margin = '0px 0px -64px 0px',
  once = true,
  style,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const resolvedDelay = delay ?? index * 0.08;
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin }}
      transition={{
        duration: reduced ? 0 : motionDurations[duration],
        ease: motionEases.decelerate,
        delay: reduced ? 0 : resolvedDelay,
      }}
      style={style}
      {...rest}
    />
  );
}
