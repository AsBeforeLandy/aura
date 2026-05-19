---
title: Input
subtitle: 输入框
group: 表单
category: Components
description: 通过键盘输入内容的基础表单组件。
order: 0
demo:
  cols: 2
toc: content
---

# Input 输入框

通过键盘输入内容的基础表单组件。


```tsx | pure
import { Input } from "@aura/ui";
```

## 何时使用

- 需要用户输入表单域内容时
- 提供组合型输入框用于特殊场景，如密码输入、搜索等

## 代码演示
<code src="./demo/basic.tsx" description="最基本的输入框用法，支持受控和非受控模式。">基本用法</code>
<code src="./demo/variant.tsx" description="提供 `default`、`filled`、`bordered` 三种变体样式。">输入框变体</code>
<code src="./demo/prefix-suffix.tsx" description="通过 `prefix` 和 `suffix` 在输入框前后添加内容，`allowClear` 可启用清除按钮。">前缀与后缀</code>
<code src="./demo/password-basic.tsx" description="密码输入框。">密码输入框</code>
<code src="./demo/password-clearable.tsx" description="带清除的密码框。">带清除的密码框</code>
<code src="./demo/size.tsx" description="不同尺寸。">不同尺寸</code>
<code src="./demo/variant-style.tsx" description="不同变体。">不同变体</code>
<code src="./demo/error-status.tsx" description="错误状态。">错误状态</code>
<code src="./demo/search-basic.tsx" description="搜索输入框。">搜索输入框</code>
<code src="./demo/size-2.tsx" description="不同尺寸。">不同尺寸</code>
<code src="./demo/variant-style-2.tsx" description="不同变体。">不同变体</code>
## API

### InputProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 输入框变体 | `'default' \| 'filled' \| 'bordered'` | `'default'` |
| size | 输入框尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| disabled | 是否禁用 | `boolean` | `false` |
| prefix | 前缀图标 | `ReactNode` | - |
| suffix | 后缀图标 | `ReactNode` | - |
| allowClear | 是否可清除 | `boolean` | `false` |
| status | 校验状态 | `'default' \| 'error' \| 'warning'` | `'default'` |

继承 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>`。

### Input.Password

继承 `Omit<InputProps, 'type'>`，额外属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultVisible | 默认是否显示明文 | `boolean` | `false` |

### Input.Search

继承 `Omit<InputProps, 'suffix'>`，额外属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| searchButtonText | 搜索按钮文字 | `string` | `'搜索'` |
| onSearch | 搜索回调（回车触发） | `(value: string) => void` | - |

### Input.Group

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| compact | 是否紧凑模式 | `boolean` | `false` |
