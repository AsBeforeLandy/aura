// 设计令牌 - Aura UI 设计系统的核心变量定义

const primaryScale = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7c3aed',
  800: '#6d28d9',
  900: '#5b21b6',
  950: '#3b0764',
} as Record<number, string>;

const grayScale = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
} as Record<number, string>;

export const auraTokens = {
  colors: {
    primary: primaryScale,
    gray: grayScale,
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
  } as Record<number, number>,
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(124,58,237, 0.3)',
  },
  fontSize: {
    xs: '12px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
  },
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export type AuraTokens = typeof auraTokens;

function flattenTokens(tokens: Record<string, unknown>, prefix = '--aura'): string[] {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(tokens)) {
    const varName = `${prefix}-${key}`;
    if (typeof value === 'object' && value !== null) {
      lines.push(...flattenTokens(value as Record<string, unknown>, varName));
    } else {
      lines.push(`  ${varName}: ${value};`);
    }
  }
  return lines;
}

export function generateCSSVariables(): string {
  // 对于 CSS 变量，颜色部分的 key 前缀跳过 'colors' 层级
  // 这样 --aura-colors-primary-50 变成 --aura-primary-50
  const { colors, ...rest } = auraTokens as unknown as Record<string, unknown>;
  const colorVars = flattenTokens(colors as Record<string, unknown>, '--aura');
  const restVars = flattenTokens(rest, '--aura');
  return `:root {\n${[...colorVars, ...restVars].join('\n')}\n}`;
}
