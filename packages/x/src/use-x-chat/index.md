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

### 多会话切换（conversationKey）

传入 `conversationKey`，Hook 会在 key 变化时按 `defaultMessages` 重新初始化消息，
并中止上一个会话进行中的请求——这是多会话应用的底座。
完整闭环（`Conversations` + `Bubble.List` + `Sender`）
见 [`Bubble` 的「多会话闭环」示例](/x-components/bubble)。

<code src="./demo/conversation-key.tsx" description="切换 key 按会话加载历史，并用 setMessages 直接替换消息。">会话切换</code>

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
          update({ content: acc }); // 增量更新 assistant 内容
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

| 参数            | 说明                                                                                                                                                           | 类型                                                        | 默认值 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| conversationKey | 会话唯一标识。**变化时按 `defaultMessages` 重新初始化消息**，并中止上一个会话在途的请求                                                                        | `string \| number`                                          | -      |
| defaultMessages | 默认消息：数组，或 `({ conversationKey }) => XMessage[] \| Promise<XMessage[]>`。只在挂载与 `conversationKey` 变化时求值，因此传数组字面量也不会每次渲染都重置 | `XMessage[] \| (info) => XMessage[] \| Promise<XMessage[]>` | `[]`   |
| initialMessages | 数组形态的默认消息简写（`defaultMessages` 优先）                                                                                                               | `XMessage[]`                                                | `[]`   |
| onRequest       | 发起一次 AI 请求；请把 `context.signal` 传给底层 fetch                                                                                                         | `(context: XChatRequestContext) => Promise<void>`           | -      |
| onError         | 请求失败回调（abort 不触发）                                                                                                                                   | `(error: Error) => void`                                    | -      |

返回值 `UseXChatResult`：

| 参数                        | 说明                                                   | 类型                             |
| --------------------------- | ------------------------------------------------------ | -------------------------------- |
| messages                    | 消息列表                                               | `XMessage[]`                     |
| loading                     | 是否有进行中的请求                                     | `boolean`                        |
| isDefaultMessagesRequesting | `defaultMessages` 为异步函数时，历史消息是否仍在加载   | `boolean`                        |
| send                        | 发送一条用户消息；loading 期间或内容为空白时忽略       | `(content: string) => void`      |
| stop                        | 中止当前请求（保留 assistant 已生成的部分内容）        | `() => void`                     |
| clear                       | 中止并复位到最近一次解析出的默认消息                   | `() => void`                     |
| setMessages                 | 直接替换消息列表，**不触发请求**（多会话切换时写回用） | `(messages: XMessage[]) => void` |

### XChatRequestContext（onRequest 入参）

| 参数     | 说明                                                   | 类型                                                              |
| -------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| message  | 本轮用户输入                                           | `string`                                                          |
| messages | 完整消息列表（已含本轮 user 消息与 assistant 占位）    | `XMessage[]`                                                      |
| signal   | 中止信号——必须传递给底层 fetch，否则 `stop()` 无法生效 | `AbortSignal`                                                     |
| update   | 增量更新 assistant 占位（只合并 `content` / `status`） | `(patch: Partial<Pick<XMessage, 'content' \| 'status'>>) => void` |

### XMessage

| 参数    | 说明                                           | 类型                                |
| ------- | ---------------------------------------------- | ----------------------------------- |
| id      | 消息唯一标识（实例内自增）                     | `string`                            |
| role    | `user` / `assistant` / `system`                | `string`                            |
| content | 消息内容                                       | `string`                            |
| status  | assistant 消息的生成状态；user / system 不设置 | `'loading' \| 'success' \| 'error'` |

## 注意事项

- **`signal` 必须传递**：`onRequest` 不尊重信号的话，`stop()` / 卸载都无法中止。
- `onRequest` 抛错视为失败（assistant 进入 error 态并回调 `onError`）；
  因 abort 被打断视为正常结束（保留已生成的部分内容，状态收敛为 success）。
- `send` 是串行语义：loading 期间的 `send` 会被忽略；如需多轮并发请自行管理多个实例。
- **多会话的两个坑**（`conversationKey` 已经替你处理了后一个）：
  1. **写回存储要判归属**：切会话瞬间 `messages` 仍是上一个会话的内容，
     此时若无条件写回，就会把它写进新会话。做法是用 `defaultMessages`
     的解析结果标记「这份消息属于谁」，只有归属等于当前 `conversationKey`
     时才落盘（见 [`Bubble` 的闭环示例](/x-components/bubble)）。
  2. **在途请求的收尾不能串会话**：切换会中止旧请求，而它的收尾（catch / finally）
     是异步的。Hook 内部把 assistant 消息 id **捕获在闭包里**而不是读共享 ref，
     并且只在自己的 controller 仍是当前请求时才去动 `loading`——
     否则旧请求收尾会把新会话刚点亮的 loading 态按下去（已有回归用例覆盖）。
- `defaultMessages` 为异步函数时，首帧 `messages` 为空、`isDefaultMessagesRequesting` 为
  `true`，需要自己做加载占位；数组形态则是同步就绪、没有这一帧。
