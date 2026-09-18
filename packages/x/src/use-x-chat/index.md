---
title: useXChat
subtitle: 对话消息编排
group:
  title: 数据流
  order: 401
category: Components
description: 对话消息列表状态机：user/assistant 成对追加、loading 态、增量更新、错误态、中止与清空。与 useXStream 正交。
order: 2
toc: content
---

# useXChat 对话消息编排

维护对话消息列表的状态机：`send` 成对追加 user 消息与 assistant 占位（loading 态）、
支持增量更新内容、错误态、中止（保留部分内容）与清空。**不做传输**——怎么请求由
`onRequest` 决定，典型组合是内部调用 [`useXStream`](/x-components/use-x-stream)
并在 `onMessage` 里 `update` 内容。

## 代码演示

### 消息状态机实况

直接可视化 Hook 维护的状态：每条消息的 `role` / `status` / 增量 `content`，
以及 `send` / `stop` / `clear` 三个动作。

<code src="./demo/basic.tsx" description="逐字流式写入 assistant 占位，展示 role/status/增量内容。">消息状态机</code>

### 与 useXStream 组合（SSE 打字机）

```tsx | pure
import React from 'react';
import { useXChat, useXStream } from '@aura/x';

export default () => {
  const { fetchData } = useXStream();
  const { messages, loading, send, stop } = useXChat({
    onRequest: async ({ message, signal, update }) => {
      let acc = '';
      await fetchData({
        url: '/api/chat',
        body: { message },
        signal, // 必须传递：否则 stop() 无法中止
        onMessage: (chunk) => {
          if (chunk.data === '[DONE]') return; // 结束哨兵自行过滤
          acc += chunk.data;
          update({ content: acc });            // 增量更新 assistant 内容
        },
      });
    },
  });

  return (
    <div>
      {messages.map((m) => (
        <p key={m.id}>
          <b>{m.role}</b>：{m.content}
          {m.status === 'error' ? '（出错了）' : ''}
        </p>
      ))}
      <button disabled={loading} onClick={() => send('你好')}>
        发送
      </button>
      {loading ? <button onClick={stop}>停止</button> : null}
    </div>
  );
};
```

## API

### useXChat(options)

参数 `UseXChatOptions`：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| initialMessages | 初始消息列表 | `XMessage[]` | `[]` |
| onRequest | 发起一次 AI 请求；请把 `context.signal` 传给底层 fetch | `(context: XChatRequestContext) => Promise<void>` | - |
| onError | 请求失败回调（abort 不触发） | `(error: Error) => void` | - |

返回值 `UseXChatResult`：

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| messages | 消息列表 | `XMessage[]` |
| loading | 是否有进行中的请求 | `boolean` |
| send | 发送一条用户消息；loading 期间或内容为空白时忽略 | `(content: string) => void` |
| stop | 中止当前请求（保留 assistant 已生成的部分内容） | `() => void` |
| clear | 中止并清空，回到 `initialMessages` | `() => void` |

### XChatRequestContext（onRequest 入参）

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| message | 本轮用户输入 | `string` |
| messages | 完整消息列表（已含本轮 user 消息与 assistant 占位） | `XMessage[]` |
| signal | 中止信号——必须传递给底层 fetch，否则 `stop()` 无法生效 | `AbortSignal` |
| update | 增量更新 assistant 占位（只合并 `content` / `status`） | `(patch: Partial<Pick<XMessage, 'content' \| 'status'>>) => void` |

### XMessage

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| id | 消息唯一标识（实例内自增） | `string` |
| role | `user` / `assistant` / `system` | `string` |
| content | 消息内容 | `string` |
| status | assistant 消息的生成状态；user / system 不设置 | `'loading' \| 'success' \| 'error'` |

## 注意事项

- **`signal` 必须传递**：`onRequest` 不尊重信号的话，`stop()` / 卸载都无法中止。
- `onRequest` 抛错视为失败（assistant 进入 error 态并回调 `onError`）；
  因 abort 被打断视为正常结束（保留已生成的部分内容，状态收敛为 success）。
- `send` 是串行语义：loading 期间的 `send` 会被忽略；如需多轮并发请自行管理多个实例。
