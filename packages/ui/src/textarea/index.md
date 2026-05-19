---
title: Textarea
subtitle: 文本域
group: 表单
category: Components
description: 用于多行文本输入。
order: 1
demo:
  cols: 2
toc: content
---

# Textarea 文本域

用于多行文本输入。


```tsx | pure
import { Textarea } from "@aura/ui";
```

## 何时使用

- 需要输入多行文本时
- 需要自适应高度或字数统计时

## 代码演示
<code src="./demo/basic.tsx" description="最基本的文本域用法。">基本用法</code>
<code src="./demo/auto-height.tsx" description="自动适应高度。">自动适应高度</code>
<code src="./demo/row-range.tsx" description="限制行数范围（2-6 行）。">限制行数范围（2-6 行）</code>
<code src="./demo/status.tsx" description="通过 `status` 属性设置校验状态，结合 `showCount` 和 `maxLength` 显示字数统计。">校验状态</code>
## API

### TextareaProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 输入框变体 | `'default' \| 'filled' \| 'bordered'` | `'default'` |
| size | 输入框尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| autoSize | 自适应高度 | `boolean \| { minRows: number; maxRows: number }` | `false` |
| showCount | 是否显示字数统计 | `boolean` | `false` |
| maxLength | 最大字符长度 | `number` | - |
| status | 校验状态 | `'default' \| 'error' \| 'warning'` | `'default'` |
| disabled | 是否禁用 | `boolean` | `false` |

继承 `TextareaHTMLAttributes<HTMLTextAreaElement>`。
