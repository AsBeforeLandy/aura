---
title: Popconfirm
subtitle: 气泡确认框
group: 反馈
category: Components
description: 点击元素弹出气泡确认框，适用于轻量级确认场景。
order: 5
demo:
  cols: 2
toc: content
---

# Popconfirm 气泡确认框

点击元素弹出气泡确认框，适用于轻量级确认场景。

```tsx | pure
import { Popconfirm } from "@aura/ui";
```

## 何时使用

- 需要用户确认操作时
- 比 Modal 更轻量的确认场景

## 代码演示
<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/with-desc.tsx" description="带描述。">带描述</code>
<code src="./demo/variant.tsx" description="变体样式。">变体样式</code>
<code src="./demo/placement-2.tsx" description="弹出方位。">弹出方位</code>
<code src="./demo/custom-btn.tsx" description="自定义按钮文字。">自定义按钮文字</code>
<code src="./demo/disabled.tsx" description="禁用。">禁用</code>
<code src="./demo/placement.tsx" description="支持 `top`、`bottom`、`left`、`right` 四个方向。">弹出方向</code>
## API

### PopconfirmProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 确认标题（必填） | `ReactNode` | - |
| description | 确认描述 | `ReactNode` | - |
| onConfirm | 确认回调 | `() => void` | - |
| onCancel | 取消回调 | `() => void` | - |
| okText | 确认按钮文字 | `string` | `'确定'` |
| cancelText | 取消按钮文字 | `string` | `'取消'` |
| variant | 变体样式 | `'default' \| 'warning' \| 'error'` | `'default'` |
| placement | 弹出方位 | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` |
| disabled | 是否禁用 | `boolean` | `false` |
| children | 目标元素（必填） | `ReactElement` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
