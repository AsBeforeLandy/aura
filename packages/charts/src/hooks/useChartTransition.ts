import { useEffect, useReducer, useRef } from 'react';
import { hashMatrix, type ResolvedAnimation } from '../core/animation';

export interface ChartTransition {
  /** 插值后的数值矩阵；入场阶段直接等于目标值（生长由 progress 表达） */
  values: (number | null)[][];
  /** 入场进度 0→1，入场结束后恒为 1 */
  progress: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 图表动画状态机。
 *
 * 只做两件事，且两者互斥，避免叠加出双重缓动：
 *   · **首次挂载** → 推进 `progress`（0→1），数值保持目标值，
 *     由各图表用 staggerProgress 把 progress 映射成逐图元的位置；
 *   · **数据更新** → `progress` 恒为 1，改为在「当前显示值 → 新值」之间插值。
 *
 * 之前每次数据变化都重播入场，是「生硬」观感的主要来源：
 * 用户改一个数字，整张图却从头长一遍。
 */
export function useChartTransition(
  matrix: (number | null)[][],
  animation: ResolvedAnimation,
): ChartTransition {
  const hash = hashMatrix(matrix);

  const displayRef = useRef<(number | null)[][]>(matrix);
  const progressRef = useRef(0);
  const mountedRef = useRef(false);

  const [, forceRender] = useReducer((tick: number) => tick + 1, 0);

  useEffect(() => {
    /** 直接落到终态：无动画、时长非法、命中「减少动态效果」偏好、环境无 rAF */
    const settle = () => {
      displayRef.current = matrix;
      progressRef.current = 1;
      mountedRef.current = true;
      forceRender();
    };

    // 页面不可见时不做动画：后台标签页的 rAF 会被浏览器节流甚至暂停，
    // 此时推进动画既无意义，还可能让图表停在起始帧
    const hidden =
      typeof document !== 'undefined' && document.visibilityState === 'hidden';

    if (
      !animation.enabled ||
      animation.duration <= 0 ||
      prefersReducedMotion() ||
      hidden ||
      typeof requestAnimationFrame === 'undefined'
    ) {
      settle();
      return undefined;
    }

    const entering = !mountedRef.current;
    mountedRef.current = true;

    const from = entering ? matrix : displayRef.current;
    const to = matrix;

    /**
     * 形状变化（行数或列数不同）时不做插值。
     * 典型场景是 dataZoom 切换窗口：点数量变了，新旧数据之间没有对应关系，
     * 硬插值会让图「从 0 长出来」，比直接切换更难看。
     */
    const sameShape =
      from.length === to.length &&
      to.every((row, index) => row.length === (from[index]?.length ?? -1));

    if (entering) {
      progressRef.current = 0;
    } else if (!sameShape) {
      displayRef.current = to;
      progressRef.current = 1;
      forceRender();
      return undefined;
    }

    let frame = 0;
    let cancelled = false;
    /**
     * 时间基准用 Date.now()（墙钟）。
     *
     * 试过 rAF 回调的时间戳与 performance.now()：浏览器里两者同源，
     * 但 jsdom 等测试环境的时钟是冻结的，每帧拿到同一个值，
     * 进度会永远停在 0 —— 动画在测试里完全不推进，也就无法断言。
     * 600ms 量级用 1ms 精度完全够。
     */
    const startAt = Date.now() + animation.delay;

    const tick = () => {
      if (cancelled) return;

      const raw = Math.max(
        0,
        Math.min(1, (Date.now() - startAt) / animation.duration),
      );
      const eased = animation.ease(raw);

      if (entering) {
        // 入场：只推进进度，数值就是目标值
        progressRef.current = eased;
        displayRef.current = to;
      } else {
        // 更新：逐格插值。null 不参与插值（缺失就是缺失）
        displayRef.current = to.map((row, rowIndex) =>
          row.map((target, columnIndex) => {
            const previous = from[rowIndex]?.[columnIndex] ?? target ?? 0;
            if (target === null) return previous === null ? null : previous;
            if (previous === null) return target;
            return previous + (target - previous) * eased;
          }),
        );
        progressRef.current = 1;
      }

      forceRender();
      if (raw < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    /**
     * 兜底：rAF 在某些环境不保证持续触发（无头浏览器、后台标签页、
     * 窗口最小化、某些低功耗模式）。只靠 rAF，图表会永远停在起始帧 ——
     * 表现为「所有图元贴在基线上」，比没有动画严重得多。
     * 因此设一个略长于时长的定时器强制落到终态。
     */
    const failsafe = setTimeout(
      () => {
        if (cancelled) return;
        cancelled = true;
        progressRef.current = 1;
        displayRef.current = to;
        forceRender();
      },
      animation.delay + animation.duration + 100,
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(failsafe);
    };
    // hash 变化 = 数据变了；其余依赖变化 = 动画参数变了
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hash,
    animation.enabled,
    animation.duration,
    animation.easing,
    animation.stagger,
    animation.delay,
  ]);

  return { values: displayRef.current, progress: progressRef.current };
}
