---
title: Layout
subtitle: 布局
group: 布局
category: Components
description: 协助进行页面级整体布局的组件。
order: 0
demo:
  cols: 2
toc: content
---

# Layout 布局

协助进行页面级整体布局的组件。

```tsx | pure
import { Layout } from "@aura/ui";
```

## 何时使用

- 页面级整体布局
- 需要顶部导航、侧边栏、内容区、底部的经典布局

## 代码演示
<code src="./demo/basic-layout.tsx" description="基础布局。">基础布局</code>
<code src="./demo/with-sider.tsx" description="含侧边栏布局。">含侧边栏布局</code>
<code src="./demo/custom-sider.tsx" description="自定义宽度侧边栏。">自定义宽度侧边栏</code>
## API

### LayoutProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| hasSider | 是否包含侧边栏 | `boolean` | `false` |

继承 `HTMLAttributes<HTMLElement>`。

### Layout 子组件

| 子组件 | 说明 |
| --- | --- |
| `Layout.Header` | 顶部区域 |
| `Layout.Sider` | 侧边栏 |
| `Layout.Body` | 内容主体 |
| `Layout.Footer` | 底部区域 |

所有子组件继承 `HTMLAttributes<HTMLDivElement>`。
