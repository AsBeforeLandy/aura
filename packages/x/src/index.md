---
title: XProvider
subtitle: AI 组件主题桥接
group: AI 组件
category: Components
description: 将 Aura 设计令牌映射到 antd 主题系统，为 AI 对话组件提供统一的暗色 / 主色 / 紧凑模式配置。
order: 0
toc: content
---

# XProvider AI 组件主题桥接

`@aura/x` 是 Aura 生态的 AI 对话组件库（对标 Ant Design X 的 Aura 实现）。`XProvider`
是它的主题桥接层：把 Aura 设计令牌映射到 antd 的主题系统，使 AI 对话组件与
`@aura/ui`、`@aura/business` 保持一致的紫罗兰视觉语言。

## 组件总览

按 RICH 交互范式分阶段组织：

| 阶段 | 组件 |
| --- | --- |
| 交互 | [`Bubble`](/x-components/bubble)（消息气泡）、[`Sender`](/x-components/sender)（输入框） |
| 引导 | [`Welcome`](/x-components/welcome)、[`Prompts`](/x-components/prompts)、[`Suggestion`](/x-components/suggestion) |
| 推理 | [`Think`](/x-components/think)（思考过程） |
| 反馈 | [`Actions`](/x-components/actions)（消息操作组）、[`MarkdownContent`](/x-components/markdown-content)（安全渲染） |
| 会话 | [`Conversations`](/x-components/conversations)（会话管理） |
| 数据 | [`useXStream`](/x-components/use-x-stream)、[`useXChat`](/x-components/use-x-chat) |

## 何时使用

- 应用需要接入 AI 对话界面（消息气泡、输入框、提示词等），并要求与 Aura 组件视觉统一时。
- 页面同时存在 `@aura/business` 组件与 AI 对话组件，需要共享同一套暗色 / 主色 / 紧凑配置时。

## 代码演示

### 主色即时生效

`colorPrimary` 会同时作用于气泡、按钮与链接色。切换色板观察 AI 气泡与输入框的变化：

<code src="./demo/basic.tsx" description="切换主题主色，AI 气泡 / 输入框即时跟随。">主题主色</code>

### 接入应用

将应用包裹在 `XProvider` 内，AI 组件即获得 Aura 的主色、圆角与语义色。
与 `BusinessProvider` 共用同一份令牌映射（来自 `@aura/shared`），两者可并存。
下例中的 `YourAIChatApp` 为你的应用组件占位（`| pure` 表示静态代码，不做 live demo）：

```tsx | pure
import React from 'react';
import { XProvider } from '@aura/x';

export default () => (
  <XProvider dark compact>
    <YourAIChatApp />
  </XProvider>
);
```

## API

### XProviderProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dark | 暗色模式：切换 antd 暗色算法 | `boolean` | `false` |
| compact | 是否启用紧凑模式 | `boolean` | `false` |
| colorPrimary | 主题主色，同时用于链接色 | `string` | `#7c3aed` |
| locale | 语言包 | `Locale` | `zhCN` |

## 注意事项

- `XProvider` 只负责 antd 主题桥接；Aura 自研组件的 CSS 变量（`--aura-*`）由应用层
  引入 `@aura/ui/style.css` 并通过 `data-theme` 作用域切换，两者互不冲突。
- `buildXThemeConfig` 作为命名导出暴露，便于在非组件场景（如 Storybook 装饰器、测试）
  复用同一份主题配置。
