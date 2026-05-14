# Aura 组件库 — Plan 1: 基础设施与主题系统

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Aura 组件库的基础设施 — Design Tokens、主题系统、共享工具函数、测试框架、项目重命名，以及 Button 组件改造。

**Architecture:** CSS Variables 实现 Design Tokens，ThemeProvider 通过 `data-theme` 属性切换亮/暗模式。所有 Token 定义在 `@aura/shared` 的 TypeScript 中，同时生成 CSS 变量文件。组件使用 Less 编写样式，引用 CSS 变量实现主题化。

**Tech Stack:** React 18 + TypeScript + Less + CSS Variables + Vitest + dumi 2 + pnpm workspaces

**Spec:** `docs/superpowers/specs/2026-05-14-aura-component-library-design.md`

---

## File Structure

```
packages/shared/src/
├── tokens.ts              # Design Token 定义（TypeScript 对象）
├── utils.ts               # 工具函数（classNames 等）
└── index.ts               # 统一导出

packages/ui/src/
├── theme/
│   ├── tokens.css         # CSS 变量（亮色 + 暗色）
│   ├── ThemeProvider.tsx   # 主题 Provider
│   ├── useTheme.ts         # 主题 hook
│   └── index.ts            # theme 导出
├── button/
│   ├── index.tsx           # Button 组件（改造后）
│   ├── index.less          # Button 样式（改造后）
│   └── demo/
│       └── basic.tsx       # Button demo（改造后）
├── index.ts               # 统一导出
└── index.less             # 全局样式导入

package.json               # 根 package.json（更新名称/脚本）
packages/shared/package.json  # 更新名称
packages/ui/package.json     # 更新名称
packages/request/package.json # 更新名称
tsconfig.json              # 根 tsconfig
vitest.config.ts           # 测试配置
```

---

## Task 1: 安装测试框架 Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: 安装 vitest 和 jsdom**

```bash
cd /Users/landy/GitHub-program/aura
pnpm add -Dw vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: 创建 vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/*/src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@aura/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@aura/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@aura/request': path.resolve(__dirname, 'packages/request/src'),
    },
  },
});
```

- [ ] **Step 3: 在根 package.json 添加 test 脚本**

在 `package.json` 的 `scripts` 中添加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 验证 vitest 可运行**

```bash
cd /Users/landy/GitHub-program/aura
pnpm test
```

Expected: vitest 启动，0 tests found（正常，还没有测试文件）

- [ ] **Step 5: 提交**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml
git commit -m "chore: add vitest testing framework"
```

---

## Task 2: 项目重命名 — 所有 package.json 中的 name 改为 aura 前缀

**Files:**
- Modify: `package.json`
- Modify: `packages/shared/package.json`
- Modify: `packages/ui/package.json`
- Modify: `packages/request/package.json`

- [ ] **Step 1: 更新根 package.json**

将 `name` 字段从 `"aura-ui"` 改为 `"aura"`，description 改为 `"Aura - 基于 React 18 的现代化 AI 友好组件库"`。

- [ ] **Step 2: 确认子包名称**

确认各子包 `package.json` 中的 `name` 已为：
- `packages/shared/package.json`: `"@aura/shared"`
- `packages/ui/package.json`: `"@aura/ui"`
- `packages/request/package.json`: `"@aura/request"`

如果已经是则无需改动。

- [ ] **Step 3: 更新 README.md**

将 README.md 中的项目名称更新为 Aura，更新描述。

- [ ] **Step 4: 更新 dumi 配置中的标题**

在 `.dumirc.ts` 中更新 `themeConfig` 的 `title` 为 `"Aura"`。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "chore: rename project to Aura"
```

---

## Task 3: Design Tokens — TypeScript 定义

**Files:**
- Create: `packages/shared/src/tokens.ts`

- [ ] **Step 1: 编写 tokens 测试**

