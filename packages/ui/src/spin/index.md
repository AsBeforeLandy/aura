---
title: Spin
subtitle: 加载中
group: 反馈
category: Components
description: 加载中状态指示器，支持包裹内容区域。
order: 1
demo:
  cols: 2
toc: content
---

# Spin 加载中

加载中状态指示器，支持包裹内容区域。

```tsx | pure
import { Spin } from "@aura/ui";
```

## 何时使用

- 页面局部处于等待异步数据或正在渲染时
- 需要向用户展示正在加载中

## 代码演示
<code src="./demo/basic.tsx" description="独立的加载指示器，可设置尺寸和提示文字。">基本用法</code>
<code src="./demo/container.tsx" description="包裹内容区域，`spinning` 控制加载状态。">包裹内容</code>
## API

### SpinProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 加载指示器尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| spinning | 是否加载中 | `boolean` | `true` |
| tip | 加载提示文字 | `ReactNode` | - |
| indicator | 自定义加载图标 | `ReactNode` | - |
| children | 包裹的内容 | `ReactNode` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
