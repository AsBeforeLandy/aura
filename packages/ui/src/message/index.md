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
import { message } from '@aura-react-comp/ui';
```

## 何时使用

- 操作成功/失败/进行中的轻量级反馈
- 顶部居中显示并自动消失

## 代码演示

<code src="./demo/basic-2.tsx" description="Message 消息提示。">Message 消息提示</code>
<code src="./demo/custom-duration.tsx" description="自定义持续时间（10秒）。">自定义持续时间（10秒）</code>
<code src="./demo/update.tsx" description="用 `key` 原位更新：loading 结束后换成 success，内容支持 ReactNode。">同位更新</code>

## API

### MessageApi

通过 `message` 调用，方法如下。首参 `content` 既可以是纯内容（`ReactNode`），也可以是完整的 `MessageArgs` 对象：

| 方法              | 说明                                | 参数                                                     |
| ----------------- | ----------------------------------- | -------------------------------------------------------- |
| `message.success` | 成功提示                            | `(content: ReactNode \| MessageArgs, duration?: number)` |
| `message.error`   | 错误提示                            | `(content: ReactNode \| MessageArgs, duration?: number)` |
| `message.warning` | 警告提示                            | `(content: ReactNode \| MessageArgs, duration?: number)` |
| `message.info`    | 信息提示                            | `(content: ReactNode \| MessageArgs, duration?: number)` |
| `message.loading` | 加载提示（默认不自动关闭）          | `(content: ReactNode \| MessageArgs, duration?: number)` |
| `message.open`    | 完整参数打开，变体由 `variant` 指定 | `(args: MessageArgs & { variant? })`                     |
| `message.destroy` | 关闭指定消息；不传 `key` 关闭全部   | `(key?: string)`                                         |

- `duration` 默认 `3000ms`，传 `0` 表示不自动关闭。
- 重复调用相同 `key` 会**原位更新**内容与变体（不重新弹出新消息），并重置自动关闭计时——适合「loading → success」这类状态流转。

### MessageArgs

| 属性     | 说明                                     | 类型         | 默认值   |
| -------- | ---------------------------------------- | ------------ | -------- |
| content  | 消息内容，支持任意 ReactNode             | `ReactNode`  | -        |
| key      | 唯一标识；同 key 重复调用原位更新        | `string`     | 自动生成 |
| duration | 自动关闭延时（毫秒），`0` 表示不自动关闭 | `number`     | `3000`   |
| icon     | 自定义图标，覆盖变体默认图标             | `ReactNode`  | -        |
| onClose  | 消息关闭（自动关闭 / destroy）后的回调   | `() => void` | -        |
