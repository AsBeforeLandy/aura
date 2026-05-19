---
title: Radio
subtitle: 单选框
group: 表单
category: Components
description: 单选框，用于在多个选项中选择一个。
order: 4
demo:
  cols: 2
toc: content
---

# Radio 单选框

单选框，用于在多个选项中选择一个。


```tsx | pure
import { Radio, RadioGroup } from "@aura/ui";
```

## 何时使用

- 在多个互斥的选项中选择一个时
- 选项数量较少（一般不超过 5 个）时优先使用

## 代码演示
<code src="./demo/basic.tsx" description="最基本的单选框用法。">基本用法</code>
<code src="./demo/horizontal.tsx" description="水平排列。">水平排列</code>
<code src="./demo/vertical-group.tsx" description="垂直排列。">垂直排列</code>
## API

### RadioProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| checked | 是否选中（受控） | `boolean` | - |
| defaultChecked | 默认是否选中 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| value | 在 Group 中使用的值 | `string \| number` | - |
| onChange | 变化回调 | `(e: ChangeEvent) => void` | - |

继承 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>`。

### RadioGroupProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 选项列表 | `Array<{ label: ReactNode; value: string \| number; disabled?: boolean }>` | - |
| value | 当前值（受控） | `string \| number` | - |
| defaultValue | 默认值（非受控） | `string \| number` | - |
| direction | 排列方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| disabled | 是否禁用整组 | `boolean` | `false` |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | - |
| onChange | 值变化回调 | `(value: string \| number) => void` | - |
