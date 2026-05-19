---
title: Card
subtitle: 卡片
group: 数据展示
category: Components
description: 通用卡片容器，支持复合组件模式和多种变体。
order: 4
demo:
  cols: 2
toc: content
---

# Card 卡片

通用卡片容器，支持复合组件模式和多种变体。

```tsx | pure
import { Card } from "@aura/ui";
```

## 何时使用

- 需要承载一组相关信息的容器
- 需要展示图文混排内容时
- 需要不同视觉风格的卡片布局

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/card-variant.tsx" description="卡片变体。">卡片变体</code>
<code src="./demo/card-size.tsx" description="卡片尺寸。">卡片尺寸</code>
<code src="./demo/hoverable.tsx" description="可悬浮卡片。">可悬浮卡片</code>
<code src="./demo/loading-2.tsx" description="加载状态。">加载状态</code>
<code src="./demo/full.tsx" description="完整组合。">完整组合</code>
<code src="./demo/variant.tsx" description="卡片提供 `default`、`elevated`、`outlined`、`glass` 四种变体。">卡片变体</code>
<code src="./demo/loading.tsx" description="设置 `loading` 属性展示骨架屏加载效果。">加载状态</code>
## API

### CardProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 卡片变体 | `'default' \| 'elevated' \| 'outlined' \| 'glass'` | `'default'` |
| size | 卡片尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| hoverable | 是否悬浮上浮 | `boolean` | `false` |
| loading | 是否显示骨架屏 | `boolean` | `false` |

继承 `HTMLAttributes<HTMLDivElement>`。

### Card 子组件

| 子组件 | 说明 |
| --- | --- |
| `Card.Header` | 卡片头部区域 |
| `Card.Title` | 卡片标题 |
| `Card.Body` | 卡片内容区域 |
| `Card.Actions` | 操作按钮区域 |
| `Card.Footer` | 卡片底部区域 |
| `Card.Cover` | 卡片封面图区域 |

所有子组件继承 `HTMLAttributes<HTMLDivElement>`。
