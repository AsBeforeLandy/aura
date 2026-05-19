---
title: Rate
subtitle: 评分
group: 表单高级
category: Components
description: 评分组件，支持半星和自定义星星数量。
order: 1
demo:
  cols: 2
toc: content
---

# Rate 评分

评分组件，支持半星和自定义星星数量。

```tsx | pure
import { Rate } from "@aura/ui";
```

## 何时使用

- 需要对事物进行评分时
- 支持半星精度

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/half.tsx" description="半星模式。">半星模式</code>
<code src="./demo/clearable.tsx" description="可清空。">可清空</code>
<code src="./demo/size.tsx" description="不同尺寸。">不同尺寸</code>
<code src="./demo/custom-count.tsx" description="自定义数量。">自定义数量</code>
<code src="./demo/disabled.tsx" description="禁用状态。">禁用状态</code>
## API

### RateProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| count | 星星数量 | `number` | `5` |
| value | 当前值（受控） | `number` | - |
| defaultValue | 默认值 | `number` | `0` |
| allowHalf | 是否允许半星 | `boolean` | `false` |
| allowClear | 是否允许清除 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| size | 星星大小 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| onChange | 值变化回调 | `(value: number) => void` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
