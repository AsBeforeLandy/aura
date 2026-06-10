---
title: Spin
subtitle: 加载中
group: 反馈
category: Components
description: 加载中状态指示器，支持独立使用或包裹内容区域。内置 GPU 加速动画与无障碍支持。
order: 1
demo:
  cols: 2
toc: content
---

# Spin 加载中

加载中状态指示器，支持独立使用或包裹内容区域。

```tsx | pure
import { Spin } from "@aura/ui";
```

## 何时使用

- 页面局部处于等待异步数据或正在渲染时
- 需要向用户展示正在加载中
- 需要避免快速请求时的加载闪烁（使用 `delay`）

## 设计要点

- **轨道 + 追逐弧线**：底层半透明轨道提供静止参照，顶层弧线旋转产生流畅的 spinner 效果
- **GPU 加速**：使用 `will-change: transform` 确保 60fps 动画
- **无障碍**：支持 `prefers-reduced-motion`，对减弱动画用户自动降级为静态指示
- **防闪烁**：`delay` 属性避免快速完成的异步操作闪现 loading

## 代码演示

<code src="./demo/basic.tsx" description="独立的加载指示器，支持三种尺寸和两种变体。">基本用法</code>
<code src="./demo/container.tsx" description="包裹内容区域，`spinning` 控制加载状态，`delay` 避免闪烁。">包裹内容</code>

## API

### SpinProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 加载指示器尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| spinning | 是否加载中 | `boolean` | `true` |
| delay | 延迟显示加载指示器（ms），避免快速加载时闪烁 | `number` | `0` |
| variant | 加载动画样式：`default` 旋转弧线，`dot` 弹跳圆点 | `'default' \| 'dot'` | `'default'` |
| tip | 加载提示文字 | `ReactNode` | - |
| indicator | 自定义加载图标 | `ReactNode` | - |
| children | 包裹的内容（加载时半透明 + 模糊） | `ReactNode` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
