---
toc: content
---

# 主题定制

Aura 使用 CSS Variables 作为 Design Token 的载体，支持灵活的主题定制。

## 设计令牌

所有设计令牌都以 `--aura-` 为前缀，包含以下类别：

| 类别 | 前缀 | 示例 |
| --- | --- | --- |
| 主色 | `--aura-primary-50` ~ `950` | `--aura-primary-700: #7c3aed` |
| 灰阶 | `--aura-gray-50` ~ `950` | `--aura-gray-100: #f3f4f6` |
| 语义色 | `--aura-success` 等 | `--aura-error: #ef4444` |
| 背景 | `--aura-bg` 等 | `--aura-bg: #ffffff` |
| 文字 | `--aura-text` 等 | `--aura-text: #111827` |
| 边框 | `--aura-border` 等 | `--aura-border: #e5e7eb` |
| 圆角 | `--aura-radius-*` | `--aura-radius-md: 10px` |
| 阴影 | `--aura-shadow-*` | `--aura-shadow-glow: 0 0 20px rgba(124, 58, 237, 0.3)` |
| 间距 | `--aura-spacing-*` | `--aura-spacing-4: 16px` |
| 字号 | `--aura-font-size-*` | `--aura-font-size-md: 14px` |
| 动画 | `--aura-duration-*` | `--aura-duration-normal: 200ms` |

## 亮色 / 暗色模式

Aura 默认为亮色模式。暗色模式通过 `[data-theme="dark"]` 选择器激活：

```css
/* 亮色（默认） */
:root {
  --aura-primary-700: #7c3aed;
  --aura-bg: #ffffff;
  --aura-text: #111827;
}

/* 暗色 */
[data-theme="dark"] {
  --aura-primary-700: #c4b5fd;
  --aura-bg: #0f0c29;
  --aura-text: #f3f4f6;
}
```

## ThemeProvider

使用 `ThemeProvider` 进行主题管理：

```tsx | pure
import { ThemeProvider, useTheme } from '@aura/ui';

// 受控模式
const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme} onChange={setTheme}>
      <Content />
    </ThemeProvider>
  );
};

// 非受控模式
const App = () => (
  <ThemeProvider defaultTheme="light">
    <Content />
  </ThemeProvider>
);
```

在组件内通过 `useTheme` 获取当前主题：

```tsx | pure
import { useTheme } from '@aura/ui';

const MyComponent = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      当前主题：{theme}
    </button>
  );
};
```

## 自定义令牌

覆盖 CSS Variables 即可自定义主题：

```css
/* 全局覆盖 */
:root {
  --aura-primary-700: #2563eb;  /* 改为蓝色 */
  --aura-radius-md: 8px;        /* 调整圆角 */
}

[data-theme="dark"] {
  --aura-primary-700: #60a5fa;
  --aura-bg: #0a0a0a;
}
```

## BEM 类名

所有组件样式使用 BEM 命名规范，前缀为 `aura-`：

```css
/* Block */
.aura-btn { }

/* Element */
.aura-btn .aura-btn-icon { }

/* Modifier */
.aura-btn-primary { }
.aura-btn-sm { }
.aura-btn-loading { }
.aura-btn-disabled { }
```

通过类名覆盖组件样式时，建议保持 BEM 结构不变，只修改属性值。
