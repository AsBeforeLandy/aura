'use client';

/**
 * 数字滚动：计数器、金额、指标变化。
 *
 * value 变化时从**当前值**弹簧过渡到新值（流式场景不会从 0 重播）；
 * reduced-motion 下直接呈现终值。
 */

import { useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { motionSprings, type SpringToken } from '../tokens';

export interface NumberTickerProps {
  /** 目标数值；变化时从当前展示值过渡过去 */
  value: number;
  /** 数字格式化；默认按 zh-CN 千分位取整 */
  format?: (n: number) => string;
  /** 弹簧档位；'spring' 稳定、'bouncy' 轻微回弹 */
  spring?: SpringToken;
  /** reduced-motion 时也用它渲染终值 */
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export function NumberTicker({
  value,
  format = (n: number) => Math.round(n).toLocaleString('zh-CN'),
  spring = 'spring',
  className,
  style,
  ...rest
}: NumberTickerProps) {
  const reduced = useReducedMotion();
  const raw = useMotionValue(value);
  const springed = useSpring(raw, motionSprings[spring]);
  const text = useTransform(springed, (v: number) => format(v));

  useEffect(() => {
    raw.set(value);
  }, [value, raw]);

  if (reduced) {
    return (
      <span className={className} style={style} {...rest}>
        {format(value)}
      </span>
    );
  }

  return (
    <motion.span className={className} style={style} {...rest}>
      {text}
    </motion.span>
  );
}
