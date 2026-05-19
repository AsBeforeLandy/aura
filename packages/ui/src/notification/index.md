---
title: Notification
subtitle: 通知提醒框
group: 反馈
category: Components
description: 通知提醒框，在页面角落展示重要信息。
order: 3
demo:
  cols: 2
toc: content
---

# Notification 通知提醒框

通知提醒框，在页面角落展示重要信息。

```tsx | pure
import { notification } from "@aura/ui";
```

## 何时使用

- 需要展示较复杂的提醒内容时
- 系统级通知，不打断用户操作

## 代码演示
<code src="./demo/basic-2.tsx" description="Notification 通知提醒。">Notification 通知提醒</code>
<code src="./demo/placement.tsx" description="不同位置。">不同位置</code>
<code src="./demo/auto-close.tsx" description="自动关闭（2秒）。">自动关闭（2秒）</code>
## API

### NotificationApi

通过 `notification` 调用，方法如下：

| 方法 | 说明 | 参数 |
| --- | --- | --- |
| `notification.open` | 打开通知 | `(options: NotificationOptions)` |
| `notification.success` | 成功通知 | `(options)` |
| `notification.error` | 错误通知 | `(options)` |
| `notification.warning` | 警告通知 | `(options)` |
| `notification.info` | 信息通知 | `(options)` |

### NotificationOptions

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 通知标题 | `string` | - |
| content | 通知内容（必填） | `string` | - |
| duration | 自动关闭延时（毫秒） | `number` | `4500` |
| variant | 通知类型 | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` |
| placement | 弹出位置 | `'topLeft' \| 'topRight' \| 'bottomLeft' \| 'bottomRight'` | `'topRight'` |
| onClose | 关闭回调 | `() => void` | - |
