---
title: Menu
subtitle: 导航菜单
group: 导航
category: Components
description: 导航菜单，支持垂直、水平和内嵌模式。
order: 0
demo:
  cols: 2
toc: content
---

# Menu 导航菜单

导航菜单，支持垂直、水平和内嵌模式。

```tsx | pure
import { Menu } from "@aura/ui";
```

## 何时使用

- 需要页面级导航时
- 侧边栏或顶部导航栏

## 代码演示
<code src="./demo/vertical.tsx" description="基础用法 — 垂直菜单。">基础用法 — 垂直菜单</code>
<code src="./demo/with-icon.tsx" description="带图标菜单。">带图标菜单</code>
<code src="./demo/submenu.tsx" description="子菜单。">子菜单</code>
<code src="./demo/group-menu.tsx" description="分组菜单。">分组菜单</code>
<code src="./demo/horizontal-2.tsx" description="水平菜单。">水平菜单</code>
<code src="./demo/controlled.tsx" description="受控模式。">受控模式</code>
<code src="./demo/horizontal.tsx" description="设置 `mode='horizontal'`">水平模式</code>
## API

### MenuProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| mode | 模式 | `'vertical' \| 'horizontal' \| 'inline'` | `'vertical'` |
| selectedKey | 受控选中项 | `string` | - |
| defaultSelectedKey | 默认选中项 | `string` | - |
| onSelect | 选中回调 | `(key: string) => void` | - |
| collapsible | 是否可折叠（inline 模式） | `boolean` | `false` |

继承 `HTMLAttributes<HTMLDivElement>`。

### MenuItemProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| itemKey | 唯一标识 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| icon | 图标 | `ReactNode` | - |

### SubMenuProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| subKey | 唯一标识 | `string` | - |
| title | 标题 | `ReactNode` | - |
| icon | 图标 | `ReactNode` | - |

### MenuGroupProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 分组标题 | `ReactNode` | - |
