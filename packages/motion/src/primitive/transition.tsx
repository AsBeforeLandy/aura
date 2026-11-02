'use client';

/**
 * 进出场过渡四件套：Slide / Fade / Zoom / Collapse。
 *
 * 两种使用模式：
 * - **保留式**：`<Slide visible={open} />` —— DOM 常驻，visible 切换动画；
 * - **卸载式**：`{open && <Slide />}` 包在 `<AnimatePresence>` 内 —— 卸载时播退场。
 *
 * 全部只动画 transform / opacity（Collapse 的 height 是既有例外，见其 JSDoc），
 * 时长与缓动一律走动效令牌。
 *
 * 可测性：根元素暴露 `data-motion-state`（"entered" | "exited"，由 visible 派生的
 * **意图状态**——动画完成时机会略有滞后，测试断言以意图为准）。
 */

import { motion, type HTMLMotionProps } from 'motion/react';
import {
  motionDurations,
  motionDistances,
  motionEases,
  motionSprings,
  type DistanceToken,
  type DurationToken,
  type EaseToken,
} from '../tokens';

type Direction = 'up' | 'down' | 'left' | 'right';

/** 保留式显隐省略时（undefined），组件默认可见，退场交给外层 AnimatePresence */
export interface TransitionBaseProps extends Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
> {
  duration?: DurationToken;
  ease?: EaseToken;
  /**
   * 是否用弹簧物理驱动，**默认 true**。
   *
   * 弹簧是 Motion 系动效"跟手"的来源：位移/缩放看起来有质量，而不是匀速滑过去。
   * 需要与其它动画严格对齐时序（或时长可预测）时设 `false`，退回 `duration + ease`。
   * 开启弹簧时 `duration` / `ease` 不生效。
   */
  spring?: boolean;
}

/** 统一过渡：弹簧（默认）或 duration + ease */
function transitionFor(
  spring: boolean,
  duration: DurationToken,
  ease: EaseToken,
):
  | { type: 'spring'; stiffness: number; damping: number }
  | { duration: number; ease: [number, number, number, number] } {
  return spring
    ? motionSprings.spring
    : { duration: motionDurations[duration], ease: motionEases[ease] };
}

function offsetFor(direction: Direction, distance: DistanceToken) {
  const d = motionDistances[distance];
  switch (direction) {
    case 'up':
      return { y: d };
    case 'down':
      return { y: -d };
    case 'left':
      return { x: d };
    case 'right':
      return { x: -d };
  }
}

export interface SlideProps extends TransitionBaseProps {
  direction?: Direction;
  distance?: DistanceToken;
  visible?: boolean;
}

/** 位移 + 淡入淡出：抽屉、浮层、区块显隐的默认选择 */
export function Slide({
  visible = true,
  direction = 'up',
  distance = 'md',
  duration = 'normal',
  ease = 'decelerate',
  spring = true,
  style,
  ...rest
}: SlideProps) {
  const offset = offsetFor(direction, distance);
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
      exit={{ opacity: 0, ...offset }}
      transition={transitionFor(spring, duration, ease)}
      data-motion-state={visible ? 'entered' : 'exited'}
      style={style}
      {...rest}
    />
  );
}

export type FadeProps = TransitionBaseProps & { visible?: boolean };

/** 纯淡入淡出：内容位置不变，最不打扰的过渡 */
export function Fade({
  visible = true,
  duration = 'normal',
  ease = 'standard',
  spring = true,
  style,
  ...rest
}: FadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={transitionFor(spring, duration, ease)}
      data-motion-state={visible ? 'entered' : 'exited'}
      style={style}
      {...rest}
    />
  );
}

export type ZoomProps = TransitionBaseProps & {
  visible?: boolean;
  /** 收起态缩放比例，默认 0.92（足够可感知、不突兀） */
  fromScale?: number;
};

/** 缩放 + 淡入淡出：弹窗、卡片、头像等"从原点长出来"的场景 */
export function Zoom({
  visible = true,
  fromScale = 0.92,
  duration = 'normal',
  ease = 'decelerate',
  spring = true,
  style,
  ...rest
}: ZoomProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: fromScale }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : fromScale }}
      exit={{ opacity: 0, scale: fromScale }}
      transition={transitionFor(spring, duration, ease)}
      data-motion-state={visible ? 'entered' : 'exited'}
      style={style}
      {...rest}
    />
  );
}

export interface CollapseProps extends Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
> {
  open?: boolean;
  duration?: DurationToken;
}

/**
 * 高度展开/收起：折叠面板、筛选区、详情展开。
 *
 * ⚠️ 实现使用 `height: auto` 动画（motion 内部测量）——这会触发逐帧布局，
 * **不要用于长列表或页面级区域**；此类场景请改用 `<Slide>` / `<Fade>`。
 *
 * 高度动画**刻意不接弹簧**：弹簧会带来超调（高度先冲过再回落），在折叠面板里
 * 观感是"抖动"，且时长不可预测。故 Collapse 始终走 `duration + easeOut`。
 */
export function Collapse({
  open = false,
  duration = 'normal',
  style,
  children,
  ...rest
}: CollapseProps) {
  return (
    <motion.div
      initial={false}
      animate={
        open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }
      }
      exit={{ height: 0, opacity: 0 }}
      transition={{
        duration: motionDurations[duration],
        ease: motionEases.standard,
      }}
      style={{ overflow: 'hidden', ...style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
