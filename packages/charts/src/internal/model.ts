import type { ChartDataRow, SeriesConfig, SeriesType } from '../types';
import { extentOf } from '../core/scale';
import { colorAt, type ChartTheme } from '../theme';

/**
 * 数据模型归一化。
 *
 * 图表组件不直接消费用户传入的原始 props，而是先过这一层：
 *   · 补齐缺省值（颜色、名称、类型）；
 *   · 计算堆叠基线（柱状图堆叠、面积图堆叠共用一套逻辑）；
 *   · 判定 y 轴值域。
 * 好处是所有边界情况（null、全零、单点、负值）只在这一处处理。
 */

export interface ResolvedSeries {
  config: SeriesConfig;
  index: number;
  key: string;
  name: string;
  color: string;
  type: SeriesType;
  /** 原始值，null 表示缺失 */
  values: (number | null)[];
  /** 堆叠基线，非堆叠时恒为 0 */
  base: number[];
  /** 实际绘制值 = base + value（逐点） */
  top: (number | null)[];
  visible: boolean;
  stackId?: string;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(num) ? null : num;
}

export interface ResolveSeriesOptions {
  data: ChartDataRow[];
  series: SeriesConfig[];
  theme: ChartTheme;
  defaultType: SeriesType;
  /** 显式隐藏的系列 key */
  hidden?: Set<string>;
}

export function resolveSeries(options: ResolveSeriesOptions): ResolvedSeries[] {
  const { data, series, theme, defaultType, hidden } = options;

  return series.map((config, index) => {
    const values: (number | null)[] = config.data
      ? config.data.map((v) => toNumber(v))
      : data.map((row) => toNumber(row[config.key]));

    return {
      config,
      index,
      key: config.key,
      name: config.name ?? config.key,
      color: config.color ?? colorAt(theme, index),
      type: config.type ?? defaultType,
      values,
      base: values.map(() => 0),
      top: values.slice(),
      visible: !config.hidden && !hidden?.has(config.key),
      stackId: config.stack,
    };
  });
}

/**
 * 就地计算堆叠基线。
 *
 * 正负值分开累加（与 ECharts 行为一致）：正值从 0 往上堆，
 * 负值从 0 往下堆，两者互不干扰 —— 否则「收入正、支出负」的图会错位。
 */
export function applyStacking(series: ResolvedSeries[]): void {
  const groups = new Map<string, ResolvedSeries[]>();

  for (const item of series) {
    if (!item.stackId) {
      // 非堆叠系列：base 归零，top 即原值
      item.base = item.values.map(() => 0);
      item.top = item.values.slice();
      continue;
    }
    const list = groups.get(item.stackId) ?? [];
    list.push(item);
    groups.set(item.stackId, list);
  }

  for (const group of groups.values()) {
    const length = Math.max(0, ...group.map((item) => item.values.length));
    const positive = new Array<number>(length).fill(0);
    const negative = new Array<number>(length).fill(0);

    for (const item of group) {
      const base: number[] = [];
      const top: (number | null)[] = [];
      for (let i = 0; i < length; i += 1) {
        const value = item.values[i] ?? null;
        if (value === null) {
          base.push(0);
          top.push(null);
          continue;
        }
        if (value >= 0) {
          base.push(positive[i]);
          top.push(positive[i] + value);
          positive[i] += value;
        } else {
          base.push(negative[i]);
          top.push(negative[i] + value);
          negative[i] += value;
        }
      }
      item.base = base;
      item.top = top;
    }
  }
}

/** 为未显式指定 stack 的系列自动编组（图表级 stack 开关） */
export function assignDefaultStack(
  series: ResolvedSeries[],
  enabled: boolean,
): void {
  if (!enabled) return;
  for (const item of series) {
    if (!item.stackId) item.stackId = '__default__';
  }
}

export interface DomainOptions {
  /** 只统计某一根 y 轴上的系列：0 左轴，1 右轴，不传为全部 */
  yAxisIndex?: 0 | 1;
  startFromZero?: boolean;
  min?: number;
  max?: number;
  /** 是否把 base 也纳入值域（堆叠面积图需要） */
  includeBase?: boolean;
}

/** 计算 y 轴值域 */
export function resolveYDomain(
  series: readonly ResolvedSeries[],
  options: DomainOptions = {},
): [number, number] {
  const visible = series.filter(
    (item) =>
      item.visible &&
      (options.yAxisIndex === undefined ||
        (item.config.yAxisIndex ?? 0) === options.yAxisIndex),
  );
  const pool: (number | null)[] = [];

  for (const item of visible) {
    for (let i = 0; i < item.values.length; i += 1) {
      pool.push(item.top[i]);
      if (options.includeBase) pool.push(item.base[i]);
    }
  }

  let [min, max] = extentOf(pool);

  if (options.startFromZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  if (options.min !== undefined) min = options.min;
  if (options.max !== undefined) max = options.max;

  // 全零数据的退化处理：给一个固定的可视高度，否则所有内容压在同一条线上
  if (min === 0 && max === 0) return [0, 1];

  return [min, max];
}

/** 提取 x 轴分类值，并做去重保护（重复分类会让 band 定位错乱） */
export function resolveXValues(
  data: readonly ChartDataRow[],
  xKey: string,
): string[] {
  return data.map((row) => {
    const raw = row[xKey];
    return raw === null || raw === undefined ? '' : String(raw);
  });
}

/** 按 x 索引取整行的 tooltip 载荷 */
export function buildTooltipItems(
  series: readonly ResolvedSeries[],
  index: number,
) {
  return series
    .filter((item) => item.visible)
    .map((item) => {
      const value = item.values[index] ?? null;
      const formatter = item.config.valueFormatter;
      return {
        key: item.key,
        name: item.name,
        color: item.color,
        value,
        formatted:
          value === null ? '—' : formatter ? formatter(value) : String(value),
      };
    });
}
