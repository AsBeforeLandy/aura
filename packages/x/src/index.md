---
title: XProvider
subtitle: AI 组件主题桥接
group:
  title: 主题桥接
  order: 400
category: Components
description: 将 Aura 设计令牌映射到 antd 主题系统，为 AI 对话组件提供统一的暗色 / 主色 / 紧凑模式配置。
order: 0
toc: content
---

# XProvider AI 组件主题桥接

`@aura-react-comp/x` 是 Aura 生态的 AI 对话组件库（对标 Ant Design X 的 Aura 实现）。`XProvider`
是它的主题桥接层：把 Aura 设计令牌映射到 antd 的主题系统，使 AI 对话组件与
`@aura-react-comp/ui`、`@aura-react-comp/business` 保持一致的紫罗兰视觉语言。

## 组件总览

按 RICH 交互范式分阶段组织：

| 阶段 | 组件                                                                                                                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 交互 | [`Bubble`](/x-components/bubble)（消息气泡）、[`Sender`](/x-components/sender)（输入框）、[`Attachments`](/x-components/attachments)（附件条）、[`FileCard`](/x-components/file-card)（文件卡片）、[`Folder`](/x-components/folder)（文件树）                                  |
| 引导 | [`Welcome`](/x-components/welcome)、[`Prompts`](/x-components/prompts)、[`Suggestion`](/x-components/suggestion)                                                                                                                                                               |
| 推理 | [`Think`](/x-components/think)（单段思考）、[`ThoughtChain`](/x-components/thought-chain)（多步思维链）                                                                                                                                                                        |
| 反馈 | [`Actions`](/x-components/actions)（消息操作组）、[`MarkdownContent`](/x-components/markdown-content)（安全渲染）、[`Sources`](/x-components/sources)（来源引用）、[`CodeHighlighter`](/x-components/code-highlighter)（代码高亮）、[`Mermaid`](/x-components/mermaid)（图表） |
| 会话 | [`Conversations`](/x-components/conversations)（会话管理）                                                                                                                                                                                                                     |
| 数据 | [`useXStream`](/x-components/use-x-stream)、[`useXChat`](/x-components/use-x-chat)、[`XNotification`](/x-components/notification)（系统通知）                                                                                                                                  |

## 对标 Ant Design X

`@aura-react-comp/x` 以 [`@ant-design/x`](https://x.ant.design) 的组件划分为蓝本，
官方组件已**全部覆盖**：

| antdx 官方组件  | `@aura-react-comp/x` 对应           | 状态      |
| --------------- | ----------------------------------- | --------- |
| Bubble          | `Bubble` / `Bubble.List`            | ✅ 已实现 |
| Conversations   | `Conversations`                     | ✅ 已实现 |
| Welcome         | `Welcome`                           | ✅ 已实现 |
| Prompts         | `Prompts`                           | ✅ 已实现 |
| Think           | `Think`                             | ✅ 已实现 |
| ThoughtChain    | `ThoughtChain`                      | ✅ 已实现 |
| Attachments     | `Attachments` + `FileCard`          | ✅ 已实现 |
| Sender          | `Sender`                            | ✅ 已实现 |
| Suggestion      | `Suggestion`                        | ✅ 已实现 |
| Actions         | `Actions`                           | ✅ 已实现 |
| FileCard        | `FileCard`                          | ✅ 已实现 |
| Notification    | `XNotification` / `useNotification` | ✅ 已实现 |
| Sources         | `Sources`                           | ✅ 已实现 |
| CodeHighlighter | `CodeHighlighter`                   | ✅ 已实现 |
| Folder          | `Folder`                            | ✅ 已实现 |
| Mermaid         | `Mermaid`                           | ✅ 已实现 |
| XProvider       | `XProvider`                         | ✅ 已实现 |

实现上有三处**刻意的取舍**，不是遗漏：

1. **代码高亮的配色**用 `var(--aura-*)` 令牌而非固定主题对象（antdx 用
   `highlightProps` 透传 react-syntax-highlighter），换来亮暗主题自动跟随；
2. **Mermaid 的类型不硬依赖 mermaid 包**——`MermaidConfig` 是宽松签名，
   这样未安装 mermaid 的消费方也能正常 `import`。
3. **Notification 是系统通知**（`window.Notification`），不是页面内消息条；
   页面内提示请用 `@aura-react-comp/ui` 的 `Notification` / `Message`。

> 运行时（antdx 的 `XRequest` / `XStream` / `useXAgent`）在本库由
> [`useXStream`](/x-components/use-x-stream) 与 [`useXChat`](/x-components/use-x-chat) 承担：
> 传输细节由 `fetch` + 注入式 `onRequest` 掌控，不绑定特定服务商。

## 何时使用

- 应用需要接入 AI 对话界面（消息气泡、输入框、提示词等），并要求与 Aura 组件视觉统一时。
- 页面同时存在 `@aura-react-comp/business` 组件与 AI 对话组件，需要共享同一套暗色 / 主色 / 紧凑配置时。

## 代码演示

### 主色即时生效

`colorPrimary` 会同时作用于气泡、按钮与链接色。切换色板观察 AI 气泡与输入框的变化：

<code src="./demo/basic.tsx" description="切换主题主色，AI 气泡 / 输入框即时跟随。">主题主色</code>

### 接入应用

将应用包裹在 `XProvider` 内，AI 组件即获得 Aura 的主色、圆角与语义色。
与 `BusinessProvider` 共用同一份令牌映射（来自 `@aura-react-comp/shared`），两者可并存。
下例中的 `YourAIChatApp` 为你的应用组件占位（`| pure` 表示静态代码，不做 live demo）：

```tsx | pure
import React from 'react';
import { XProvider } from '@aura-react-comp/x';

export default () => (
  <XProvider dark compact>
    <YourAIChatApp />
  </XProvider>
);
```

## API

### XProviderProps

| 参数         | 说明                         | 类型      | 默认值    |
| ------------ | ---------------------------- | --------- | --------- |
| dark         | 暗色模式：切换 antd 暗色算法 | `boolean` | `false`   |
| compact      | 是否启用紧凑模式             | `boolean` | `false`   |
| colorPrimary | 主题主色，同时用于链接色     | `string`  | `#7c3aed` |
| locale       | 语言包                       | `Locale`  | `zhCN`    |

## 注意事项

- `XProvider` 只负责 antd 主题桥接；Aura 自研组件的 CSS 变量（`--aura-*`）由应用层
  引入 `@aura-react-comp/ui/style.css` 并通过 `data-theme` 作用域切换，两者互不冲突。
- `buildXThemeConfig` 作为命名导出暴露，便于在非组件场景（如 Storybook 装饰器、测试）
  复用同一份主题配置。
