/**
 * 动效令牌 —— 单一来源。
 *
 * 与 `tokens.css` 必须保持一致（有 tokens.test.ts 守护双端漂移）。
 * 时长单位为**秒**（motion 的 duration 单位），CSS 端使用毫秒。
 */

export type DurationToken =
  'instant' | 'fast' | 'normal' | 'slow' | 'deliberate';
export type EaseToken = 'standard' | 'decelerate' | 'accelerate';
export type SpringToken = 'spring' | 'bouncy';
export type DistanceToken = 'sm' | 'md' | 'lg';

/** 过渡时长（秒）。`prefers-reduced-motion` 下由 MotionConfig 与 CSS 令牌双层归零。 */
export const motionDurations: Record<DurationToken, number> = {
  instant: 0.08,
  fast: 0.16,
  normal: 0.28,
  slow: 0.48,
  deliberate: 0.72,
};

/** cubic-bezier 缓动控制点 */
export const motionEases: Record<EaseToken, [number, number, number, number]> =
  {
    standard: [0.2, 0, 0, 1], // 默认：缓入缓出
    decelerate: [0, 0, 0, 1], // 进场：快速出发、缓慢停靠
    accelerate: [0.3, 0, 1, 1], // 退场：缓慢出发、快速离开
  };

/** 弹簧物理参数 */
export const motionSprings: Record<
  SpringToken,
  { type: 'spring'; stiffness: number; damping: number }
> = {
  spring: { type: 'spring', stiffness: 320, damping: 30 }, // 默认：稳定不弹
  bouncy: { type: 'spring', stiffness: 400, damping: 17 }, // 活泼：轻微回弹
};

/** Slide / 位移类动画的距离档位（px） */
export const motionDistances: Record<DistanceToken, number> = {
  sm: 8,
  md: 16,
  lg: 32,
};

/**
 * 彩带默认色板（霓虹系）。
 *
 * 单独放在 JS 侧：Confetti 用 canvas 2D 绘制，无法解析 CSS 变量，
 * 因此这组色值不参与 `tokens.css` 的双端一致性校验。
 * 若需要跟随主题，请通过 `Confetti` 的 `colors` 属性显式传入。
 */
export const motionConfettiColors = [
  '#7c3aed',
  '#22d3ee',
  '#3b82f6',
  '#e879f9',
  '#a855f7',
  '#06b6d4',
] as const;

export const motionTokens = {
  duration: motionDurations,
  ease: motionEases,
  spring: motionSprings,
  distance: motionDistances,
} as const;