Create: `packages/shared/src/tokens.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { auraTokens, generateCSSVariables } from './tokens';

describe('auraTokens', () => {
  it('should have primary color scale 50-950', () => {
    for (let i = 50; i <= 950; i += 100) {
      expect(auraTokens.colors.primary[i]).toBeDefined();
    }
  });

  it('should have gray color scale 50-950', () => {
    for (let i = 50; i <= 950; i += 100) {
      expect(auraTokens.colors.gray[i]).toBeDefined();
    }
  });

  it('should have semantic colors', () => {
    expect(auraTokens.colors.success).toBeDefined();
    expect(auraTokens.colors.warning).toBeDefined();
    expect(auraTokens.colors.error).toBeDefined();
    expect(auraTokens.colors.info).toBeDefined();
  });

  it('should have spacing scale 1-12', () => {
    expect(auraTokens.spacing[1]).toBe(4);
    expect(auraTokens.spacing[12]).toBe(48);
  });

  it('should have radius tokens', () => {
    expect(auraTokens.radius.sm).toBe('6px');
    expect(auraTokens.radius.md).toBe('10px');
    expect(auraTokens.radius.lg).toBe('14px');
    expect(auraTokens.radius.xl).toBe('20px');
    expect(auraTokens.radius.full).toBe('9999px');
  });

  it('should have shadow tokens including glow', () => {
    expect(auraTokens.shadow.sm).toBeDefined();
    expect(auraTokens.shadow.md).toBeDefined();
    expect(auraTokens.shadow.lg).toBeDefined();
    expect(auraTokens.shadow.glow).toContain('rgba(124,58,237');
  });

  it('should have font size tokens', () => {
    expect(auraTokens.fontSize.xs).toBe('12px');
    expect(auraTokens.fontSize.md).toBe('14px');
  });

  it('should have duration tokens', () => {
    expect(auraTokens.duration.fast).toBe('150ms');
    expect(auraTokens.duration.normal).toBe('200ms');
    expect(auraTokens.duration.slow).toBe('300ms');
  });
});

describe('generateCSSVariables', () => {
  it('should generate --aura-prefixed CSS variable declarations', () => {
    const css = generateCSSVariables();
    expect(css).toContain('--aura-primary-50');
    expect(css).toContain('--aura-primary-950');
    expect(css).toContain('--aura-spacing-1');
    expect(css).toContain('--aura-radius-md');
    expect(css).toContain('--aura-shadow-glow');
  });

  it('should wrap in :root selector', () => {
    const css = generateCSSVariables();
    expect(css).toContain(':root');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
pnpm test packages/shared/src/tokens.test.ts
```

Expected: FAIL — `./tokens` 模块不存在

- [ ] **Step 3: 实现 tokens.ts**

Create: `packages/shared/src/tokens.ts`

```typescript
export const auraTokens = {
  colors: {
    primary: {
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
    },
    gray: {
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
    },
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
  },
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
    glow: '0 0 20px rgba(124, 58, 237, 0.3)',
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
} as const;

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
  const lightVars = flattenTokens(auraTokens as unknown as Record<string, unknown>);
  return `:root {\n${lightVars.join('\n')}\n}`;
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
pnpm test packages/shared/src/tokens.test.ts
```

Expected: ALL PASS

- [ ] **Step 5: 提交**

```bash
git add packages/shared/src/tokens.ts packages/shared/src/tokens.test.ts
git commit -m "feat(shared): add design token definitions with CSS variable generation"
```

---

## Task 4: 共享工具函数完善

**Files:**
- Modify: `packages/shared/src/utils.ts`（从 index.ts 拆出）
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: 编写工具函数测试**

Create: `packages/shared/src/utils.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { prefixCls, classNames, debounce, throttle, isEmpty } from './utils';

describe('prefixCls', () => {
  it('should return aura- prefixed class name', () => {
    expect(prefixCls('btn')).toBe('aura-btn');
    expect(prefixCls('btn-primary')).toBe('aura-btn-primary');
  });
});

describe('classNames', () => {
  it('should join truthy class names', () => {
    expect(classNames('a', 'b', 'c')).toBe('a b c');
  });

  it('should filter falsy values', () => {
    expect(classNames('a', null, undefined, false, '', 'b')).toBe('a b');
  });

  it('should handle empty input', () => {
    expect(classNames()).toBe('');
  });
});

describe('debounce', () => {
  it('should delay function execution', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('should limit function calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('isEmpty', () => {
  it('should return true for null and undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty string, array, and object', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
pnpm test packages/shared/src/utils.test.ts
```

