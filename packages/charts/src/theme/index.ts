/**
 * 图表主题体系。
 *
 * 核心诉求（来自需求）：**默认为本组件库主题，且风格可配置**。
 *
 * 实现策略：
 *   1. 不写死色值 —— 主题从 Aura 的 CSS 变量（`--aura-primary-600` 等）实时读取，
 *      因此只要宿主项目引了 `@aura-react-comp/ui/style.css`，图表天然同色；
 *   2. 读取发生在运行时（getComputedStyle），所以 `data-theme="dark"` 切换后
 *      图表会跟着变，无需额外配置；
 *   3. 提供 createChartTheme 做逐字段深合并，允许只覆盖一两个字段
 *      （比如只换色板），而不是整包替换。
 */

/** 图表主题结构：所有视觉常量集中于此，组件内不出现魔法值 */
export interface ChartTheme {
  name: string;
  /** 分类色板，按系列顺序循环取用 */
  palette: string[];
  background: string;
  font: {
    family: string;
    size: number;
    sizeSmall: number;
    weightNormal: number;
    weightMedium: number;
  };
  text: {
    primary: string;
    secondary: string;
    /** 强调色文本，与品牌主色一致 */
    accent: string;
  };
  axis: {
    line: string;
    tick: string;
    label: string;
    /** 轴线宽度 */
    lineWidth: number;
    /** 刻度线长度，0 表示不画刻度 */
    tickSize: number;
  };
  grid: {
    line: string;
    lineWidth: number;
    /** 虚线节奏，空数组表示实线 */
    dash: number[];
  };
  legend: {
    text: string;
    /** 图例被点击关闭后的文字色 */
    textInactive: string;
  };
  tooltip: {
    background: string;
    border: string;
    text: string;
    shadow: string;
    radius: number;
  };
  series: {
    lineWidth: number;
    /** 面积图填充不透明度 */
    areaOpacity: number;
    /** 散点半径 */
    symbolSize: number;
    /** 柱子圆角 */
    barRadius: number;
    /** 高亮时的额外描边宽度 */
    emphasisWidth: number;
  };
  /** 强调色（品牌主色），用于选中态、进度环等 */
  emphasis: string;
}

/** Aura 令牌的静态兜底值：SSR 或未引入 tokens.css 时保证仍能出图 */
const AURA_FALLBACK = {
  primary700: '#7c3aed',
  primary600: '#9333ea',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  bg: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
};

/**
 * 默认分类色板。
 *
 * 手工挑选而非算法生成：算法色板（HSL 均匀旋转）在黄绿区间会出现
 * 亮度骤变，多系列折线图容易有一条「看不见」。这 12 色经亮度均衡处理。
 * palette[0] 与 Aura 主色一致，保证单系列图表就是品牌紫。
 */
export const DEFAULT_PALETTE = [
  '#7c3aed', // violet — Aura 品牌主色
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#14b8a6', // teal
  '#f97316', // orange
  '#ec4899', // pink
  '#6366f1', // indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
];

