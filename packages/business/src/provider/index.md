---
title: BusinessProvider
subtitle: 业务主题桥接
group: 业务
category: Components
description: 将 Aura 设计令牌映射到 antd 主题系统，使业务组件与自研组件保持一致的视觉语言。
order: 0
demo:
  cols: 1
toc: content
---

# BusinessProvider 业务主题桥接

将 Aura 的设计令牌映射到 antd 的主题系统，让基于 antd 二次封装的业务组件与 Aura 自研组件呈现同一套紫罗兰视觉语言。

```tsx | pure
import { BusinessProvider } from "@aura/business";
```

## 何时使用

- 应用中使用了 `@aura/business` 的业务组件（ProTable / SearchForm / ModalForm 等）
- 需要把 antd 的主色、圆角、链接色统一到 Aura 品牌色
- 需要暗色模式或紧凑模式，且希望 antd 与 Aura 组件同步切换

## 为什么需要它

`@aura/business` 的组件由 antd 提供底层能力，而 Aura 自研组件走 CSS 变量主题体系。若不做桥接，两者会出现色板不一致、圆角不一致、链接色为语义蓝等问题。

有两个容易踩的点：

1. **链接色**：antd 的 `colorLink` 默认派生自 `colorInfo`。若 `colorInfo` 是语义蓝，`Button type="link"` 与 `<a>` 会呈现蓝色而与品牌主色脱节，因此这里显式让 `colorLink` 跟随主色。
2. **主题令牌**：本组件的样式依赖 `--aura-*` CSS 变量，请确保主题令牌已加载（见下方「样式引入」）。

## 基础用法

```tsx | pure
import { BusinessProvider } from '@aura/business';
import '@aura/ui/style.css';

const App = () => (
  <BusinessProvider>
    <YourPage />
  </BusinessProvider>
);
```

## 代码演示

<code src="./demo/basic.tsx" description="切换暗色 / 紧凑模式，观察 antd 组件（按钮、标签、输入框）如何跟随 Aura 令牌；链接按钮会呈现品牌主色而非语义蓝。">主题切换</code>

> 注意：`dark` 只切换 antd 的暗色算法。若 Aura 自研组件也要变暗，
> 需同时切换 Aura 令牌作用域（`document.documentElement.dataset.theme = 'dark'`），
> 示例中限定在容器上演示。

## 样式引入

本包所有 `.less` 直接使用 `var(--aura-*)` 且不设 fallback，令牌缺失时颜色、圆角、字号、间距会整体失效。令牌由 `@aura/ui` 提供，已作为本包依赖声明。

- 引入 `@aura/ui` 时，其入口**已自动引入**主题令牌，无需额外操作；
- 若只使用 `@aura/business`，请显式引入一次：

```tsx | pure
import '@aura/ui/style.css';
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `children` | 子树 | `ReactNode` | - |
| `dark` | 暗色模式，自动切换 antd 暗色算法 | `boolean` | `false` |
| `colorPrimary` | 主题主色 | `string` | `#7c3aed` |
| `borderRadius` | 组件基础圆角 | `number` | `10` |
| `locale` | 语言包 | `Locale` | `zhCN` |
| `compact` | 是否启用紧凑模式 | `boolean` | `false` |

## 设计说明

基于 antd 的 `ConfigProvider` 实现。antd v6 默认使用 CSS Variables，因此可与 Aura 的 CSS 变量主题体系共存，不会互相覆盖。
