---
title: Tooltip
subtitle: 文字提示
group: 数据展示
category: Components
description: 简单的文字提示气泡框，支持多方向和多种触发方式。
order: 3
demo:
  cols: 2
toc: content
---

# Tooltip 文字提示

简单的文字提示气泡框，支持多方向和多种触发方式。

```tsx | pure
import { Tooltip } from '@aura-react-comp/ui';
```

## 何时使用

- 鼠标移入元素时显示提示信息
- 需要补充说明的场景

## 代码演示

<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/placement-2.tsx" description="弹出方位。">弹出方位</code>
<code src="./demo/section-3.tsx" description="触发方式。">触发方式</code>
<code src="./demo/delay.tsx" description="延迟显示。">延迟显示</code>
<code src="./demo/disabled.tsx" description="禁用。">禁用</code>
<code src="./demo/corner.tsx" description="角落方位。">角落方位</code>
<code src="./demo/placement.tsx" description="支持 8 个弹出方向。">弹出方向</code>
<code src="./demo/trigger.tsx" description="支持 `hover`、`click`、`focus` 三种触发方式。">触发方式</code>
<code src="./demo/controlled.tsx" description="受控模式：`open` + `onOpenChange`，配合外部逻辑强制显示提示。">受控显示</code>

## API

### TooltipProps

| 属性            | 说明                                       | 类型                                                                                                                                                             | 默认值    |
| --------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| content         | 提示内容                                   | `ReactNode`                                                                                                                                                      | -         |
| placement       | 弹出方位（12 个）                          | `'top' \| 'bottom' \| 'left' \| 'right' \| 'topLeft' \| 'topRight' \| 'bottomLeft' \| 'bottomRight' \| 'leftTop' \| 'leftBottom' \| 'rightTop' \| 'rightBottom'` | `'top'`   |
| trigger         | 触发方式                                   | `'hover' \| 'click' \| 'focus'`                                                                                                                                  | `'hover'` |
| delay           | 显示延迟（毫秒），`mouseEnterDelay` 的简写 | `number`                                                                                                                                                         | `0`       |
| mouseEnterDelay | 鼠标移入后延迟显示（毫秒）                 | `number`                                                                                                                                                         | `0`       |
| mouseLeaveDelay | 鼠标移出后延迟隐藏（毫秒）                 | `number`                                                                                                                                                         | `0`       |
| open            | 受控显示状态；传入后显隐完全由该值驱动     | `boolean`                                                                                                                                                        | -         |
| onOpenChange    | 显示状态变化回调（受控 / 非受控均会触发）  | `(open: boolean) => void`                                                                                                                                        | -         |
| disabled        | 是否禁用                                   | `boolean`                                                                                                                                                        | `false`   |
| children        | 目标元素                                   | `ReactElement`                                                                                                                                                   | -         |

继承 `HTMLAttributes<HTMLDivElement>`。
