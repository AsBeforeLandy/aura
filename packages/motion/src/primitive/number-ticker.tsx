'use client';

/**
 * 数字滚动（精修版）：计数器、金额、指标变化。
 *
 * 精修点：**逐位独立弹簧**——每一位数字各自弹簧过渡并按位错峰（默认 40ms/位），
 * 大数字滚动时呈现层次而非整体糊动；千分位逗号静态占位；
 * 容器默认 `fontVariantNumeric: tabular-nums` 消除数字宽度抖动。
 *
 * value 变化时从当前位值过渡到新值；位数变化时新增位从 0 滚入；
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
  /** 目标数值；变化时从当前位值过渡过去 */
  value: number;
  /** 数字格式化；默认按 zh-CN 千分位取整 */
  format?: (n: number) => string;
  /** 弹簧档位；'spring' 稳定、'bouncy' 轻微回弹 */
  spring?: SpringToken;
  /** 位间错峰延迟（秒/位）；默认 0.04 */
  stagger?: number;
  /** 挂载时是否从 0 滚入（false 则直接呈现） */
  fromZero?: boolean;
  /** reduced-motion 时也用它渲染终值 */
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/** 单个数字位：独立弹簧 + 错峰延迟 */
function DigitColumn({
  target,
  delay,
  spring,
  fromZero,
}: {
  target: number;
  delay: number;
  spring: SpringToken;
  fromZero: boolean;
}) {
  const raw = useMotionValue(fromZero ? 0 : target);
  const springed = useSpring(raw, motionSprings[spring]);
  const text = useTransform(springed, (v: number) => String(Math.round(v)));

  useEffect(() => {
    raw.set(target);
  }, [target, raw]);

  return <motion.span>{text}</motion.span>;
}

export function NumberTicker({
  value,
  format = (n: number) => Math.round(n).toLocaleString('zh-CN'),
  spring = 'spring',
  stagger = 0.04,
  fromZero = true,
  className,
  style,
  ...rest
}: NumberTickerProps) {
  const reduced = useReducedMotion();
  const chars = format(value).split('');

  if (reduced) {
    return (
      <span className={className} style={style} {...rest}>
        {format(value)}
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
      {...rest}
    >
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <DigitColumn
            key={`${i}-${chars.length}`}
            target={Number(c)}
            delay={i * stagger}
            spring={spring}
            fromZero={fromZero}
          />
        ) : (
          <span key={`${i}-${chars.length}`}>{c}</span>
        ),
      )}
    </span>
  );
}
