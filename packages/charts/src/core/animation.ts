/**
 * 动画基础设施。
 *
 * 设计目标（针对「生硬」的根因）：
 *   1. 缓动不能只有一种 —— 默认改用 easeOutQuint，尾部更慢，收得更柔和；
 *   2. 图元不能同时到齐 —— 提供 stagger（错峰），让动画「扫过」而非「弹起」；
 *   3. 数据更新不能重播入场 —— 交给 useChartTransition 做值插值。
 */

export type EasingName =
  'linear' | 'easeOutCubic' | 'easeOutQuint' | 'easeInOutCubic' | 'easeOutBack';

const easingFns: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  // 比 cubic 尾部更松：数字类、柱状生长用它的减速感最自然
  easeOutQuint: (t) => 1 - (1 - t) ** 5,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  // 轻微回弹（约 10% 过冲），仅用于环形/雷达这类「展开」动作
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
};

export function getEasing(name: EasingName): (t: number) => number {
  return easingFns[name] ?? easingFns.easeOutQuint;
}

export interface ChartAnimationOptions {
  /** 时长（毫秒） */
  duration?: number;
  /** 缓动曲线 */
  easing?: EasingName;
  /**
   * 错峰强度 0~1：最后一个图元比第一个晚多少比例的总时长开始。
   * 0 表示全部同步；0.35 表示最后一个晚 35% 开始。
   */
  stagger?: number;
  /** 整体延迟（毫秒） */
  delay?: number;
}

export interface ResolvedAnimation {
  enabled: boolean;
  duration: number;
  easing: EasingName;
  stagger: number;
  delay: number;
  ease: (t: number) => number;
}

export const DEFAULT_ANIMATION: Required<ChartAnimationOptions> = {
  duration: 620,
  easing: 'easeOutQuint',
  stagger: 0.35,
  delay: 0,
};

/** 统一解析 boolean | 配置对象 */
export function resolveAnimation(
  input?: boolean | ChartAnimationOptions,
  defaultEnabled = true,
): ResolvedAnimation {
  if (input === false) {
    return {
      enabled: false,
      duration: 0,
      easing: DEFAULT_ANIMATION.easing,
      stagger: 0,
      delay: 0,
      ease: (t) => t,
    };
  }

  const options: ChartAnimationOptions = typeof input === 'object' ? input : {};
  const easing = options.easing ?? DEFAULT_ANIMATION.easing;

  return {
    enabled: defaultEnabled,
    duration: Math.max(0, options.duration ?? DEFAULT_ANIMATION.duration),
    easing,
    stagger: clamp01(options.stagger ?? DEFAULT_ANIMATION.stagger),
    delay: Math.max(0, options.delay ?? DEFAULT_ANIMATION.delay),
    ease: getEasing(easing),
  };
}

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * 计算第 index 个元素的局部进度。
 *
 * 把全局进度 t 切成 count 段：第 i 个元素从 `stagger * i / (count-1)` 开始，
 * 在剩余 `1 - stagger` 的窗口内走完自己的 0→1。
 *
 * 这样整组图元不是「同时弹起」，而是像画笔从左到右扫过去。
 */
export function staggerProgress(
  t: number,
  index: number,
  count: number,
  stagger: number,
): number {
  if (count <= 1 || stagger <= 0) return clamp01(t);
  const delay = (stagger * index) / (count - 1);
  const span = 1 - stagger;
  if (span <= 0) return t >= delay ? 1 : 0;
  return clamp01((t - delay) / span);
}

/** 数值插值 */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** 矩阵的轻量指纹，用于判断「数据是否真的变了」 */
export function hashMatrix(
  matrix: readonly (readonly (number | null)[])[],
): number {
  let hash = matrix.length * 2654435761;
  for (const row of matrix) {
    hash = (hash * 31 + row.length) | 0;
    for (let index = 0; index < row.length; index += 1) {
      const value = row[index];
      hash = (hash * 31 + (value === null ? -1 : Math.round(value * 100))) | 0;
    }
  }
  return hash;
}
