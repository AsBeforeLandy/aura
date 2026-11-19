---
toc: content
---

# 主题定制

Aura 使用 CSS Variables 作为 Design Token 的载体，支持灵活的主题定制。

## 设计令牌

所有设计令牌都以 `--aura-` 为前缀，包含以下类别：

| 类别   | 前缀                        | 示例                                                   |
| ------ | --------------------------- | ------------------------------------------------------ |
| 主色   | `--aura-primary-50` ~ `950` | `--aura-primary-700: #7c3aed`                          |
| 灰阶   | `--aura-gray-50` ~ `950`    | `--aura-gray-100: #f3f4f6`                             |
| 语义色 | `--aura-success` 等         | `--aura-error: #ef4444`                                |
| 背景   | `--aura-bg` 等              | `--aura-bg: #ffffff`                                   |
| 文字   | `--aura-text` 等            | `--aura-text: #111827`                                 |
| 边框   | `--aura-border` 等          | `--aura-border: #e5e7eb`                               |
| 派生色 | `--aura-selection-*`        | `--aura-selection-bg: rgba(124, 58, 237, 0.22)`        |
| 圆角   | `--aura-radius-*`           | `--aura-radius-md: 10px`                               |
| 阴影   | `--aura-shadow-*`           | `--aura-shadow-glow: 0 0 20px rgba(124, 58, 237, 0.3)` |
| 间距   | `--aura-spacing-*`          | `--aura-spacing-4: 16px`                               |
| 字号   | `--aura-font-size-*`        | `--aura-font-size-md: 14px`                            |
| 动画   | `--aura-duration-*`         | `--aura-duration-normal: 200ms`                        |

## 主题体系：模式 × 色板

主题由两个正交维度组成，均为 `<html>` 上的 data 属性：

- **`data-mode`**：`light`（默认）| `dark` —— 明暗模式
- **`data-palette`**：`violet`（默认）| `ocean` | `sunset` —— 色板

两个维度自由组合出 6 套主题，未设置任何属性时回落到 **light × violet**：

| 色板                  | Light                        | Dark                                     |
| --------------------- | ---------------------------- | ---------------------------------------- |
| Violet 紫罗兰（默认） | `data-mode="light"` 或不设置 | `data-mode="dark"`                       |
| Ocean 海洋蓝          | `data-palette="ocean"`       | `data-mode="dark" data-palette="ocean"`  |
| Sunset 落日橙         | `data-palette="sunset"`      | `data-mode="dark" data-palette="sunset"` |

```css
/* light × violet（默认，无需任何属性） */
:root {
  --aura-primary-700: #7c3aed;
  --aura-bg: #ffffff;
}

/* dark × violet（历史选择器保留兼容，等价于 data-mode="dark"） */
[data-theme='dark'] {
  --aura-primary-700: #c4b5fd;
  --aura-bg: #0f0c29;
}

/* light × ocean */
[data-palette='ocean'] {
  --aura-primary-700: #2563eb;
  --aura-bg: #ffffff;
}

/* dark × ocean */
[data-mode='dark'][data-palette='ocean'] {
  --aura-primary-700: #93c5fd;
  --aura-bg: #0b1120;
}

/* light × sunset */
[data-palette='sunset'] {
  --aura-primary-700: #ea580c;
  --aura-bg: #ffffff;
}

/* dark × sunset */
[data-mode='dark'][data-palette='sunset'] {
  --aura-primary-700: #fdba74;
  --aura-bg: #191210;
}
```

**色板设计说明**：

- 各色板的 `--aura-primary-700` 是主视觉锚点（按钮/开关/标签的主色），Ocean 取
  Tailwind blue-600（`#2563eb`）、Sunset 取 Tailwind orange-600（`#ea580c`），与
  Violet（`#7c3aed` = violet-600）同规则。
- Ocean 中性阶换 Slate 冷灰；Sunset 中性阶换 Stone 暖灰。
- Sunset 的 warning 调深琥珀（`#ca8a04`）、error 调深红（`#dc2626`），避免与橙色
  主色撞车；Ocean 语义色与默认一致。
- 暗色模式下主色梯度倒序：浅档做按钮底色、深字，保证对比度。

> **兼容性**：历史选择器 `[data-theme="dark"]` 仍然有效（等价于 dark × violet），
> 既有代码无需迁移。新旧属性同时设置时，双轴选择器（更高优先级）生效。

> **换主色时记得同步派生色**：`--aura-selection-bg`（拖拽选区遮罩底色）、
> `--aura-x-*` 系列（AI 组件强调色/气泡/聚焦环）、暗色 `--aura-border` 等
> 派生令牌是主色的透明变体。每个内置色板都已完整覆盖它们；自定义新色板时若
> 不同步覆盖，选区遮罩和 AI 气泡会残留上一套主色。这正是把派生色做成独立令牌
> 的原因——换肤只需改令牌，无需改组件样式。

## ThemeProvider

使用 `ThemeProvider` 进行主题管理（当前版本仅管理 `light | dark` 模式，即
默认 Violet 色板；多色板切换 API 将随主题切换功能一并提供，此前可先用
`document.documentElement.setAttribute` 直接控制 `data-mode` / `data-palette`）：

```tsx | pure
import { ThemeProvider, useTheme } from '@aura-react-comp/ui';

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
import { useTheme } from '@aura-react-comp/ui';

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
  --aura-primary-700: #2563eb; /* 改为蓝色 */
  --aura-radius-md: 8px; /* 调整圆角 */
}

[data-theme='dark'] {
  --aura-primary-700: #60a5fa;
  --aura-bg: #0a0a0a;
}
```

> **换主色时记得同步派生色**：`--aura-selection-bg`（拖拽选区遮罩底色）等
> 派生令牌是主色的透明变体，默认值写死为默认主色。改主色后若不同步覆盖它，
> 遮罩会仍是紫罗兰色。这正是把派生色做成独立令牌的原因——换肤只需改令牌，
> 无需改组件样式。

## BEM 类名

所有组件样式使用 BEM 命名规范，前缀为 `aura-`：

```css
/* Block */
.aura-btn {
}

/* Element */
.aura-btn .aura-btn-icon {
}

/* Modifier */
.aura-btn-primary {
}
.aura-btn-sm {
}
.aura-btn-loading {
}
.aura-btn-disabled {
}
```

通过类名覆盖组件样式时，建议保持 BEM 结构不变，只修改属性值。
