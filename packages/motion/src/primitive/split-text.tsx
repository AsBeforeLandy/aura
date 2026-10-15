'use client';

/**
 * 文字拆分进场（精修版）：按字 / 词 / 行三种粒度依次入场。
 * - variant="fade"（默认）：淡入上移，向后兼容；
 * - variant="rise"：每字独立 overflow hidden 裁切，从遮罩下方升起（Linear/Apple 风格）；
 * - variant="flip"：rotateX -90° 翻牌入场（带透视）。
 * 默认 stagger 从 0.04 收紧到 0.03，长句节奏更紧凑。
 * reduced-motion 下直接渲染完整文本。
 */

import { Fragment, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { motionDurations, motionEases } from '../tokens';

type Granularity = 'char' | 'word' | 'line';
export type SplitVariant = 'fade' | 'rise' | 'flip';

export interface SplitTextProps {
  text: string;
  granularity?: Granularity;
  /** 相邻片段的步进延迟（秒） */
  stagger?: number;
  duration?: 'fast' | 'normal' | 'slow';
  /** mount 时播放（默认）；inView = 进入视口时播放 */
  mode?: 'mount' | 'inView';
  /** 入场形态；默认 fade（向后兼容） */
  variant?: SplitVariant;
  /** flip 形态的透视距离（px） */
  perspective?: number;
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
  stagger = 0.03,
  duration = 'normal',
  mode = 'mount',
  variant = 'fade',
  perspective = 600,
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

  const piece =
    variant === 'rise'
      ? {
          hidden: { y: '110%' },
          show: {
            y: '0%',
            transition: { duration: motionDurations[duration] * 1.1, ease: motionEases.decelerate },
          },
        }
      : variant === 'flip'
        ? {
            hidden: { opacity: 0, rotateX: -90 },
            show: {
              opacity: 1,
              rotateX: 0,
              transition: { duration: motionDurations[duration], ease: motionEases.decelerate },
            },
          }
        : {
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

  const containerStyle: React.CSSProperties =
    variant === 'flip' ? { display: 'inline-block', perspective, ...style } : { display: 'inline-block', ...style };
  const pieceStyle: React.CSSProperties = {
    display: 'inline-block',
    willChange: 'transform, opacity',
    ...(variant === 'rise' && granularity === 'char' ? { whiteSpace: 'pre' } : null),
  };

  return (
    <motion.span
      className={className}
      style={containerStyle}
      initial="hidden"
      variants={container}
      {...trigger}
      aria-label={text}
    >
      {parts.map((part, i) => {
        // 空白片段保留原样，不参与动画
        if (/^\s+$/.test(part)) return <Fragment key={i}>{part}</Fragment>;
        const pieceNode = (
          <motion.span variants={piece} aria-hidden style={pieceStyle}>
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
        // rise 形态：每片包一层独立 overflow hidden 裁切，实现逐字升起
        return variant === 'rise' ? (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
            {pieceNode}
          </span>
        ) : (
          <Fragment key={i}>{pieceNode}</Fragment>
        );
      })}
    </motion.span>
  );
}
