---
title: Bubble
subtitle: 对话气泡
group: AI 组件
category: Components
description: AI 对话的原子气泡：按角色分侧渲染，支持 loading 打字态、内容渲染扩展点与列表自动滚动。
order: 3
demo:
  cols: 1
toc: content
---

# Bubble 对话气泡

## 何时使用

- 展示 AI 对话中的单条或多条消息，assistant 在左、user 在右；
- 需要 loading 打字动画、自定义内容渲染（Markdown / 代码高亮）或头像插槽时。

与 [`Sender`](/x-components/sender)、[`useXChat`](/x-components/use-x-chat)
组合即可搭建完整的对话页。

## 代码演示

### 完整对话（配 useXChat + Sender）

`onRequest` 内用逐字 `update` 模拟流式输出；`contentRender` 把 assistant 消息
交给 `MarkdownContent` 渲染。

<code src="./demo/basic.tsx" description="消息气泡 + 打字动画 + 自动滚动到底部的最小对话闭环。">基本对话</code>

### 变体与方向

三种变体（filled / outlined / shadow）× 两种角色的渲染对比。

<code src="./demo/variants.tsx" description="3 变体 × 2 角色 = 6 种组合。">变体矩阵</code>

### 插槽组合

avatar / header / footer 三个插槽，footer 里放 Actions 操作组。

<code src="./demo/slots.tsx" description="avatar + header + footer(Actions) 完整插槽。">插槽组合</code>

## API

### BubbleProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| role | 消息角色：user 渲染在右侧，assistant / system 在左侧 | `'user' \| 'assistant' \| 'system'` | `'assistant'` |
| content | 消息内容（纯文本） | `string` | `''` |
| contentRender | 自定义内容渲染扩展点（如 MarkdownContent） | `(content: string) => ReactNode` | - |
| avatar | 头像插槽 | `ReactNode` | - |
| header | 气泡上方说明区 | `ReactNode` | - |
| footer | 气泡下方操作区 | `ReactNode` | - |
| loading | 生成中：内容区显示三点动画，`aria-busy` 标记 | `boolean` | `false` |
| variant | 视觉变体 | `'filled' \| 'outlined' \| 'shadow'` | `'filled'` |
| className / style | 透传 | - | - |

### Bubble.List

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 气泡列表（`BubbleProps` + `key`） | `BubbleListItem[]` | - |
| autoScroll | items 变化时自动滚动到底部 | `boolean` | `true` |

## 注意事项

- **内容安全**：`content` 按纯文本渲染；需要 Markdown 时请显式传
  `contentRender={(content) => <MarkdownContent>{content}</MarkdownContent>}`，
  由 `MarkdownContent` 负责安全默认值（不渲染原始 HTML、协议白名单）。
- 列表容器的 `maxHeight` 由使用方控制，超出部分内部滚动并自动跟随到底部。
