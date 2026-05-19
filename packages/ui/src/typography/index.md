---
title: Typography
subtitle: 排版
group: 通用
category: Components
description: 文本的基本格式化展示，包含 Title、Text、Paragraph 三个子组件。
order: 1
demo:
  cols: 2
toc: content
---

# Typography 排版

文本的基本格式化展示。


```tsx | pure
import { Typography, Title, Text, Paragraph } from "@aura/ui";
```

## 何时使用

- 需要展示标题、段落、行内文本等排版内容时
- 需要对文本进行加粗、删除线、标记、代码等修饰时
- 需要对长文本进行省略时

## 代码演示
<code src="./demo/title.tsx" description="通过 `Title` 组件展示 1-5 级标题，使用 `level` 属性控制级别。">标题</code>
<code src="./demo/color-variant.tsx" description="色彩变体。">色彩变体</code>
<code src="./demo/modifier.tsx" description="修饰符。">修饰符</code>
<code src="./demo/combined.tsx" description="组合使用。">组合使用</code>
<code src="./demo/paragraph.tsx" description="`Paragraph` 组件用于展示段落文本，设置 `ellipsis` 可开启单行省略。">段落与省略</code>
## API

### Typography

复合组件，包含以下静态属性：

| 属性 | 说明 |
| --- | --- |
| Typography.Title | 标题组件 |
| Typography.Text | 文本组件 |
| Typography.Paragraph | 段落组件 |

### TitleProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| level | 标题级别 | `1 \| 2 \| 3 \| 4 \| 5` | `1` |

继承 `HTMLAttributes<HTMLHeadingElement>`。

### TextProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 文本色彩变体 | `'default' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| strong | 是否加粗 | `boolean` | `false` |
| underline | 是否下划线 | `boolean` | `false` |
| delete | 是否删除线 | `boolean` | `false` |
| code | 是否代码样式 | `boolean` | `false` |
| mark | 是否高亮标记 | `boolean` | `false` |

继承 `HTMLAttributes<HTMLSpanElement>`。

### ParagraphProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ellipsis | 是否启用单行省略 | `boolean` | `false` |

继承 `HTMLAttributes<HTMLParagraphElement>`。
