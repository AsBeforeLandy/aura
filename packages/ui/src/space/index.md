---
title: Space
subtitle: 间距
group: 通用
category: Components
description: 设置组件之间的间距。
order: 2
demo:
  cols: 2
toc: content
---

# Space 间距

设置组件之间的间距。


```tsx | pure
import { Space } from "@aura/ui";
```

## 何时使用

- 需要在相邻子元素之间添加统一间距时
- 避免手动设置 `margin`，保持间距一致性

## 代码演示
<code src="./demo/basic.tsx" description="默认为水平排列，使用 `md` 间距。">基本用法</code>
<code src="./demo/horizontal.tsx" description="水平排列（默认）。">水平排列（默认）</code>
<code src="./demo/vertical-group.tsx" description="垂直排列。">垂直排列</code>
<code src="./demo/wrap.tsx" description="自动换行。">自动换行</code>
<code src="./demo/preset-size.tsx" description="预设尺寸。">预设尺寸</code>
<code src="./demo/custom-size.tsx" description="自定义间距。">自定义间距</code>
<code src="./demo/align.tsx" description="对齐方式。">对齐方式</code>
## API

### SpaceProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 排列方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| size | 间距大小 | `'sm' \| 'md' \| 'lg' \| number` | `'md'` |
| wrap | 是否自动换行（仅水平方向有效） | `boolean` | `false` |
| align | 对齐方式 | `'start' \| 'center' \| 'end' \| 'baseline'` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
