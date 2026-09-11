---
title: Icon
subtitle: 图标
group: 通用
category: Components
description: Aura 图标库，提供状态、导航、操作、结果页等场景的矢量图标。
order: 1
toc: content
---

# Icon 图标

Aura 图标库（`@aura/icons`）提供一组无外部依赖的矢量图标组件，覆盖状态提示、导航、操作、文件、结果页等中后台常见场景。

所有图标都是普通的 React 组件，颜色跟随 `currentColor`，尺寸通过 `size` 控制。

## 引入方式

```tsx | pure
import { CheckCircleFilled, Search, StarFilled } from '@aura/icons';
```

## 基础用法

<code src="./icons/demo/icon-list.tsx"></code>

## 图标分组

| 分组 | 说明 | 代表图标 |
| --- | --- | --- |
| `status` | 状态提示，提供 Outline / Filled / TwoTone 三种形态 | `CheckCircleFilled`、`WarningTriangleTwoTone`、`InfoCircleOutline` |
| `navigation` | 方向与翻页 | `ChevronLeft`、`ChevronRight`、`DoubleRight`、`ArrowUp` |
| `action` | 操作类 | `Search`、`Edit`、`Delete`、`Copy`、`Refresh`、`Upload`、`Download`、`Filter` |
| `general` | 通用符号 | `Home`、`User`、`Settings`、`Mail`、`Bell`、`Lock`、`Loading` |
| `file` | 文件与目录 | `File`、`Folder`、`FolderOpen`、`PicturePlaceholder` |
| `result` | 结果页插画 | `ResultSuccess`、`ResultError`、`NotFound`、`Forbidden`、`ServerError` |
| `empty` | 空状态插画 | `EmptyDefault`、`Empty404` |
| `star` | 评分 | `StarFilled`、`StarEmpty`、`StarHalf` |

## API

图标组件统一接收 `IconProps`：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `size` | 图标尺寸（px，同时作用于宽高） | `number` | `24` |
| `color` | 图标颜色 | `string` | `'currentColor'` |
| `className` | 附加 CSS 类名 | `string` | - |
| `style` | 行内样式 | `CSSProperties` | - |

TwoTone 图标额外接收 `TwoToneIconProps`，可通过 `twoToneColor` 指定辅色。

## 设计约定

- `size` 默认 `24`，需要更小或更大时显式传入（如 `size={16}`）。
- `color` 默认 `currentColor`，因此**不传时自动继承父级文本颜色**，可直接放进按钮、菜单等元素中。
- 与文字并排时建议由 `Space` 或 `Typography` 控制间距，而不是给图标加 margin。

