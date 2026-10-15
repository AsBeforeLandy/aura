'use client';

/**
 * 进入视口时揭示（精修版）：
 * - variant="fade"（默认）：淡入上移，向后兼容；
 * - variant="blur"：blur 8px→0 对焦质感（进场瞬间的一次性短时 filter 动画）；
 * - variant="mask"：外层 overflow hidden，内容从下方升起（Linear/Apple 风格）；
 * - variant="scale"：0.96→1 卡片揭示。
 * 错峰改为递增步进（0.08 + 0.04*i 累加），多卡片依次揭示节奏更有层次。
 */

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { motionDurations, motionEases, type DurationToken } from '../tokens';

export type RevealVariant = 'fade' | 'blur' | 'mask' | 'scale';

export interface RevealProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'> {
  /** 兄弟 Reveal 的序号，自动换算递增错峰延迟；缺省 0 */
  index?: number;
  /** 显式延迟（秒），与 index 二选一 */
  delay?: number;
  /** 揭示形态；默认 fade（向后兼容） */
  variant?: RevealVariant;
  duration?: DurationToken;
  /** 视口判定边距，负值提前/正值延后触发；同 IntersectionObserver rootMargin */
  margin?: string;
  /** 是否只播放一次；默认 true（滚回上方不重播） */
  once?: boolean;
  /** mask 形态下内容升起距离（px） */
  rise?: number;
}

/** 递增错峰：基础步距 0.08s，每多一项额外 +0.04s（0, 0.12, 0.28, 0.48...） */
function staggerDelay(index: number, delay?: number): number {
  if (delay !== undefined) return delay;
  let t = 0;
  for (let i = 0; i < index; i += 1) t += 0.08 + i * 0.04;
  return t;
}

export function Reveal({
  index = 0,
  delay,
  variant = 'fade',
  duration = 'normal',
  margin = '0px 0px -64px 0px',
  once = true,
  rise = 24,
  style,
  children,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const transition = {
    duration: reduced ? 0 : motionDurations[duration],
    ease: motionEases.decelerate,
    delay: reduced ? 0 : staggerDelay(index, delay),
  };

  if (reduced) {
    return (
      <div style={style} {...rest}>
        {children}
      </div>
    );
  }

  // mask 形态：外层裁切容器淡入，内层内容从下方升起（时长略放大以显层次）
  if (variant === 'mask') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once, margin }}
        transition={transition}
        style={{ overflow: 'hidden', ...style }}
        {...rest}
      >
        <motion.div
          initial={{ y: rise }}
          whileInView={{ y: 0 }}
          viewport={{ once, margin }}
          transition={{ ...transition, duration: motionDurations[duration] * 1.15 }}
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }

  const initialByVariant =
    variant === 'blur'
      ? { opacity: 0, y: 16, filter: 'blur(8px)' }
      : variant === 'scale'
        ? { opacity: 0, scale: 0.96, y: 8 }
        : { opacity: 0, y: 16 };

  const animateByVariant =
    variant === 'blur'
      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
      : variant === 'scale'
        ? { opacity: 1, scale: 1, y: 0 }
        : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initialByVariant}
      animate={animateByVariant}
      whileInView={animateByVariant}
      viewport={{ once, margin }}
      transition={transition}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
