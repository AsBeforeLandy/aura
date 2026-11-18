/**
 * v2.1 多色等亮度色板：6 色相 × 3 档明度 = 18 色。
 *
 * 与 v2.0 单色紫阶并存、按数据类型分工（见 docs/charts-colors.md）：
 *   · 单系列数值型（Bar3D 柱阵 / Voxel3D / 漏斗）→ v2.0 紫阶 400→700
 *   · 多系列 / 分类维度（分组柱 / Scatter3D 类别 / 多曲线）→ v2.1 矩阵
 *   · 连续曲面（Surface3D）→ 青 → 靛 → 品牌紫（唯一允许跨色相渐变）
 *   · 大屏深色 → v2.0 高对比 + SKY 阶梯
 *
 * 每一行 6 色等感知亮度（WCAG 对白对比度极差 ≤ 0.06:1）；
 * 每一列锁一个色相——彩色来自「系列」，不来自「数值」。
 *
 * 暖色（amber / rose）侧面降明度要少压一档（压狠了偏土棕），
 * 冷色 0.84/0.70、暖色 0.88/0.74 —— three 的真实光照下由引擎处理，
 * 这组系数供伪 3D（SVG 多边形）手绘场景使用。
 */

export interface MultihueLevel {
  /** D1 浅 / D2 中 / D3 深 */
  level: 'd1' | 'd2' | 'd3';
  hex: string;
  /** 对白对比度（约值） */
  contrast: number;
}

export interface MultihueHue {
  name: string;
  /** 色相角度 */
  hue: number;
  /** 是否暖色（侧面降明度少压一档） */
  warm: boolean;
  levels: [MultihueLevel, MultihueLevel, MultihueLevel];
}

export const MULTIHUE_HUES: MultihueHue[] = [
  {
    name: 'violet',
    hue: 258,
    warm: false,
    levels: [
      { level: 'd1', hex: '#B8A1ED', contrast: 2.24 },
      { level: 'd2', hex: '#9E7FE7', contrast: 3.16 },
      { level: 'd3', hex: '#7E54DE', contrast: 4.99 },
    ],
  },
  {
    name: 'sky',
    hue: 198,
    warm: false,
    levels: [
      { level: 'd1', hex: '#5CB9E0', contrast: 2.22 },
      { level: 'd2', hex: '#279BCC', contrast: 3.16 },
      { level: 'd3', hex: '#1E779E', contrast: 5.01 },
    ],
  },
  {
    name: 'emerald',
    hue: 158,
    warm: false,
    levels: [
      { level: 'd1', hex: '#25C48A', contrast: 2.25 },
      { level: 'd2', hex: '#1FA473', contrast: 3.17 },
      { level: 'd3', hex: '#187F59', contrast: 4.98 },
    ],
  },
  {
    name: 'amber',
    hue: 38,
    warm: true,
    levels: [
      { level: 'd1', hex: '#DBA343', contrast: 2.25 },
      { level: 'd2', hex: '#BE8624', contrast: 3.17 },
      { level: 'd3', hex: '#93681C', contrast: 4.96 },
    ],
  },
  {
    name: 'rose',
    hue: 350,
    warm: true,
    levels: [
      { level: 'd1', hex: '#EB96A4', contrast: 2.23 },
      { level: 'd2', hex: '#E3697E', contrast: 3.19 },
      { level: 'd3', hex: '#D52845', contrast: 4.98 },
    ],
  },
  {
    name: 'indigo',
    hue: 220,
    warm: false,
    levels: [
      { level: 'd1', hex: '#8FADEA', contrast: 2.25 },
      { level: 'd2', hex: '#668FE2', contrast: 3.19 },
      { level: 'd3', hex: '#346BD8', contrast: 4.95 },
    ],
  },
];

/**
 * SERIES_ORDER：图例 / 多系列 / 类别散点。
 * 色相两两跳开（258 → 198 → 158 → 38 → 350 → 220），相邻系列一眼可分。
 * 取 D2 档（对白 ≥ 3:1，满足 WCAG 非文本图形）。
 */
export const SERIES_ORDER: string[] = [
  '#9E7FE7',
  '#279BCC',
  '#1FA473',
  '#BE8624',
  '#E3697E',
  '#668FE2',
];

/**
 * CONTINUOUS_ORDER：相邻柱阵 / 环图的 X / Z 分类矩阵。
 * 按色相环序排列（220 → 258 → 350 → 38 → 158 → 198），相邻过渡柔和。
 */
export const CONTINUOUS_ORDER: string[] = [
  '#668FE2',
  '#9E7FE7',
  '#E3697E',
  '#BE8624',
  '#1FA473',
  '#279BCC',
];

/** 按系列序号取色（自动取模），多系列图表的默认类别板 */
export function seriesColor(seriesIndex: number): string {
  return SERIES_ORDER[seriesIndex % SERIES_ORDER.length];
}

/** 按色相环序取色（自动取模），分类矩阵的默认色 */
export function continuousColor(index: number): string {
  return CONTINUOUS_ORDER[index % CONTINUOUS_ORDER.length];
}
