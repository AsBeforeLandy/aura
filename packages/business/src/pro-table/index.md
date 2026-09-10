---
title: ProTable
subtitle: 高级表格
group: 业务
category: Components
description: 查询 + 表格 + 分页一体化，B 端列表页核心组件。
order: 3
demo:
  cols: 1
toc: content
---

# ProTable 高级表格

把「查询、翻页、展示」三个动作收敛到一个组件内，是标准列表页的开箱方案。

```tsx | pure
import { ProTable } from "@aura/business";
```

## 何时使用

- 标准的中后台列表页（表格 + 查询条件 + 分页）
- 希望把数据请求、loading、分页状态统一交给组件管理

## 设计说明

由 `SearchForm` + antd `Card` / `Table` 组合而成。`request` 通过 ref 保存最新引用，因此无需用 `useCallback` 包裹即可安全内联书写。

## 代码演示

<code src="./demo/basic.tsx" description="内置查询表单、分页与 loading；request 返回 { data, total }。">基本用法</code>

## API

### ProTableProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 表格列定义 | `TableProps<T>['columns']` | - |
| request | 数据请求函数 | `(params: ProTableParams) => Promise<ProTableResult<T>>` | - |
| search | 查询表单配置，传 `false` 关闭 | `SearchFormProps \| false` | - |
| title | 卡片标题 | `ReactNode` | - |
| toolbar | 工具栏右侧内容 | `ReactNode` | - |
| defaultPageSize | 每页条数 | `number` | `10` |
| rowKey | 行标识 | `string \| (record) => string` | `'id'` |

其余属性透传给 antd `Table`。

### ProTableParams

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| current | 当前页 | `number` |
| pageSize | 每页条数 | `number` |
| ... | 查询表单收集的条件 | `unknown` |

### ProTableResult

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| data | 当前页数据 | `T[]` |
| total | 数据总数 | `number` |
| success | 是否成功（`false` 时保留旧数据） | `boolean` |
