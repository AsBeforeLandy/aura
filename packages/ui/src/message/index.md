---
title: Message
subtitle: 全局提示
group: 反馈
category: Components
description: 全局展示操作反馈信息，轻量级提示。
order: 2
demo:
  cols: 2
toc: content
---

# Message 全局提示

全局展示操作反馈信息，轻量级提示。

```tsx | pure
import { message } from "@aura/ui";
```

## 何时使用

- 操作成功/失败/进行中的轻量级反馈
- 顶部居中显示并自动消失

## 代码演示
<code src="./demo/basic-2.tsx" description="Message 消息提示。">Message 消息提示</code>
<code src="./demo/custom-duration.tsx" description="自定义持续时间（10秒）。">自定义持续时间（10秒）</code>
## API

### MessageApi

通过 `message` 调用，方法如下：

| 方法 | 说明 | 参数 |
| --- | --- | --- |
| `message.success` | 成功提示 | `(content: string, duration?: number)` |
| `message.error` | 错误提示 | `(content: string, duration?: number)` |
| `message.warning` | 警告提示 | `(content: string, duration?: number)` |
| `message.info` | 信息提示 | `(content: string, duration?: number)` |
| `message.loading` | 加载提示 | `(content: string, duration?: number)` |

`duration` 默认 `3000ms`，`loading` 默认不自动关闭。
