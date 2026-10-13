'use client';

/**
 * 令牌驱动的关键帧循环/播放。
 *
 * 白名单属性（合成器友好）：opacity、scale、x、y、rotate、rotateX、rotateY、skewX、skewY。
 * 传入白名单外的属性会在开发环境告警（不阻断渲染）。
 */

import { motion, type HTMLMotionProps } from 'motion/react';
import { motionDurations, motionEases, type DurationToken, type EaseToken } from '../tokens';

/** 允许做关键帧动画的属性白名单（全部为 transform/opacity 家族） */
export const KEYFRAMES_ALLOWED_PROPS = new Set([
  'opacity',
  'scale',
  'x',
  'y',
  'rotate',
  'rotateX',
  'rotateY',
  'skewX',
  'skewY',
]);

export interface KeyframesProps
  extends Omit<HTMLMotionProps<'div'>, 'animate' | 'transition'> {
  /** 关键帧数组：如 { scale: [1, 1.08, 1] }、{ opacity: [1, 0.4, 1] } */
  animate: Record<string, (number | string)[]>;
  duration?: DurationToken;
  ease?: EaseToken;
  /** 重复次数；Infinity 表示无限循环 */
  repeat?: number;
  /** 每轮之间的停顿（秒） */
  repeatDelay?: number;
}

export function Keyframes({
  animate,
  duration = 'normal',
  ease = 'standard',
  repeat = 0,
  repeatDelay = 0,
  ...rest
}: KeyframesProps) {
  if (process.env.NODE_ENV !== 'production') {
    for (const key of Object.keys(animate)) {
      if (!KEYFRAMES_ALLOWED_PROPS.has(key)) {
        // 开发期告警：非合成器友好属性会造成布局抖动
        console.warn(
          `[motion] Keyframes 仅支持合成器友好属性，收到 "${key}"。` +
            `允许：${[...KEYFRAMES_ALLOWED_PROPS].join(', ')}`,
        );
      }
    }
  }
  return (
    <motion.div
      animate={animate}
      transition={{
        duration: motionDurations[duration],
        ease: motionEases[ease],
        repeat,
        repeatDelay,
      }}
      {...rest}
    />
  );
}
