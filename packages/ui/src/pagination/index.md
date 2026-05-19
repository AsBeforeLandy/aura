---
title: Pagination
subtitle: 分页
group: 导航
category: Components
description: 数据量过多时，采用分页形式将数据拆分。
order: 2
demo:
  cols: 2
toc: content
---

# Pagination 分页

数据量过多时，采用分页形式将数据拆分。

```tsx | pure
import { Pagination } from "@aura/ui";
```

## 何时使用

- 需要加载/展示大量数据时
- 数据量超出页面可展示范围

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/controlled.tsx" description="受控模式。">受控模式</code>
<code src="./demo/page-size.tsx" description="显示每页条数选择器。">显示每页条数选择器</code>
<code src="./demo/quick-jump.tsx" description="显示快速跳转。">显示快速跳转</code>
<code src="./demo/full.tsx" description="完整功能。">完整功能</code>
<code src="./demo/small.tsx" description="小尺寸。">小尺寸</code>
<code src="./demo/few-pages.tsx" description="少量数据（不足 7 页）。">少量数据（不足 7 页）</code>
<code src="./demo/advanced.tsx" description="支持每页条数切换和快速跳转。">更多功能</code>
## API

### PaginationProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| current | 当前页码（受控） | `number` | - |
| defaultCurrent | 默认页码 | `number` | `1` |
| pageSize | 每页条数 | `number` | `10` |
| total | 数据总条数（必填） | `number` | - |
| showSizeChanger | 是否显示每页条数选择器 | `boolean` | `false` |
| showQuickJumper | 是否显示快速跳转 | `boolean` | `false` |
| size | 尺寸 | `'sm' \| 'md'` | `'md'` |
| onChange | 页码变化回调 | `(page: number, pageSize: number) => void` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
