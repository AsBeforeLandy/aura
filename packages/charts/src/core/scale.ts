/**
 * 刻度与坐标映射内核。
 *
 * 设计原则：
 *   1. 纯函数、零 DOM 依赖 —— 可在 SSR / 测试环境中直接跑；
 *   2. 只描述「数据域 ↔ 像素域」的映射关系，不关心渲染方式，
 *      因此同一套 scale 可同时供 SVG 与 Canvas 渲染器消费；
 *   3. 刻度算法不引入 d3-scale 依赖（包体积 + 版本风险），
 *      但采用与之等价的「1 / 2 / 2.5 / 5 / 10 × 10^n」取整策略，
 *      保证出图结果符合工程直觉。
 */

/** 数据域 */
export type Extent = [number, number];

export interface LinearScale {
  readonly type: 'linear';
  readonly domain: Extent;
  readonly range: Extent;
  /** 数据 → 像素 */
  scale(value: number): number;
  /** 像素 → 数据 */
  invert(px: number): number;
  /** 生成落在 domain 内的刻度值 */
  ticks(count?: number): number[];
  /** 把 domain 向外扩展到「好看的刻度边界」 */
  nice(count?: number): LinearScale;
  /** 复制一份并覆盖部分参数 */
  copy(overrides?: Partial<LinearScaleOptions>): LinearScale;
}

export interface LinearScaleOptions {
  domain: Extent;
  range: Extent;
  /** 是否对 domain 做 nice 处理，默认关闭 */
  nice?: boolean | number;
  /** 刻度基准步长，用于强制对齐（如强制以 10 为步长） */
  tickStep?: number;
}

export interface BandScale {
  readonly type: 'band';
  readonly domain: readonly string[];
  readonly range: Extent;
  /** 单个 band 的宽度 */
  readonly bandWidth: number;
  /** 相邻 band 起点的间距 */
  readonly step: number;
  /** 分类 → band 左边界像素；未知分类返回 undefined */
  scale(value: string): number | undefined;
  /** band 中心像素 */
  center(value: string): number | undefined;
  ticks(): string[];
}

export interface BandScaleOptions {
  domain: readonly string[];
  range: Extent;
  /** 组内间距占比，0 表示柱子紧贴 */
  paddingInner?: number;
  /** 组外间距占比 */
  paddingOuter?: number;
}

export interface PointScale {
  readonly type: 'point';
  readonly domain: readonly string[];
  readonly range: Extent;
  scale(value: string): number | undefined;
  ticks(): string[];
}

/**
 * 把任意步长收敛到「人类友好」的值：
 * 1.0 / 2.0 / 2.5 / 5.0 × 10^n。
 */
export function niceStep(rawStep: number): number {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(rawStep));
  const base = 10 ** exponent;
  const fraction = rawStep / base;

  let niceFraction: number;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * base;
}

/** 浮点累加会产生 0.30000000000000004，统一按步长精度截断 */
function roundToStep(value: number, step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number(value.toFixed(Math.min(12, decimals)));
}

/**
 * 在 [min, max] 内生成刻度。
 *
 * @param count 期望的刻度数量（实际数量会因取整而围绕它浮动）
 */
export function linearTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];

  const step = niceStep((max - min) / Math.max(1, count));
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  // 容忍浮点误差，避免边界刻度被漏掉
  const epsilon = step * 1e-9;
  for (let value = start; value <= max + epsilon; value += step) {
    out.push(roundToStep(value, step));
  }
  return out;
}

/** 把 domain 扩展到刻度边界 */
export function niceExtent(min: number, max: number, count = 5): Extent {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    // 退化情况：给一个对称的呼吸空间，避免 0 高度图
    const pad = Math.abs(min) || 1;
    return [min - pad * 0.5, max + pad * 0.5];
  }
  const step = niceStep((max - min) / Math.max(1, count));
  return [
    roundToStep(Math.floor(min / step) * step, step),
    roundToStep(Math.ceil(max / step) * step, step),
  ];
}

