'use client';

/**
 * 时间线编排：进入视口后按 `at`（秒，相对序列起点）依次触发各 Step。
 * loop / 倒放的完整编排器属 M3；本版覆盖"依次揭示"这一最高频场景。
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { motionDurations, motionEases, type DurationToken } from '../tokens';

const TimelineContext = createContext<{ playing: boolean }>({ playing: false });

export interface TimelineProps {
  children: ReactNode;
  /** 进入视口自动播放；默认 true。false 时配合受控 state 手动触发 */
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Timeline({ children, autoplay = true, className, style }: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!autoplay) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPlaying(true);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);

  return (
    <TimelineContext.Provider value={{ playing }}>
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    </TimelineContext.Provider>
  );
}

export interface TimelineStepProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'> {
  /** 相对序列起点的触发时刻（秒） */
  at: number;
  duration?: DurationToken;
}

function TimelineStepBase({ at, duration = 'normal', ...rest }: TimelineStepProps) {
  const { playing } = useContext(TimelineContext);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={playing ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{
        duration: motionDurations[duration],
        ease: motionEases.decelerate,
        delay: playing ? at : 0,
      }}
      {...rest}
    />
  );
}

export const TimelineWithStep = Timeline as typeof Timeline & {
  Step: typeof TimelineStepBase;
};
TimelineWithStep.Step = TimelineStepBase;

/**
 * 命令式编排：按绝对时刻（秒）调度多个元素的动画，支持并行与精确时序。
 *
 * ```ts
 * const play = useSequence();
 * const onClick = () => play([
 *   { at: 0,   target: cardRef,  to: { scale: 1.06 } },
 *   { at: 0.2, target: badgeRef, to: { opacity: 1, y: 0 } },
 * ]);
 * ```
 */

import { animate } from 'motion/react';
import { useCallback } from 'react';

const waitMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface SequenceStep {
  /** 绝对触发时刻（秒） */
  at: number;
  target: React.RefObject<HTMLElement | null>;
  to: Record<string, number | string>;
  options?: { duration?: number; ease?: [number, number, number, number] };
}

export function useSequence() {
  return useCallback(async (steps: SequenceStep[]) => {
    const start = performance.now();
    await Promise.all(
      steps.map(async (step) => {
        const wait = step.at * 1000 - (performance.now() - start);
        if (wait > 0) await waitMs(wait);
        if (step.target.current) {
          await animate(step.target.current, step.to, {
            duration: 0.4,
            ...step.options,
          });
        }
      }),
    );
  }, []);
}
