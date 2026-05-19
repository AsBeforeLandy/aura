---
title: Tabs
subtitle: 标签页
group: 数据展示
category: Components
description: 选项卡切换组件，支持多种变体和受控模式。
order: 6
demo:
  cols: 2
toc: content
---

# Tabs 标签页

选项卡切换组件，支持多种变体和受控模式。

```tsx | pure
import { Tabs } from "@aura/ui";
```

## 何时使用

- 需要在同一区域内切换不同内容时
- 需要将信息分组展示时

## 代码演示
<code src="./demo/default-variant.tsx" description="基础用法 — default 变体（底部指示器）。">基础用法 — default 变体（底部指示器）</code>
<code src="./demo/card.tsx" description="Card 变体。">Card 变体</code>
<code src="./demo/pill.tsx" description="Pill 变体。">Pill 变体</code>
<code src="./demo/controlled.tsx" description="受控模式。">受控模式</code>
<code src="./demo/size-2.tsx" description="不同尺寸。">不同尺寸</code>
<code src="./demo/variant.tsx" description="标签页提供 `default`（带指示器）、`card`、`pill` 三种变体。">变体样式</code>
<code src="./demo/size.tsx" description="标签页提供 `sm`、`md`、`lg` 三种尺寸。">尺寸</code>
## API

### TabsProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultActiveKey | 默认激活的 tabKey | `string` | - |
| activeKey | 受控激活的 tabKey | `string` | - |
| variant | 变体样式 | `'default' \| 'card' \| 'pill'` | `'default'` |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| onChange | 切换回调 | `(key: string) => void` | - |

继承 `HTMLAttributes<HTMLDivElement>`。

### TabItemProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tabKey | 唯一标识 | `string` | - |
| title | 选项卡标题 | `ReactNode` | - |
| disabled | 是否禁用 | `boolean` | `false` |