Expected: FAIL — `./utils` 模块不存在

- [ ] **Step 3: 创建 utils.ts，从 index.ts 拆出**

Create: `packages/shared/src/utils.ts`

```typescript
export function prefixCls(name: string): string {
  return `aura-${name}`;
}

export function classNames(...args: (string | null | undefined | false)[]): string {
  return args.filter(Boolean).join(' ');
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function throttle<T extends (...args: unknown[]) => void>(fn: T, interval: number): T {
  let lastTime = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  }) as T;
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    return true;
  return false;
}
```

- [ ] **Step 4: 更新 index.ts 重新导出**

Replace `packages/shared/src/index.ts`:

```typescript
export { prefixCls, classNames, debounce, throttle, isEmpty } from './utils';
export { auraTokens, generateCSSVariables } from './tokens';
export type { AuraTokens } from './tokens';
```

- [ ] **Step 5: 运行测试验证通过**

```bash
pnpm test packages/shared/src/utils.test.ts
```

Expected: ALL PASS

- [ ] **Step 6: 提交**

```bash
git add packages/shared/src/
git commit -m "feat(shared): split utils from index, add token exports"
```

---

## Task 5: CSS Variables — tokens.css（亮色 + 暗色）

**Files:**
- Create: `packages/ui/src/theme/tokens.css`

- [ ] **Step 1: 编写 tokens.css 测试**

Create: `packages/ui/src/theme/tokens.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

function parseCSSVariables(css: string, selector: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const regex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]+)\\}`, 's');
  const match = css.match(regex);
  if (!match) return vars;
  const decls = match[1];
  const varRegex = /--([\w-]+)\s*:\s*([^;]+)/g;
  let m;
  while ((m = varRegex.exec(decls)) !== null) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

