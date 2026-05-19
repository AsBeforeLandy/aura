---
title: Button
subtitle: 按钮
group: 通用
category: Components
description: 按钮用于触发一个即时操作。
order: 0
demo:
  cols: 2
toc: content
---

# Button 按钮

按钮用于触发一个即时操作。


```tsx | pure
import { Button } from "@aura/ui";
```

## 何时使用

标记了一个（或封装一组）操作命令，响应用户点击行为，触发对应的业务逻辑。

## 代码演示
<code src="./demo/variant.tsx" description="按钮有五种变体：主按钮、虚线按钮、文字按钮和链接按钮。主按钮在同一个操作区域最多出现一次。">按钮类型</code>
<code src="./demo/size.tsx" description="按钮提供 `sm`、`md`、`lg` 三种尺寸，默认为 `md`。">按钮尺寸</code>
<code src="./demo/loading.tsx" description="添加 `loading` 属性即可让按钮处于加载状态，点击不会触发回调。">加载中</code>
<code src="./demo/disabled.tsx" description="按钮的禁用状态。">禁用状态</code>
## API

### ButtonProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 按钮变体样式 | `'default' \| 'primary' \| 'dashed' \| 'text' \| 'link'` | `'default'` |
| size | 按钮尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| onClick | 点击回调 | `(e: React.MouseEvent) => void` | - |

继承 `ButtonHTMLAttributes<HTMLButtonElement>`。
