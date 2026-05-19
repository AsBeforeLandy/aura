---
title: Flex
subtitle: 弹性布局
group: 布局
category: Components
description: 弹性布局容器，简化 flexbox 使用。
order: 1
demo:
  cols: 2
toc: content
---

# Flex 弹性布局

弹性布局容器，简化 flexbox 使用。

```tsx | pure
import { Flex } from "@aura/ui";
```

## 何时使用

- 需要快速进行 flex 布局时
- 需要设置间距、对齐方式等

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/direction.tsx" description="方向。">方向</code>
<code src="./demo/align.tsx" description="对齐方式。">对齐方式</code>
<code src="./demo/gap.tsx" description="间距。">间距</code>
<code src="./demo/wrap.tsx" description="换行。">换行</code>
## API

### FlexProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 主轴方向 | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | `'row'` |
| justify | 主轴对齐方式 | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | - |
| align | 交叉轴对齐方式 | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | - |
| wrap | 是否换行 | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` |
| gap | 间距 | `'sm' \| 'md' \| 'lg' \| number` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
