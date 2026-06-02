---
toc: content
---

# 快速开始

## 安装

:::code-group

```bash [pnpm]
# 安装组件库
pnpm add @aura/ui

# 安装 peer dependencies（如果尚未安装）
pnpm add react@^18 react-dom@^18
```

```bash [yarn]
# 安装组件库
yarn add @aura/ui

# 安装 peer dependencies（如果尚未安装）
yarn add react@^18 react-dom@^18
```

```bash [npm]
# 安装组件库
npm install @aura/ui

# 安装 peer dependencies（如果尚未安装）
npm install react@^18 react-dom@^18
```

:::

如果需要额外的包：

:::code-group

```bash [pnpm]
# 共享工具函数
pnpm add @aura/shared

# HTTP 请求封装
pnpm add @aura/request
```

```bash [yarn]
# 共享工具函数
yarn add @aura/shared

# HTTP 请求封装
yarn add @aura/request
```

```bash [npm]
# 共享工具函数
npm install @aura/shared

# HTTP 请求封装
npm install @aura/request
```

:::

## 基本使用

引入组件和样式即可开始使用：

```tsx | pure
import { Button, Space } from '@aura/ui';
import '@aura/ui/src/theme/tokens.css';

const App = () => (
  <Space>
    <Button variant="primary">主要按钮</Button>
    <Button>默认按钮</Button>
    <Button variant="dashed">虚线按钮</Button>
    <Button variant="link">链接按钮</Button>
  </Space>
);
```

## 主题

Aura 支持**亮色**和**暗色**两种主题模式，通过 CSS Variables 控制。你可以手动切换：

```tsx | pure
// 切换到暗色模式
document.documentElement.setAttribute('data-theme', 'dark');

// 切换到亮色模式
document.documentElement.setAttribute('data-theme', 'light');
```

也可以使用 ThemeProvider 进行组件级控制：

```tsx | pure
import { ThemeProvider, useTheme } from '@aura/ui';

const App = () => (
  <ThemeProvider theme="dark">
    <Content />
  </ThemeProvider>
);
```

详细的主题定制说明请参考 [主题定制](/guide/theme)。

## TypeScript

Aura 使用 TypeScript 编写，提供完整的类型导出：

```tsx | pure
import type { ButtonProps, ThemeConfig } from '@aura/ui';
```

## 下一步

- 浏览 [组件列表](/components/button) 了解所有可用组件
- 阅读 [主题定制](/guide/theme) 了解如何自定义样式
- 查看 [更新日志](/changelog) 了解最新变更
