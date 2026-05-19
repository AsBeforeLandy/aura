---
title: Dropdown
subtitle: 下拉菜单
group: 导航
category: Components
description: 向下弹出的列表，包含一组动作或选项。
order: 4
demo:
  cols: 2
toc: content
---

# Dropdown 下拉菜单

向下弹出的列表，包含一组动作或选项。

```tsx | pure
import { Dropdown } from "@aura/ui";
```

## 何时使用

- 需要展示一组操作或选项时
- 包裹在元素上，hover 或点击触发

## 代码演示
<code src="./demo/click-trigger.tsx" description="基础用法 - 点击触发。">基础用法 - 点击触发</code>
<code src="./demo/hover-trigger.tsx" description="悬停触发。">悬停触发</code>
<code src="./demo/placement.tsx" description="支持 top、bottom、left、right 及 topLeft 等八个方向。">弹出方向</code>
<code src="./demo/arrow.tsx" description="通过 arrow 属性控制是否显示箭头。">箭头</code>
<code src="./demo/disabled-item.tsx" description="包含禁用项。">包含禁用项</code>
## API

### DropdownProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| menu | 菜单项列表（必填） | `DropdownMenuItem[]` | - |
| trigger | 触发方式 | `'hover' \| 'click'` | `'hover'` |
| placement | 弹出方位 | `'top' \| 'bottom' \| 'left' \| 'right' \| 'bottomLeft' \| 'bottomRight' \| 'topLeft' \| 'topRight'` | `'bottom'` |
| arrow | 是否显示箭头 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| onMenuClick | 菜单项点击回调 | `(key: string) => void` | - |
| children | 触发元素（必填） | `ReactElement` | - |

继承 `HTMLAttributes<HTMLDivElement>`。

### DropdownMenuItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 菜单项唯一标识 | `string` | - |
| label | 显示内容 | `ReactNode` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| danger | 是否为危险操作 | `boolean` | `false` |
