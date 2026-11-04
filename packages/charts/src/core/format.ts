/**
 * 数值与文本格式化。
 *
 * 图表里最容易出「廉价感」的地方就是刻度：`12000` 不如 `1.2万`，
 * `0.30000000000000004` 更要命。这里统一收口。
 */

export interface NumberFormatOptions {
  /** 最多保留几位小数，默认按步长自动推断 */
  decimals?: number;
  /** 是否使用紧凑单位（万 / 亿），默认 false */
  compact?: boolean;
  /** 前缀 / 后缀，如 % 或 元 */
  prefix?: string;
  suffix?: string;
  /** 千分位，默认 true */
  thousands?: boolean;
}

/** 去掉小数末尾多余的 0 */
function trimZeros(text: string): string {
  return text.includes('.') ? text.replace(/\.?0+$/, '') : text;
}

/** 根据数值量级推断合适的小数位 */
export function inferDecimals(values: readonly number[]): number {
  let decimals = 0;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    const text = String(value);
    const dot = text.indexOf('.');
    if (dot >= 0) decimals = Math.max(decimals, text.length - dot - 1);
  }
  return Math.min(decimals, 4);
}

/** 紧凑单位：中文场景用「万 / 亿」，符合国内看板习惯 */
export function formatCompact(value: number, decimals = 1): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e8) return `${sign}${trimZeros((abs / 1e8).toFixed(decimals))}亿`;
  if (abs >= 1e4) return `${sign}${trimZeros((abs / 1e4).toFixed(decimals))}万`;
  if (abs >= 1e3) return `${sign}${trimZeros((abs / 1e3).toFixed(decimals))}k`;
  return `${sign}${trimZeros(String(abs))}`;
}

export function formatNumber(
  value: number,
  options: NumberFormatOptions = {},
): string {
  if (!Number.isFinite(value)) return '—';

  const {
    decimals,
    compact = false,
    prefix = '',
    suffix = '',
    thousands = true,
  } = options;

  if (compact)
    return `${prefix}${formatCompact(value, decimals ?? 1)}${suffix}`;

  const fixed =
    decimals === undefined ? trimZeros(String(value)) : value.toFixed(decimals);

  if (!thousands) return `${prefix}${fixed}${suffix}`;

  const [intPart, decimalPart] = fixed.split('.');
  const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${prefix}${decimalPart ? `${withSeparator}.${decimalPart}` : withSeparator}${suffix}`;
}

export function formatPercent(
  value: number,
  total: number,
  decimals = 1,
): string {
  if (!total) return '0%';
  return `${trimZeros(((value / total) * 100).toFixed(decimals))}%`;
}

/**
 * 粗略估算文本像素宽度。
 *
 * 为什么要估算而不是真实测量：布局阶段（计算 margin、判断标签是否重叠）
 * 发生在渲染之前，此时没有 DOM 可测量。用「CJK 记 1em、其余记 0.58em」
 * 的经验值足够可靠，误差被 8px 的留白吸收。
 */
export function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    // CJK 统一表意文字、全角标点、假名、韩文
    const isWide =
      (code >= 0x2e80 && code <= 0x9fff) ||
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6);
    width += isWide ? fontSize : fontSize * 0.58;
  }
  return width;
}

/** 数值补零宽度，用于让刻度标签右对齐时视觉整齐 */
export function padNumberLabels(labels: string[]): string[] {
  const width = labels.reduce((max, item) => Math.max(max, item.length), 0);
  if (width === 0) return labels;
  // 只在全部为纯数字（含符号/千分位）时补零，避免把「1月」也补成「01月」
  if (!labels.every((item) => /^-?[\d,.]+$/.test(item))) return labels;
  return labels.map((item) => item.padStart(width, ' '));
}