function createBase(name: string, dark: boolean): ChartTheme {
  return {
    name,
    palette: DEFAULT_PALETTE,
    background: 'transparent',
    font: {
      family: AURA_FALLBACK.fontFamily,
      size: 12,
      sizeSmall: 11,
      weightNormal: 400,
      weightMedium: 500,
    },
    text: {
      primary: dark ? '#e5e7eb' : AURA_FALLBACK.textPrimary,
      secondary: dark ? '#9ca3af' : AURA_FALLBACK.textSecondary,
      accent: dark ? '#c4b5fd' : AURA_FALLBACK.primary700,
    },
    axis: {
      line: dark ? '#374151' : AURA_FALLBACK.border,
      tick: dark ? '#374151' : AURA_FALLBACK.border,
      label: dark ? '#9ca3af' : AURA_FALLBACK.textSecondary,
      lineWidth: 1,
      tickSize: 4,
    },
    grid: {
      line: dark ? 'rgba(229, 231, 235, 0.12)' : AURA_FALLBACK.border,
      lineWidth: 1,
      dash: [3, 3],
    },
    legend: {
      text: dark ? '#d1d5db' : AURA_FALLBACK.textSecondary,
      textInactive: dark ? '#4b5563' : '#d1d5db',
    },
    tooltip: {
      background: dark ? '#111827' : '#ffffff',
      border: dark ? '#374151' : AURA_FALLBACK.border,
      text: dark ? '#f3f4f6' : AURA_FALLBACK.textPrimary,
      shadow: dark
        ? '0 8px 24px rgba(0, 0, 0, 0.5)'
        : '0 8px 24px rgba(17, 24, 39, 0.12)',
      radius: 10,
    },
    series: {
      lineWidth: 2,
      areaOpacity: 0.18,
      symbolSize: 6,
      barRadius: 4,
      emphasisWidth: 3,
    },
    emphasis: dark ? '#c4b5fd' : AURA_FALLBACK.primary700,
  };
}

/** 浅色基础主题（不依赖 DOM，SSR 安全） */
export const lightTheme: ChartTheme = createBase('aura', false);
/** 暗色基础主题 */
export const darkTheme: ChartTheme = createBase('aura-dark', true);

/** 递归深合并：只覆盖传入的字段 */
function deepMerge<T>(base: T, patch?: DeepPartial<T>): T {
  if (!patch) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    if (value === undefined) continue;
    const current = out[key];
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      current &&
      typeof current === 'object' &&
      !Array.isArray(current)
    ) {
      out[key] = deepMerge(current, value as DeepPartial<typeof current>);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export interface ChartThemeOptions {
  /** 是否暗色基调，默认 false */
  dark?: boolean;
  /** 主题名，便于调试时确认命中哪个主题 */
  name?: string;
  /** 只覆盖部分字段 */
  overrides?: DeepPartial<ChartTheme>;
  /** 快捷替换整套色板 */
  palette?: string[];
}

/** 创建一个主题（以浅色/暗色基础为底，叠加覆盖项） */
export function createChartTheme(options: ChartThemeOptions = {}): ChartTheme {
  const { dark = false, name, overrides, palette } = options;
  let theme = createBase(name ?? (dark ? 'aura-dark' : 'aura'), dark);
  if (overrides) theme = deepMerge(theme, overrides);
  if (palette && palette.length) theme = { ...theme, palette };
  return theme;
}

/** 读取单个 CSS 变量，取不到时返回兜底值 */
function cssVar(
  name: string,
  fallback: string,
  element?: HTMLElement | null,
): string {
  if (typeof window === 'undefined' || typeof document === 'undefined')
    return fallback;
  const target = element ?? document.documentElement;
  if (!target) return fallback;
  const value = window.getComputedStyle(target).getPropertyValue(name).trim();
  return value || fallback;
}

/** 当前是否为暗色（以 documentElement 的 data-theme 为准，与 ui 的 ThemeProvider 一致） */
export function detectDarkMode(element?: HTMLElement | null): boolean {
  if (typeof document === 'undefined') return false;
  const host = element ?? document.documentElement;
  const explicit = host?.closest?.('[data-theme]')?.getAttribute('data-theme');
  const root = document.documentElement.getAttribute('data-theme');
  return (explicit ?? root) === 'dark';
}

/**
 * 从 Aura 的 CSS 变量读取一份主题。
 *
 * 这是「默认为本组件库主题」的落地实现：颜色不是写死的常量，
 * 而是宿主页面上真实生效的值 —— 宿主改 `--aura-primary-700`，图表跟着变。
 */
export function readAuraTheme(element?: HTMLElement | null): ChartTheme {
  const dark = detectDarkMode(element);
  const base = dark ? darkTheme : lightTheme;

  const primary = cssVar(
    '--aura-primary-700',
    dark ? '#c4b5fd' : '#7c3aed',
    element,
  );
  const textPrimary = cssVar('--aura-text', base.text.primary, element);
  const textSecondary = cssVar(
    '--aura-text-secondary',
    base.text.secondary,
    element,
  );
  const textTertiary = cssVar(
    '--aura-text-tertiary',
    dark ? '#6b7280' : '#9ca3af',
    element,
  );
  const border = cssVar('--aura-border', base.axis.line, element);
  const bgSecondary = cssVar(
    '--aura-bg-secondary',
    base.tooltip.background,
    element,
  );
  const fontFamily = cssVar('--aura-font-family', base.font.family, element);

  // 色板首色跟随品牌主色；其余保留手工调校的分类色
  const palette = [primary, ...DEFAULT_PALETTE.slice(1)];

  return {
    ...base,
    palette,
    font: { ...base.font, family: fontFamily },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      accent: primary,
    },
    axis: {
      ...base.axis,
      line: border,
      tick: border,
      label: textSecondary,
    },
    grid: {
      ...base.grid,
      line: dark ? 'rgba(229, 231, 235, 0.12)' : border,
    },
    legend: {
      text: textSecondary,
      textInactive: textTertiary,
    },
    tooltip: {
      ...base.tooltip,
      background: bgSecondary,
      border,
      text: textPrimary,
    },
    emphasis: primary,
  };
}