export function createLinearScale(options: LinearScaleOptions): LinearScale {
  let [min, max] = options.domain;
  // 防御：反向域（如 0 到 -100）同样要能正确映射
  if (min === max) max = min + 1;

  const [r0, r1] = options.range;

  const build = (
    domain: Extent,
    range: Extent,
    tickStep?: number,
  ): LinearScale => {
    const [d0, d1] = domain;
    const [p0, p1] = range;
    const span = d1 - d0 || 1;

    const scaleFn = (value: number) => p0 + ((value - d0) / span) * (p1 - p0);
    const invertFn = (px: number) => d0 + ((px - p0) / (p1 - p0 || 1)) * span;

    const ticksFn = (count = 5): number[] => {
      if (tickStep) {
        const out: number[] = [];
        const start = Math.ceil(d0 / tickStep) * tickStep;
        for (let v = start; v <= d1 + tickStep * 1e-9; v += tickStep) {
          out.push(roundToStep(v, tickStep));
        }
        return out;
      }
      return linearTicks(d0, d1, count);
    };

    const self: LinearScale = {
      type: 'linear',
      domain,
      range,
      scale: scaleFn,
      invert: invertFn,
      ticks: ticksFn,
      nice(count) {
        const [n0, n1] = niceExtent(d0, d1, count ?? 5);
        return build([n0, n1], range, tickStep);
      },
      copy(overrides) {
        return createLinearScale({
          domain: overrides?.domain ?? domain,
          range: overrides?.range ?? range,
          nice: overrides?.nice,
          tickStep: overrides?.tickStep ?? tickStep,
        });
      },
    };
    return self;
  };

  const base = build([min, max], [r0, r1], options.tickStep);
  if (options.nice) {
    return base.nice(typeof options.nice === 'number' ? options.nice : 5);
  }
  return base;
}

/**
 * 分类坐标（band）：每个分类占一个等宽区间，柱子/分组柱靠它定位。
 *
 * 公式与 d3.scaleBand 一致（align 固定 0.5，即整体居中）：
 *   step       = range / (n - paddingInner + paddingOuter * 2)
 *   bandWidth  = step * (1 - paddingInner)
 */
export function createBandScale(options: BandScaleOptions): BandScale {
  const domain = options.domain;
  const [r0, r1] = options.range;
  const paddingInner = clamp(options.paddingInner ?? 0.2);
  const paddingOuter = clamp(options.paddingOuter ?? 0.1);
  const n = domain.length;

  const span = r1 - r0;
  const step =
    n > 0 ? span / Math.max(1, n - paddingInner + paddingOuter * 2) : 0;
  const bandWidth = Math.max(0, step * (1 - paddingInner));
  const start = r0 + (span - step * (n - paddingInner)) / 2;

  const index = new Map<string, number>();
  domain.forEach((key, i) => {
    if (!index.has(key)) index.set(key, i);
  });

  return {
    type: 'band',
    domain,
    range: options.range,
    bandWidth,
    step,
    scale(value) {
      const i = index.get(value);
      return i === undefined ? undefined : start + step * i;
    },
    center(value) {
      const i = index.get(value);
      return i === undefined ? undefined : start + step * i + bandWidth / 2;
    },
    ticks: () => [...domain],
  };
}

/**
 * 点坐标（point）：分类落在刻度线上而非区间内，折线图/散点图用它。
 */
export function createPointScale(options: BandScaleOptions): PointScale {
  const domain = options.domain;
  const [r0, r1] = options.range;
  const padding = clamp(options.paddingOuter ?? 0.5);
  const n = domain.length;

  const span = r1 - r0;
  const denom = Math.max(1, n - 1 + padding * 2);
  const step = n > 1 ? span / denom : 0;
  const start = n > 1 ? r0 + step * padding : (r0 + r1) / 2;

  const index = new Map<string, number>();
  domain.forEach((key, i) => {
    if (!index.has(key)) index.set(key, i);
  });

  return {
    type: 'point',
    domain,
    range: options.range,
    scale(value) {
      const i = index.get(value);
      if (i === undefined) return undefined;
      return n > 1 ? start + step * i : (r0 + r1) / 2;
    },
    ticks: () => [...domain],
  };
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/** 根据一组数值求 [min, max]，忽略 null / NaN */
export function extentOf(
  values: readonly (number | null | undefined)[],
): Extent {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value === null || value === undefined || Number.isNaN(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min === Infinity) return [0, 1];
  return [min, max];
}

/**
 * 数值轴默认要包含 0 基线（柱状图必须如此，否则柱子长度失真）。
 */
export function extentWithZero(
  values: readonly (number | null | undefined)[],
): Extent {
  const [min, max] = extentOf(values);
  return [Math.min(0, min), Math.max(0, max)];
}
