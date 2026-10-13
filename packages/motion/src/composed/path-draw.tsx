'use client';

/**
 * SVG 路径描边：logo / 插画 / 图表线条的"一笔画出"效果。
 * 支持 loop 与多条路径的顺序衔接。
 */

import { motion } from 'motion/react';
import { motionDurations, motionEases, type DurationToken, type EaseToken } from '../tokens';

export interface PathDrawProps {
  /** 一条或多条 SVG path 的 d 属性；多条时按顺序描边 */
  paths: string[];
  /** SVG viewBox */
  viewBox?: string;
  width?: number | string;
  /** 描边颜色（stroke） */
  stroke?: string;
  strokeWidth?: number;
  /** 每条路径的描边时长（秒），或令牌档位名 */
  duration?: number | DurationToken;
  /** 循环：true 无限；数字为次数；默认不循环（画完保持） */
  loop?: boolean | number;
  ease?: EaseToken;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PathDraw({
  paths,
  viewBox = '0 0 100 100',
  width = 120,
  stroke = 'currentColor',
  strokeWidth = 2,
  duration = 'slow',
  loop = false,
  ease = 'decelerate',
  delay = 0,
  className,
  style,
}: PathDrawProps) {
  const seconds = typeof duration === 'number' ? duration : motionDurations[duration];
  const repeat = loop === true ? Infinity : (loop as number) || 0;
  return (
    <svg
      viewBox={viewBox}
      width={width}
      fill="none"
      className={className}
      style={style}
      aria-hidden
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: seconds,
            ease: motionEases[ease],
            delay: delay + i * seconds,
            repeat,
            repeatDelay: paths.length * seconds,
          }}
        />
      ))}
    </svg>
  );
}
