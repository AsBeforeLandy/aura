---
title: Divider
subtitle: 分割线
group: 通用
category: Components
description: 区隔内容的分割线。
order: 3
demo:
  cols: 2
toc: content
---

# Divider 分割线

区隔内容的分割线。


```tsx | pure
import { Divider } from "@aura/ui";
```

## 何时使用

- 对不同章节的文本段落进行分割
- 对行内元素进行垂直分割

## 代码演示
<code src="./demo/basic.tsx" description="默认为水平分割线，支持实线和虚线两种样式。">水平分割线</code>
<code src="./demo/text.tsx" description="分割线中可以嵌入文字，通过 `orientation` 控制文字位置。">带文字的分割线</code>
<code src="./demo/vertical.tsx" description="设置 `direction=">垂直分割线</code>
## API

### DividerProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 分割线方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| variant | 样式变体 | `'default' \| 'dashed'` | `'default'` |
| orientation | 文字位置（仅水平且有 children 时生效） | `'left' \| 'center' \| 'right'` | `'center'` |

继承 `HTMLAttributes<HTMLDivElement>`。