/** 主题输入：内置名 / 完整主题对象 / 局部覆盖 */
export type ChartThemeInput =
  'aura' | 'light' | 'dark' | ChartTheme | DeepPartial<ChartTheme>;

/** 把各种形态的主题输入归一为 ChartTheme */
export function resolveTheme(
  input?: ChartThemeInput,
  element?: HTMLElement | null,
): ChartTheme {
  if (!input) return readAuraTheme(element);
  if (typeof input === 'string') {
    if (input === 'dark') return darkTheme;
    if (input === 'light') return lightTheme;
    return readAuraTheme(element);
  }
  // 判定「完整主题」：必须带 palette 与 font 两个必填块
  const candidate = input as ChartTheme;
  if (Array.isArray(candidate.palette) && candidate.font && candidate.axis) {
    return candidate;
  }
  const dark = detectDarkMode(element);
  const base = dark ? darkTheme : readAuraTheme(element);
  return deepMerge(base, input as DeepPartial<ChartTheme>);
}

/** 按索引取色，超出色板长度时循环 */
export function colorAt(theme: ChartTheme, index: number): string {
  const palette = theme.palette.length ? theme.palette : DEFAULT_PALETTE;
  return palette[((index % palette.length) + palette.length) % palette.length];
}

/** 给颜色加透明度（支持 #rgb / #rrggbb / rgb() 三种输入） */
/** 解析 #rgb / #rrggbb / rgb() 为 [r,g,b]；失败返回 null */
export function parseColor(input: string): [number, number, number] | null {
  const value = input.trim();
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1];
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((char) => char + char)
            .join('')
        : raw;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const parts = rgb[1]
      .split(',')
      .map((part) => Number.parseFloat(part.trim()));
    if (
      parts.length >= 3 &&
      parts.slice(0, 3).every((part) => Number.isFinite(part))
    ) {
      return [parts[0], parts[1], parts[2]];
    }
  }
  return null;
}

/**
 * 颜色线性插值。
 *
 * 热力图、连续色阶需要它：给定两端颜色与 0~1 的位置，返回中间色。
 * 任一端无法解析时返回 to，避免产出非法 CSS。
 */
export function mixColor(from: string, to: string, t: number): string {
  const a = parseColor(from);
  const b = parseColor(to);
  if (!a || !b) return to;
  const ratio = t < 0 ? 0 : t > 1 ? 1 : t;
  const channel = (index: number) =>
    Math.round(a[index] + (b[index] - a[index]) * ratio);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim();

  if (hex.startsWith('#')) {
    const raw = hex.slice(1);
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((c) => c + c)
            .join('')
        : raw;
    if (full.length !== 6) return hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (hex.startsWith('rgb(')) {
    return hex.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }

  return hex;
}
