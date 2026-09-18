---
title: MarkdownContent
subtitle: 消息 Markdown 渲染
group:
  title: 反馈
  order: 403
category: Components
description: 基于 react-markdown 的安全渲染器：不渲染原始 HTML、链接协议白名单、代码块纯展示，支持流式未闭合语法。
order: 4
demo:
  cols: 1
toc: content
---

# MarkdownContent 消息 Markdown 渲染

## 何时使用

- AI 消息包含 Markdown（标题、列表、代码块、表格、链接）时，作为
  [`Bubble`](/x-components/bubble) 的 `contentRender` 使用。

**安全模型**（默认值，无需配置）：不渲染原始 HTML（HTML 标签按纯文本展示）、
链接协议白名单（仅 `http` / `https` / `mailto`，其余清洗为空）、
代码块纯展示不执行；外链统一 `target="_blank" rel="noreferrer"`。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="常见 Markdown 语法的渲染效果与安全默认值。">基本用法</code>

## API

### MarkdownContentProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | Markdown 文本；流式过程中传入未闭合语法也可以（remark 按块级容错渲染） | `string` | `''` |
| className | 透传到根元素 | `string` | - |

## 注意事项

- `react-markdown` 是 `@aura/x` 的**可选 peer 依赖**：未安装时 `MarkdownContent`
  无法使用（`Bubble` 会退回纯文本渲染），安装后按需引入即可。
- 流式场景直接把累积文本传给 `children`；未闭合的代码块 / 表格由 remark
  按块级容错渲染，收到新内容后重新渲染即可。
