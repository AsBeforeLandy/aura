---
title: Alert
subtitle: 警告提示
group: 反馈
category: Components
description: 警告提示，展示需要关注的信息。
order: 0
demo:
  cols: 1
toc: content
---

# Alert 警告提示

警告提示，展示需要关注的信息。

```tsx | pure
import { Alert } from "@aura/ui";
```

## 何时使用

- 当页面需要展示警告提示时
- 非浮层静态提示，始终显示在页面中

## 代码演示
<code src="./demo/basic.tsx" description="最简单的用法，展示各种类型的警告提示。">基本用法</code>
<code src="./demo/closable.tsx" description="设置 `closable` 可关闭警告提示，`showIcon` 展示对应图标。">可关闭</code>
## API

### AlertProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 提示类型 | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` |
| title | 标题 | `ReactNode` | - |
| closable | 是否可关闭 | `boolean` | `false` |
| showIcon | 是否显示图标 | `boolean` | `false` |
| onClose | 关闭回调 | `() => void` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
