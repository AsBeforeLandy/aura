---
title: Empty
subtitle: 空状态
group: 数据展示
category: Components
description: 空状态占位提示，支持自定义和预置场景。
order: 7
demo:
  cols: 2
toc: content
---

# Empty 空状态

空状态占位提示，支持自定义和预置场景。

```tsx | pure
import { Empty } from "@aura/ui";
```

## 何时使用

- 当目前没有数据时，用于显式的用户提示
- 初始化场景的友好提示

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/custom-desc.tsx" description="自定义描述文字。">自定义描述文字</code>
<code src="./demo/custom-image.tsx" description="自定义图片。">自定义图片</code>
<code src="./demo/extra-actions.tsx" description="附加操作按钮。">附加操作按钮</code>
<code src="./demo/preset-empty.tsx" description="预置类型 — 暂无数据。">预置类型 — 暂无数据</code>
<code src="./demo/preset-no-result.tsx" description="预置类型 — 无搜索结果。">预置类型 — 无搜索结果</code>
<code src="./demo/preset-404.tsx" description="预置类型 — 404。">预置类型 — 404</code>
<code src="./demo/preset.tsx" description="使用 `Empty.Preset` 快速使用预置的空状态场景。">预置场景</code>
## API

### EmptyProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| description | 描述文字 | `ReactNode` | `'暂无数据'` |
| image | 自定义图片，传 null 不显示 | `ReactNode` | - |
| imageStyle | 图片样式 | `CSSProperties` | - |
| children | 附加内容（如操作按钮） | `ReactNode` | - |

继承 `HTMLAttributes<HTMLDivElement>`。

### EmptyPresetProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 预置类型 | `'noData' \| 'noResult' \| '404'` | - |
