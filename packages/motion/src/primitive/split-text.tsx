'use client';

/**
 * 文字拆分进场：按字 / 词 / 行三种粒度依次入场。
 * reduced-motion 下直接渲染完整文本。
 */

import { Fragment, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { motionDurations, motionEases } from '../tokens';

type Granularity = 'char' | 'word' | 'line';

export interface SplitTextProps {
  text: string;
  granularity?: Granularity;
  /** 相邻片段的步进延迟（秒） */
  stagger?: number;
  duration?: 'fast' | 'normal' | 'slow';
  /** mount 时播放（默认）；inView = 进入视口时播放 */
  mode?: 'mount' | 'inView';
  className?: string;
  /** 片段元素上附加的样式（如 inline-block 间距） */
  style?: React.CSSProperties;
}

function split(text: string, granularity: Granularity): string[] {
  if (granularity === 'char') return Array.from(text);
  if (granularity === 'word') return text.split(/(\s+)/).filter(Boolean);
  return text.split('\n');
}

export function SplitText({
  text,
  granularity = 'char',
  stagger = 0.04,
  duration = 'normal',
  mode = 'mount',
  className,
  style,
}: SplitTextProps) {
  const reduced = useReducedMotion();
  const parts = useMemo(() => split(text, granularity), [text, granularity]);

  if (reduced) {
    return (
      <span className={className} style={style}>
        {granularity === 'line'
          ? parts.map((p, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {p}
              </Fragment>
            ))
          : text}
      </span>
    );
  }

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger } },
  };
  const item = {
    hidden: { opacity: 0, y: granularity === 'line' ? 12 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: motionDurations[duration], ease: motionEases.decelerate },
    },
  };

  const trigger =
    mode === 'inView'
      ? { whileInView: 'show' as const, viewport: { once: true, margin: '0px 0px -32px 0px' } }
      : { animate: 'show' as const };

  return (
    <motion.span
      className={className}
      style={{ display: 'inline-block', ...style }}
      initial="hidden"
      variants={container}
      {...trigger}
      aria-label={text}
    >
      {parts.map((part, i) => {
        // 空白片段保留原样，不参与动画
        if (/^\s+$/.test(part)) return <Fragment key={i}>{part}</Fragment>;
        return (
          <motion.span
            key={i}
            variants={item}
            aria-hidden
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          >
            {granularity === 'line' ? (
              <>
                {i > 0 && <br />}
                {part}
              </>
            ) : (
              part
            )}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