describe('tokens.css', () => {
  let css: string;

  beforeAll(async () => {
    const fs = await import('fs');
    css = fs.readFileSync(
      require('path').resolve(__dirname, './tokens.css'),
      'utf-8',
    );
  });

  it('should have :root with light theme variables', () => {
    const vars = parseCSSVariables(css, ':root');
    expect(vars['aura-primary-700']).toBe('#7c3aed');
    expect(vars['aura-radius-md']).toBe('10px');
    expect(vars['aura-spacing-4']).toBe('16px');
  });

  it('should have [data-theme="dark"] with dark theme overrides', () => {
    const vars = parseCSSVariables(css, '[data-theme="dark"]');
    expect(vars['aura-primary-700']).toBeDefined();
    expect(vars['aura-bg']).toBeDefined();
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
pnpm test packages/ui/src/theme/tokens.test.ts
```

Expected: FAIL — tokens.css 不存在

- [ ] **Step 3: 创建 tokens.css**

Create: `packages/ui/src/theme/tokens.css`

```css
/* ===== Aura Design Tokens — Light Theme (Default) ===== */
:root {
  /* Primary — Violet */
  --aura-primary-50: #faf5ff;
  --aura-primary-100: #f3e8ff;
  --aura-primary-200: #e9d5ff;
  --aura-primary-300: #d8b4fe;
  --aura-primary-400: #c084fc;
  --aura-primary-500: #a855f7;
  --aura-primary-600: #9333ea;
  --aura-primary-700: #7c3aed;
  --aura-primary-800: #6d28d9;
  --aura-primary-900: #5b21b6;
  --aura-primary-950: #3b0764;

  /* Gray */
  --aura-gray-50: #f9fafb;
  --aura-gray-100: #f3f4f6;
  --aura-gray-200: #e5e7eb;
  --aura-gray-300: #d1d5db;
  --aura-gray-400: #9ca3af;
  --aura-gray-500: #6b7280;
  --aura-gray-600: #4b5563;
  --aura-gray-700: #374151;
  --aura-gray-800: #1f2937;
  --aura-gray-900: #111827;
  --aura-gray-950: #030712;

  /* Semantic Colors */
  --aura-success: #10b981;
  --aura-success-light: #d1fae5;
  --aura-warning: #f59e0b;
  --aura-warning-light: #fef3c7;
  --aura-error: #ef4444;
  --aura-error-light: #fee2e2;
  --aura-info: #3b82f6;
  --aura-info-light: #dbeafe;

  /* Background */
  --aura-bg: #ffffff;
  --aura-bg-secondary: #f9fafb;
  --aura-bg-tertiary: #f3f4f6;

  /* Text */
  --aura-text: #111827;
  --aura-text-secondary: #6b7280;
  --aura-text-tertiary: #9ca3af;
  --aura-text-inverse: #ffffff;

  /* Border */
  --aura-border: #e5e7eb;
  --aura-border-hover: #d1d5db;

  /* Spacing */
  --aura-spacing-1: 4px;
  --aura-spacing-2: 8px;
  --aura-spacing-3: 12px;
  --aura-spacing-4: 16px;
  --aura-spacing-5: 20px;
  --aura-spacing-6: 24px;
  --aura-spacing-7: 28px;
  --aura-spacing-8: 32px;
  --aura-spacing-9: 36px;
  --aura-spacing-10: 40px;
  --aura-spacing-11: 44px;
  --aura-spacing-12: 48px;

  /* Border Radius */
  --aura-radius-sm: 6px;
  --aura-radius-md: 10px;
  --aura-radius-lg: 14px;
  --aura-radius-xl: 20px;
  --aura-radius-full: 9999px;

  /* Shadows */
  --aura-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --aura-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --aura-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --aura-shadow-glow: 0 0 20px rgba(124, 58, 237, 0.3);

  /* Font Size */
  --aura-font-size-xs: 12px;
  --aura-font-size-sm: 13px;
  --aura-font-size-md: 14px;
  --aura-font-size-lg: 16px;
  --aura-font-size-xl: 18px;
  --aura-font-size-2xl: 20px;
  --aura-font-size-3xl: 24px;

  /* Duration */
  --aura-duration-fast: 150ms;
  --aura-duration-normal: 200ms;
  --aura-duration-slow: 300ms;
  --aura-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== Dark Theme ===== */
[data-theme="dark"] {
  --aura-primary-50: #3b0764;
  --aura-primary-100: #4c1d95;
  --aura-primary-200: #5b21b6;
  --aura-primary-300: #6d28d9;
  --aura-primary-400: #7c3aed;
  --aura-primary-500: #8b5cf6;
  --aura-primary-600: #a78bfa;
  --aura-primary-700: #c4b5fd;
  --aura-primary-800: #ddd6fe;
  --aura-primary-900: #ede9fe;
  --aura-primary-950: #faf5ff;

  --aura-gray-50: #030712;
  --aura-gray-100: #111827;
  --aura-gray-200: #1f2937;
  --aura-gray-300: #374151;
  --aura-gray-400: #4b5563;
  --aura-gray-500: #6b7280;
  --aura-gray-600: #9ca3af;
  --aura-gray-700: #d1d5db;
  --aura-gray-800: #e5e7eb;
  --aura-gray-900: #f3f4f6;
  --aura-gray-950: #f9fafb;

  --aura-success: #34d399;
  --aura-success-light: rgba(16, 185, 129, 0.15);
  --aura-warning: #fbbf24;
  --aura-warning-light: rgba(245, 158, 11, 0.15);
  --aura-error: #f87171;
  --aura-error-light: rgba(239, 68, 68, 0.15);
  --aura-info: #60a5fa;
  --aura-info-light: rgba(59, 130, 246, 0.15);

  --aura-bg: #0f0c29;
  --aura-bg-secondary: #1a1a3e;
  --aura-bg-tertiary: #252550;

  --aura-text: #f3f4f6;
  --aura-text-secondary: #9ca3af;
  --aura-text-tertiary: #6b7280;
  --aura-text-inverse: #111827;

  --aura-border: rgba(139, 92, 246, 0.2);
  --aura-border-hover: rgba(139, 92, 246, 0.4);

  --aura-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  --aura-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
  --aura-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
  --aura-shadow-glow: 0 0 20px rgba(124, 58, 237, 0.4);
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
pnpm test packages/ui/src/theme/tokens.test.ts
```

Expected: ALL PASS

- [ ] **Step 5: 提交**

```bash
git add packages/ui/src/theme/tokens.css packages/ui/src/theme/tokens.test.ts
git commit -m "feat(ui): add CSS variable tokens for light and dark themes"
```

---

## Task 6: ThemeProvider 和 useTheme

**Files:**
- Create: `packages/ui/src/theme/ThemeProvider.tsx`
- Create: `packages/ui/src/theme/useTheme.ts`
- Create: `packages/ui/src/theme/index.ts`

- [ ] **Step 1: 编写 ThemeProvider 测试**

Create: `packages/ui/src/theme/ThemeProvider.test.tsx`

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import React from 'react';

describe('ThemeProvider', () => {
  it('should render children', () => {
    const { getByText } = render(
      <ThemeProvider theme="light">
        <div>Hello</div>
      </ThemeProvider>,
    );
    expect(getByText('Hello')).toBeDefined();
  });

  it('should set data-theme="dark" on document root when theme="dark"', () => {
    render(
      <ThemeProvider theme="dark">
        <div>Dark</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should set data-theme="light" when theme="light"', () => {
    render(
      <ThemeProvider theme="light">
        <div>Light</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

describe('useTheme', () => {
  it('should return current theme', () => {
    let currentTheme: string | undefined;
    const Consumer = () => {
      const { theme } = useTheme();
      currentTheme = theme;
      return null;
    };

    render(
      <ThemeProvider theme="dark">
        <Consumer />
      </ThemeProvider>,
    );
    expect(currentTheme).toBe('dark');
  });

  it('should toggle theme', () => {
    let result: ReturnType<typeof useTheme>;
    const Consumer = () => {
      result = useTheme();
      return null;
    };

    render(
      <ThemeProvider theme="light">
        <Consumer />
      </ThemeProvider>,
    );
    result!.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
pnpm test packages/ui/src/theme/ThemeProvider.test.tsx
```

Expected: FAIL — `./ThemeProvider` 模块不存在

- [ ] **Step 3: 实现 ThemeProvider.tsx**

Create: `packages/ui/src/theme/ThemeProvider.tsx`

```tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export { ThemeContext };

interface ThemeProviderProps {
  theme?: Theme;
  defaultTheme?: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({ theme: controlledTheme, defaultTheme = 'light', children }: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<Theme>(defaultTheme);
  const theme = controlledTheme ?? internalTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setInternalTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setInternalTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

- [ ] **Step 4: 创建 useTheme.ts 重新导出**

Create: `packages/ui/src/theme/useTheme.ts`

```typescript
export { useTheme } from './ThemeProvider';
```

- [ ] **Step 5: 创建 theme/index.ts 统一导出**

Create: `packages/ui/src/theme/index.ts`

```typescript
export { ThemeProvider, useTheme } from './ThemeProvider';
export type { Theme } from './ThemeProvider';
import './tokens.css';
```

- [ ] **Step 6: 运行测试验证通过**

```bash
pnpm test packages/ui/src/theme/ThemeProvider.test.tsx
```

Expected: ALL PASS

- [ ] **Step 7: 提交**

```bash
git add packages/ui/src/theme/
git commit -m "feat(ui): add ThemeProvider and useTheme hook"
```

---

## Task 7: 改造 Button 组件

**Files:**
- Modify: `packages/ui/src/button/index.tsx`
- Modify: `packages/ui/src/button/index.less`

- [ ] **Step 1: 编写 Button 测试**

Create: `packages/ui/src/button/index.test.tsx`

```tsx
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from './index';

describe('Button', () => {
  it('should render with children', () => {
    const { getByText } = render(<Button>Click</Button>);
    expect(getByText('Click')).toBeDefined();
  });

  it('should render default variant', () => {
    const { getByRole } = render(<Button>Default</Button>);
    const btn = getByRole('button');
    expect(btn.classList.contains('aura-btn')).toBe(true);
  });

  it('should render primary variant', () => {
    const { getByRole } = render(<Button variant="primary">Primary</Button>);
    const btn = getByRole('button');
    expect(btn.classList.contains('aura-btn-primary')).toBe(true);
  });

  it('should render with size', () => {
    const { getByRole } = render(<Button size="lg">Large</Button>);
    const btn = getByRole('button');
    expect(btn.classList.contains('aura-btn-lg')).toBe(true);
  });

  it('should be disabled', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    expect(getByRole('button').disabled).toBe(true);
  });

  it('should show loading state', () => {
    const { getByRole } = render(<Button loading>Loading</Button>);
    const btn = getByRole('button');
    expect(btn.classList.contains('aura-btn-loading')).toBe(true);
    expect(btn.disabled).toBe(true);
  });

  it('should handle onClick', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not fire onClick when disabled', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button disabled onClick={onClick}>Click</Button>);
    fireEvent.click(getByText('Click'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should support all variants', () => {
    const variants = ['default', 'primary', 'dashed', 'text', 'link'] as const;
    variants.forEach((variant) => {
      const { unmount, getByRole } = render(<Button variant={variant}>{variant}</Button>);
      const btn = getByRole('button');
      expect(btn.classList.contains('aura-btn')).toBe(true);
      if (variant !== 'default') {
        expect(btn.classList.contains(`aura-btn-${variant}`)).toBe(true);
      }
      unmount();
    });
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
pnpm test packages/ui/src/button/index.test.tsx
```

Expected: FAIL — Button 不使用新 props 接口

- [ ] **Step 3: 重写 Button 组件**

Replace `packages/ui/src/button/index.tsx`:

```tsx
import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体样式
   *  @default 'default'
   */
  variant?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
  /** 按钮尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中，显示旋转图标 */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      disabled = false,
      loading = false,
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const cls = classNames(
      prefixCls('btn'),
      variant !== 'default' && prefixCls(`btn-${variant}`),
      prefixCls(`btn-${size}`),
      loading && prefixCls('btn-loading'),
      className,
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cls}
        disabled={disabled || loading}
        onClick={handleClick}
        {...rest}
      >
        {loading && <span className={prefixCls('btn-loading-icon')} />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
```

- [ ] **Step 4: 重写 Button 样式**

Replace `packages/ui/src/button/index.less`:

```less
.aura-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--aura-spacing-2);
  padding: 8px 16px;
  font-size: var(--aura-font-size-md);
  font-family: inherit;
  line-height: 1.5;
  border: 1px solid var(--aura-border);
  border-radius: var(--aura-radius-md);
  background: var(--aura-bg);
  color: var(--aura-text);
  cursor: pointer;
  transition: all var(--aura-duration-normal) var(--aura-easing);
  user-select: none;
  white-space: nowrap;

  &:hover {
    border-color: var(--aura-primary-700);
    color: var(--aura-primary-700);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--aura-primary-200);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // Variants
  &&-primary {
    background: var(--aura-primary-700);
    border-color: var(--aura-primary-700);
    color: var(--aura-text-inverse);

    &:hover {
      background: var(--aura-primary-600);
      border-color: var(--aura-primary-600);
      color: var(--aura-text-inverse);
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px var(--aura-primary-200);
    }
  }

  &&-dashed {
    border-style: dashed;
  }

  &&-text {
    border: none;
    background: transparent;

    &:hover {
      background: var(--aura-bg-secondary);
    }
  }

  &&-link {
    border: none;
    background: transparent;
    color: var(--aura-primary-700);

    &:hover {
      color: var(--aura-primary-600);
    }
  }

  // Sizes
  &&-sm {
    padding: 4px 12px;
    font-size: var(--aura-font-size-sm);
    border-radius: var(--aura-radius-sm);
  }

  &&-lg {
    padding: 10px 24px;
    font-size: var(--aura-font-size-lg);
    border-radius: var(--aura-radius-lg);
  }

  // Loading
  &-loading {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &-loading-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: aura-spin 0.6s linear infinite;
  }
}

@keyframes aura-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Dark mode glow
[data-theme="dark"] {
  .aura-btn {
    &:focus-visible {
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2), 0 0 20px rgba(124, 58, 237, 0.15);
    }

    &-primary {
      &:hover {
        box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
      }
    }
  }
}
```

- [ ] **Step 5: 更新 demo 文件**

Replace `packages/ui/src/button/demo/basic.tsx`:

```tsx
import React from 'react';
import { Button } from '../index';

const Demo: React.FC = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
    <Button variant="default">Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="dashed">Dashed</Button>
    <Button variant="text">Text</Button>
    <Button variant="link">Link</Button>
    <Button variant="primary" size="sm">Small</Button>
    <Button variant="primary" size="lg">Large</Button>
    <Button disabled>Disabled</Button>
    <Button loading>Loading</Button>
  </div>
);

export default Demo;
```

- [ ] **Step 6: 更新 ui/src/index.ts 导出 theme**

Replace `packages/ui/src/index.ts`:

```typescript
export { ThemeProvider, useTheme } from './theme';
export type { Theme } from './theme';
export { Button } from './button';
export type { ButtonProps } from './button';
```

- [ ] **Step 7: 运行测试验证通过**

```bash
pnpm test packages/ui/src/button/index.test.tsx
```

Expected: ALL PASS

- [ ] **Step 8: 启动 dumi 验证视觉效果**

```bash
pnpm dev
```

在浏览器中确认 Button 各变体和尺寸显示正确。

- [ ] **Step 9: 提交**

```bash
git add packages/ui/src/
git commit -m "feat(ui): refactor Button with design tokens, new variant API, and theme support"
```

---

## Task 8: 全量测试运行与最终验证

**Files:** 无新增

- [ ] **Step 1: 运行全量测试**

```bash
pnpm test
```

Expected: ALL PASS — tokens.test, utils.test, tokens.test(Theme), ThemeProvider.test, Button.test

- [ ] **Step 2: TypeScript 编译检查**

```bash
pnpm exec tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: dumi 文档站验证**

```bash
pnpm dev
```

确认：
- Button 各变体渲染正确
- 亮/暗模式可切换（通过 dumi 内置主题切换）
- 暗色模式下 Button 有光晕效果

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "chore: plan 1 complete — foundation and theme system ready"
```

---

## Self-Review

**Spec coverage:**
- ✅ Design Tokens (TypeScript) — Task 3
- ✅ Design Tokens (CSS Variables) — Task 5
- ✅ 亮/暗双模式主题 — Task 5, 6
- ✅ ThemeProvider + useTheme — Task 6
- ✅ 共享工具函数 — Task 4
- ✅ Button 改造（新 variant/size API） — Task 7
- ✅ 项目重命名 — Task 2
- ✅ 测试框架 — Task 1
- ✅ BEM 命名 + prefixCls — Task 4, 7
- ✅ AI 友好 JSDoc — Task 7
- ⏳ 其余 36 个组件 — Plan 2/3/4
- ⏳ AI 4 层架构 — Plan 5

**Placeholder scan:** 无 TBD/TODO

**Type consistency:**
- `ButtonProps.variant` 使用 `'default' | 'primary' | 'dashed' | 'text' | 'link'`
- `ButtonProps.size` 使用 `'sm' | 'md' | 'lg'`
- `prefixCls('btn')` → `'aura-btn'`，与 BEM 命名一致
- CSS 变量名与 tokens.ts 中 generateCSSVariables 生成的一致
