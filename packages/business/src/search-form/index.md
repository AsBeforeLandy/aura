---
title: SearchForm
subtitle: 查询表单
group: 业务
category: Components
description: 可折叠的高级查询区，基于 antd Form 驱动的搜索条件收集。
order: 2
demo:
  cols: 1
toc: content
---

# SearchForm 查询表单

中后台列表页的查询区：按配置生成字段、自动栅格布局、支持折叠展开。

```tsx | pure
import { SearchForm } from "@aura/business";
```

## 何时使用

- 列表页需要多个查询条件，且希望声明式配置而非手写布局
- 查询条件较多，需要「展开 / 收起」以避免占用过多首屏空间

## 代码演示

<code src="./demo/basic.tsx" description="配置化生成查询字段，字段数超过 3 个时自动启用折叠。">基本用法</code>

## API

### SearchFormProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| fields | 查询字段配置 | `SearchField[]` | - |
| loading | 查询按钮 loading | `boolean` | `false` |
| onSearch | 点击查询回调 | `(values) => void` | - |
| onReset | 点击重置回调 | `() => void` | - |
| defaultCollapsed | 是否默认折叠 | `boolean` | `true` |
| collapseAfter | 超过多少个字段后启用折叠 | `number` | `3` |
| submitText | 查询按钮文案 | `ReactNode` | `'查询'` |
| resetText | 重置按钮文案 | `ReactNode` | `'重置'` |
| initialValues | 表单初始值 | `Record<string, unknown>` | - |
| form | 外部受控的表单实例 | `FormInstance` | - |

### SearchField

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段名（对应表单值 key） | `string` | - |
| label | 字段标签 | `ReactNode` | - |
| type | 控件类型 | `'input' \| 'select' \| 'number' \| 'date' \| 'dateRange' \| 'custom'` | - |
| options | `select` 的选项 | `SearchFieldOption[]` | - |
| placeholder | 占位符（`dateRange` 请在 `fieldProps` 中传 `[string, string]`） | `string` | - |
| span | 栅格占比（24 栅格制） | `number` | `8` |
| fieldProps | 透传给控件的额外属性 | `Record<string, unknown>` | - |
| render | `type=custom` 时的自定义渲染 | `() => ReactNode` | - |
