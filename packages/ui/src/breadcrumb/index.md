---
title: Breadcrumb
subtitle: 面包屑
group: 导航
category: Components
description: 显示当前页面在系统层级结构中的位置。
order: 1
demo:
  cols: 2
toc: content
---

# Breadcrumb 面包屑

显示当前页面在系统层级结构中的位置。

```tsx | pure
import { Breadcrumb } from "@aura/ui";
```

## 何时使用

- 显示当前页面路径
- 需要返回任意层级页面时

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/with-link.tsx" description="带链接。">带链接</code>
<code src="./demo/separator-2.tsx" description="自定义分隔符。">自定义分隔符</code>
<code src="./demo/arrow-separator.tsx" description="箭头分隔符。">箭头分隔符</code>
<code src="./demo/with-onclick.tsx" description="带 onClick 回调。">带 onClick 回调</code>
<code src="./demo/separator.tsx" description="通过 `separator` 属性自定义分隔符。">自定义分隔符</code>
## API

### BreadcrumbProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| separator | 分隔符 | `ReactNode` | `'/'` |

继承 `HTMLAttributes<HTMLElement>`。

### BreadcrumbItemProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| href | 链接地址 | `string` | - |
| onClick | 点击回调 | `() => void` | - |

继承 `HTMLAttributes<HTMLSpanElement>`。
