---
name: aura-theme-customize
description: Use when customizing Aura theme tokens or implementing dark mode
---

# Aura 主题自定义指南

## Design Token 体系

Aura 使用 CSS Variables 作为 Design Token，所有样式通过 `var(--aura-xxx)` 引用。

## 覆盖方式

### 全局覆盖
```css
:root {
  --aura-primary-700: #8b5cf6; /* 修改主色 */
  --aura-radius-md: 12px;      /* 修改圆角 */
}
```

### 组件级覆盖
```css
.my-button {
  --aura-primary-700: #ec4899;
}
```

## Token 分类

| 分类 | 前缀 | 示例 |
|------|------|------|
| 主色 | --aura-primary-{50-950} | --aura-primary-700 |
| 灰色 | --aura-gray-{50-950} | --aura-gray-100 |
| 语义色 | --aura-{success/warning/error/info} | --aura-success |
| 背景 | --aura-bg{-secondary/-tertiary} | --aura-bg |
| 文字 | --aura-text{-secondary/-tertiary} | --aura-text |
| 边框 | --aura-border{-hover} | --aura-border |
| 间距 | --aura-spacing-{1-12} | --aura-spacing-4 |
| 圆角 | --aura-radius-{sm/md/lg/xl/full} | --aura-radius-md |
| 阴影 | --aura-shadow-{sm/md/lg/glow} | --aura-shadow-md |
| 字号 | --aura-font-size-{xs-3xl} | --aura-font-size-md |
| 时长 | --aura-duration-{fast/normal/slow} | --aura-duration-normal |

## 暗色模式

暗色模式通过 `[data-theme="dark"]` 选择器切换。使用 ThemeProvider：

```tsx
import { ThemeProvider, useTheme } from '@aura/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Content />
    </ThemeProvider>
  );
}

function Content() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>当前: {theme}</button>;
}
```

暗色模式特点：
- 深紫色背景（#0f0c29 → #252550）
- 组件带有紫色光晕效果（box-shadow: var(--aura-shadow-glow)）
- 边框使用半透明紫色
