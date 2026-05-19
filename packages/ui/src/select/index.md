---
title: Select
subtitle: 选择器
group: 表单
category: Components
description: 下拉选择器，支持搜索、多选等。
order: 2
demo:
  cols: 2
toc: content
---

# Select 选择器

下拉选择器，支持搜索、多选等。


```tsx | pure
import { Select } from "@aura/ui";
```

## 何时使用

- 弹出一个下拉菜单供用户选择操作
- 需要从一组数据中选择一个或多个选项时

## 代码演示
<code src="./demo/basic.tsx" description="最基本的单选用法。">基本用法</code>
<code src="./demo/variant.tsx" description="提供 `default`、`filled`、`bordered` 三种变体样式。">变体样式</code>
<code src="./demo/size.tsx" description="提供 `sm`、`md`、`lg` 三种尺寸。">尺寸</code>
<code src="./demo/controlled.tsx" description="通过 `value` + `onChange` 受控使用，或通过 `defaultValue` 非受控使用。">受控与非受控</code>
<code src="./demo/multiple.tsx" description="设置 `multiple` 属性开启多选模式。">多选模式</code>
<code src="./demo/search.tsx" description="设置 `searchable` 属性开启搜索过滤功能。">可搜索</code>
<code src="./demo/clearable.tsx" description="设置 `clearable` 属性，选中后显示清除按钮。">可清除</code>
<code src="./demo/disabled.tsx" description="支持整个组件禁用，也支持单个选项禁用。">禁用</code>
<code src="./demo/loading.tsx" description="设置 `loading` 属性显示加载状态。">加载中</code>
## API

### SelectProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 选项列表 | `Array<{ label: ReactNode; value: string \| number; disabled?: boolean }>` | - |
| value | 当前值（受控） | `string \| number \| (string \| number)[]` | - |
| defaultValue | 默认值（非受控） | `string \| number \| (string \| number)[]` | - |
| variant | 变体样式 | `'default' \| 'filled' \| 'bordered'` | `'default'` |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| multiple | 是否多选 | `boolean` | `false` |
| searchable | 是否可搜索 | `boolean` | `false` |
| clearable | 是否可清除 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| placeholder | 占位文本 | `string` | - |
| onChange | 值变化回调 | `(value: string \| number \| (string \| number)[]) => void` | - |
