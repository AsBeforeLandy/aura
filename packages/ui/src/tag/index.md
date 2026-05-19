---
title: Tag
subtitle: 标签
group: 数据展示
category: Components
description: 进行标记和分类的小标签，支持多种变体和可选中模式。
order: 0
demo:
  cols: 2
toc: content
---

# Tag 标签

进行标记和分类的小标签，支持多种变体和可选中模式。

```tsx | pure
import { Tag } from "@aura/ui";
```

## 何时使用

- 用于标记事物的属性和维度
- 进行分类和标记
- 需要可选中/取消选中的标签场景

## 代码演示
<code src="./demo/variant-2.tsx" description="变体。">变体</code>
<code src="./demo/size.tsx" description="尺寸。">尺寸</code>
<code src="./demo/closable-2.tsx" description="可关闭。">可关闭</code>
<code src="./demo/checkable-2.tsx" description="可选中标签。">可选中标签</code>
<code src="./demo/tag-group.tsx" description="标签组（多选）。">标签组（多选）</code>
<code src="./demo/variant.tsx" description="标签提供多种语义化变体颜色。">变体样式</code>
<code src="./demo/closable.tsx" description="设置 `closable` 属性可以关闭标签，关闭时触发 `onClose` 回调。">可关闭标签</code>
<code src="./demo/checkable.tsx" description="使用 `Tag.Checkable` 实现可选中标签，`Tag.Group` 配合实现多选。">可选中标签</code>
## API

### TagProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 变体样式 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| closable | 是否可关闭 | `boolean` | `false` |
| onClose | 关闭回调 | `() => void` | - |

继承 `HTMLAttributes<HTMLSpanElement>`。

### TagCheckableProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| checked | 是否选中（受控） | `boolean` | `false` |
| onChange | 选中变化回调 | `(checked: boolean) => void` | - |
| value | 在 Group 中使用的值 | `string \| number` | - |

继承 `HTMLAttributes<HTMLSpanElement>`。

### TagGroupProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前选中值（受控） | `(string \| number)[]` | - |
| onChange | 选中值变化回调 | `(value: (string \| number)[]) => void` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
