---
title: Checkbox
subtitle: 复选框
group: 表单
category: Components
description: 多选框，支持全选、半选状态。
order: 3
demo:
  cols: 2
toc: content
---

# Checkbox 复选框

多选框，支持全选、半选状态。


```tsx | pure
import { Checkbox, CheckboxGroup } from "@aura/ui";
```

## 何时使用

- 在一组可选项中进行多项选择时
- 需要表示"全选"或"半选"状态时

## 代码演示
<code src="./demo/basic.tsx" description="最基本的复选框用法，支持受控和非受控模式。">基本用法</code>
<code src="./demo/horizontal.tsx" description="水平排列。">水平排列</code>
<code src="./demo/vertical-group.tsx" description="垂直排列。">垂直排列</code>
<code src="./demo/indeterminate.tsx" description="设置 `indeterminate` 属性可显示半选状态，常用于全选/反选场景。">半选状态</code>
## API

### CheckboxProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| indeterminate | 半选状态 | `boolean` | `false` |
| checked | 是否选中（受控） | `boolean` | - |
| defaultChecked | 默认是否选中 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| value | 在 Group 中使用的值 | `string \| number` | - |
| onChange | 变化回调 | `(e: ChangeEvent) => void` | - |

继承 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>`。

### CheckboxGroupProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 选项列表 | `Array<{ label: ReactNode; value: string \| number; disabled?: boolean }>` | - |
| value | 当前值（受控） | `(string \| number)[]` | - |
| defaultValue | 默认值（非受控） | `(string \| number)[]` | `[]` |
| direction | 排列方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| disabled | 是否禁用整组 | `boolean` | `false` |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | - |
| onChange | 值变化回调 | `(value: (string \| number)[]) => void` | - |
