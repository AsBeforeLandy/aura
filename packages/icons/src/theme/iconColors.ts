/**
 * Purple Icon System v1.2 · 图标色彩常量（TS 版）
 *
 * 与 theme/purple-icon-color-rules.css 同源（CSS 变量给样式表场景，
 * 这份常量给 React props / 内联样式场景）。四条硬规则见 CSS 文件头：
 *   1) 多色 ≤2 色相（叙事型面性 ≤3），主对象锁 violet；
 *   2) 线性图标保持单色，层级靠 stroke-width（2.25 / 1.75），禁用 opacity；
 *   3) 单色锁 1 色相 4 档明暗，M1 只作背景、M2 需 1px 描边；
 *   4) 状态切换只覆盖 mono 四档，图标组件不改代码。
 *
 * 多色板的 6 色与 charts-3d 的 multihue SERIES_ORDER（D2 档）同源——
 * 图表系列色与图标辅助色在同一个等亮度体系里。
 */

/** 多色板：品牌紫锚点 + 5 个等亮度辅助色相（色相编码对象） */
export const ICON_MULTI = {
  /** 主对象 / 品牌符号 */
  violet: '#7C3AED',
  /** 信息 / 连接 */
  sky: '#279BCC',
  /** 完成 / 可用 */
  emerald: '#1FA473',
  /** 提醒 / 待办 */
  amber: '#BE8624',
  /** 警示 / 关注 */
  rose: '#E3697E',
  /** 结构 / 层级 */
  indigo: '#668FE2',
} as const;

/** 单色主推 · 品牌紫 4 档（浅色模式：M1 背景 → M4 深面） */
export const ICON_MONO_LIGHT = {
  /** 背景面 / 后景 · 1.22:1（仅背景，不承载识别信息） */
  m1: '#EFE5FA',
  /** 次面 / 装饰 · 2.77:1（需 1px 描边） */
  m2: '#B383FC',
  /** 主形 / 轮廓 · 5.70:1 */
  m3: '#7C3AED',
  /** 深面 / 叠压 · 11.25:1 */
  m4: '#411D9A',
} as const;

/** 单色严格 · 全档 ≥3:1，每档都可承载识别信息 */
export const ICON_MONO_STRICT = {
  s1: '#A064FA',
  s2: '#7C3AED',
  s3: '#5220C5',
  s4: '#411D9A',
} as const;

/** 中性 4 档（默认图标不用紫） */
export const ICON_MONO_NEUTRAL = {
  n1: '#E9E9EF',
  n2: '#A9A9BC',
  n3: '#44445A',
  n4: '#1B1B29',
} as const;

/** 深色模式：明度反转，M3 最亮 */
export const ICON_MONO_DARK = {
  m1: '#2A1F41',
  m2: '#5220C5',
  m3: '#B383FC',
  m4: '#DDC6FA',
} as const;

/** 线性图标线宽：层级靠线宽，禁用 opacity */
export const ICON_LINE_WIDTH = {
  main: 2.25,
  detail: 1.75,
} as const;

/** D1 浅端 / M2 次面的高光描边 */
export const ICON_FACE_STROKE = 'rgba(255, 255, 255, 0.28)';

/** 状态覆盖：只换 mono 四档，图标组件内部无需分支 */
export const ICON_STATES = {
  hover: { m1: '#EFE5FA', m2: '#B383FC', m3: '#A064FA', m4: '#411D9A' },
  active: { m1: '#DDC6FA', m2: '#B383FC', m3: '#5220C5', m4: '#311877' },
  disabled: { m1: '#D5D5E0', m2: '#D5D5E0', m3: '#D5D5E0', m4: '#D5D5E0' },
  /** 品牌底（on-brand）：整体提亮 */
  onBrand: {
    m1: 'rgba(255, 255, 255, 0.22)',
    m2: 'rgba(255, 255, 255, 0.48)',
    m3: '#FFFFFF',
    m4: '#EFE5FA',
  },
} as const;

export type IconMonoLevel = keyof (typeof ICON_MONO_LIGHT &
  typeof ICON_MONO_DARK);
