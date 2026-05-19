---
title: Slider
subtitle: 滑动输入条
group: 表单高级
category: Components
description: 滑动型输入器，支持单值和范围选择。
order: 0
demo:
  cols: 2
toc: content
---

# Slider 滑动输入条

滑动型输入器，支持单值和范围选择。

```tsx | pure
import { Slider } from "@aura/ui";
```

## 何时使用

- 需要在给定范围内选择一个值或范围时

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/marks.tsx" description="带标记。">带标记</code>
<code src="./demo/range.tsx" description="范围选择。">范围选择</code>
<code src="./demo/disabled.tsx" description="禁用状态。">禁用状态</code>
<code src="./demo/step.tsx" description="自定义步长。">自定义步长</code>
## API

### SliderProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| min | 最小值 | `number` | `0` |
| max | 最大值 | `number` | `100` |
| step | 步长 | `number` | `1` |
| value | 当前值（受控） | `number \| [number, number]` | - |
| defaultValue | 默认值 | `number \| [number, number]` | `0` |
| disabled | 是否禁用 | `boolean` | `false` |
| onChange | 值变化回调 | `(value: number \| [number, number]) => void` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
