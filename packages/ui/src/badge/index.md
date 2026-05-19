---
title: Badge
subtitle: 徽标数
group: 数据展示
category: Components
description: 图标右上角的徽标数字，支持多种颜色和独立使用。
order: 1
demo:
  cols: 2
toc: content
---

# Badge 徽标数

图标右上角的徽标数字，支持多种颜色和独立使用。

```tsx | pure
import { Badge } from "@aura/ui";
```

## 何时使用

- 需要在图标或文字右上角展示数字时
- 需要展示未读消息数量时
- 需要仅用小圆点提示状态更新时

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/standalone-2.tsx" description="独立模式。">独立模式</code>
<code src="./demo/variant-2.tsx" description="变体颜色。">变体颜色</code>
<code src="./demo/dynamic.tsx" description="动态变化。">动态变化</code>
<code src="./demo/variant.tsx" description="徽标提供多种语义化颜色。">变体颜色</code>
<code src="./demo/standalone.tsx" description="不包裹子元素时独立展示；数字超出 `overflowCount` 显示为 `N+`。">独立使用与溢出</code>
## API

### BadgeProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| count | 徽标数字 | `number` | `0` |
| dot | 是否只显示小圆点 | `boolean` | `false` |
| variant | 变体颜色 | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'error'` |
| overflowCount | 溢出计数阈值 | `number` | `99` |
| showZero | 是否在 count 为 0 时显示 | `boolean` | `false` |
| children | 包裹的子元素 | `ReactNode` | - |

继承 `HTMLAttributes<HTMLSpanElement>`。
