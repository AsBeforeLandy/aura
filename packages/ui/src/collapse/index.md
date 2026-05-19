---
title: Collapse
subtitle: 折叠面板
group: 数据展示
category: Components
description: 可以折叠/展开的内容区域，支持手风琴模式。
order: 5
demo:
  cols: 2
toc: content
---

# Collapse 折叠面板

可以折叠/展开的内容区域，支持手风琴模式。

```tsx | pure
import { Collapse } from "@aura/ui";
```

## 何时使用

- 对复杂区域进行分组和隐藏
- 手风琴模式：同时只展开一个面板

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/accordion-2.tsx" description="手风琴模式。">手风琴模式</code>
<code src="./demo/default-expand.tsx" description="默认展开。">默认展开</code>
<code src="./demo/disabled-panel.tsx" description="禁用面板。">禁用面板</code>
<code src="./demo/controlled.tsx" description="受控模式。">受控模式</code>
<code src="./demo/accordion.tsx" description="设置 `accordion` 属性后，同一时间只能展开一个面板。">手风琴模式</code>
## API

### CollapseProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| accordion | 是否手风琴模式 | `boolean` | `false` |
| defaultActiveKey | 默认展开的面板 key | `string \| string[]` | `[]` |
| activeKey | 当前展开的面板 key（受控） | `string \| string[]` | - |
| onChange | 展开变化回调 | `(keys: string[]) => void` | - |

继承 `HTMLAttributes<HTMLDivElement>`。

### CollapseItemProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| itemKey | 面板唯一标识 | `string` | - |
| title | 面板标题 | `ReactNode` | - |
| disabled | 是否禁用 | `boolean` | `false` |

继承 `HTMLAttributes<HTMLDivElement>`。
