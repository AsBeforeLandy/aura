---
title: Scrollbar
subtitle: 滚动条
group: 布局
category: Components
description: 自定义滚动条容器，支持最大高度和宽度限制。
order: 2
demo:
  cols: 2
toc: content
---

# Scrollbar 滚动条

自定义滚动条容器，支持最大高度和宽度限制。

```tsx | pure
import { Scrollbar } from "@aura/ui";
```

## 何时使用

- 需要自定义滚动条样式时
- 需要限制内容区域高度或宽度时

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/always-visible.tsx" description="始终显示滚动条。">始终显示滚动条</code>
<code src="./demo/max-width.tsx" description="限制宽度。">限制宽度</code>
## API

### ScrollbarProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| maxHeight | 最大高度 | `number \| string` | - |
| maxWidth | 最大宽度 | `number \| string` | - |
| alwaysShow | 是否始终显示滚动条 | `boolean` | `false` |

继承 `HTMLAttributes<HTMLDivElement>`。
