---
title: useXStream
subtitle: 流式传输层
group: AI 组件
category: Components
description: fetch + 读流 + SSE / 纯文本两种模式解析 + abort 生命周期。不做消息状态管理，与 useXChat 正交。
order: 1
toc: content
---

# useXStream 流式传输层

负责「把后端的流式响应变成一条条消息」：fetch、读流、SSE 解析（或纯文本增量流）、
abort 生命周期。**不做消息状态管理**——那是 [`useXChat`](/x-components/use-x-chat)
的职责，两者保持正交，可独立使用。

## 何时使用

- 后端以 `text/event-stream` 返回 SSE，或以纯文本增量返回生成内容；
- 需要自行编排消息状态（例如非对话场景的流式日志）。

若在构建对话界面，推荐与 [`useXChat`](/x-components/use-x-chat) 组合使用。

## 代码演示

### SSE 实况解析（Blob URL 模拟服务端）

点击按钮，观察消息**逐条到达**：SSE 帧解析、`[DONE]` 哨兵过滤全部由 `useXStream` 完成。

<code src="./demo/sse.tsx" description="Blob URL 模拟 SSE 服务端，展示逐条解析与哨兵过滤。">SSE 实况解析</code>

### 基本用法（SSE）

```tsx | pure
import React from 'react';
import { useXStream } from '@aura/x';

export default () => {
  const { fetchData, abort, streaming } = useXStream();

  const run = () =>
    fetchData({
      url: '/api/chat',
      method: 'POST',
      body: { message: '你好' },
      onMessage: (chunk) => console.log(chunk.data), // 逐条增量
      onDone: () => console.log('结束'),
      onError: (error) => console.error(error),
    });

  return (
    <button onClick={run} disabled={streaming}>
      {streaming ? '生成中…' : '开始'}
    </button>
  );
};
```

### 纯文本流

后端返回 `Content-Type: text/plain` 的增量内容（非 SSE）时，每个字节块会
原样作为一条消息产出，无需任何配置。

## API

### useXStream()

返回值 `UseXStreamResult`：

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| streaming | 是否有进行中的流式请求 | `boolean` |
| fetchData | 发起一次流式请求并逐条消费。同一时刻只保留一条流：再次调用会先 abort 上一次（静默结束） | `(options: FetchDataStreamOptions) => Promise<void>` |
| abort | 中止当前流（静默结束：不触发 `onError` / `onDone`） | `() => void` |

### FetchDataStreamOptions

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url | 流式接口地址 | `string` | - |
| method | 请求方法；缺省时 body 存在为 POST，否则 GET | `string` | 自动推断 |
| headers | 请求头 | `Record<string, string>` | `Accept: text/event-stream` |
| body | 请求体；普通对象自动 `JSON.stringify` 并设置 `Content-Type` | `unknown` | - |
| onMessage | 每解析出一条消息回调一次 | `(chunk: XStreamChunk) => void` | - |
| onDone | 流正常结束后回调 | `() => void` | - |
| onError | 请求或读流出错后回调（abort 不触发） | `(error: Error) => void` | - |

### XStreamChunk

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| data | `data` 字段内容；多行 data 以 `\n` 拼接 | `string` |
| event | `event` 字段，缺省为 `"message"` | `string` |
| id | `id` 字段（可选） | `string` |

## 注意事项

- **abort 是正常结束**：不触发 `onError` / `onDone`；组件卸载时也会自动 abort。
- 解析器是协议无关的：`data: [DONE]` 之类「结束哨兵」会**原样产出**，需消费方自行过滤。
- 兼容 BOM、CRLF / LF 混用、多行 data、注释行与心跳帧（无 data 的帧不产出消息）。
