---
title: Avatar
subtitle: 头像
group: 数据展示
category: Components
description: 用户头像组件，支持图片、文字和头像组。
order: 2
demo:
  cols: 2
toc: content
---

# Avatar 头像

用户头像组件，支持图片、文字和头像组。

```tsx | pure
import { Avatar } from "@aura/ui";
```

## 何时使用

- 需要展示用户信息时
- 需要以列表形式展示头像组时
- 需要展示图片或文字头像时

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/size.tsx" description="尺寸。">尺寸</code>
<code src="./demo/shape.tsx" description="形状。">形状</code>
<code src="./demo/fallback.tsx" description="加载失败回退。">加载失败回退</code>
<code src="./demo/avatar-group.tsx" description="头像组。">头像组</code>
<code src="./demo/group-max.tsx" description="头像组 - 限制数量。">头像组 - 限制数量</code>
<code src="./demo/group-square.tsx" description="头像组 - 方形。">头像组 - 方形</code>
<code src="./demo/size-shape.tsx" description="头像提供 `sm`、`md`、`lg` 三种预设尺寸和自定义数字尺寸，支持圆形和方形。">尺寸与形状</code>
<code src="./demo/group.tsx" description="使用 `AvatarGroup` 展示一组头像，`maxCount` 控制最大显示数量。">头像组</code>
## API

### AvatarProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 头像尺寸 | `'sm' \| 'md' \| 'lg' \| number` | `'md'` |
| shape | 头像形状 | `'circle' \| 'square'` | `'circle'` |
| src | 图片地址 | `string` | - |
| alt | 图片 alt 文本 | `string` | - |
| variant | 头像变体 | `'default' \| 'primary'` | `'default'` |

继承 `HTMLAttributes<HTMLSpanElement>`。

### AvatarGroupProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| maxCount | 最大显示数量 | `number` | - |
| size | 头像组统一尺寸 | `'sm' \| 'md' \| 'lg' \| number` | - |
| shape | 头像组统一形状 | `'circle' \| 'square'` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
