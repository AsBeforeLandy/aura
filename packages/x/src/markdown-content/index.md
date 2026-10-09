---
title: MarkdownContent
subtitle: 消息 Markdown 渲染
group:
  title: 反馈
  order: 403
category: Components
description: 基于 react-markdown 的安全渲染器：不渲染原始 HTML、链接协议白名单、围栏代码块交给 CodeHighlighter 高亮，支持流式未闭合语法。
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
代码块**只做语法着色、从不执行**（高亮不改变「内容是文本」这一事实）；
外链统一 `target="_blank" rel="noreferrer"`。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="常见 Markdown 语法的渲染效果与安全默认值。">基本用法</code>

### 代码块的三种形态

默认高亮、`highlightCode={false}` 关回朴素 `pre`、`renderCode` 完全自定义。

<code src="./demo/plain-code.tsx" description="同一段代码在三种代码块策略下的渲染差异。">代码块策略</code>

## API

### MarkdownContentProps

| 参数          | 说明                                                                                                                                           | 类型                                                  | 默认值 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------ |
| children      | Markdown 文本；流式过程中传入未闭合语法也可以（remark 按块级容错渲染）                                                                         | `string`                                              | `''`   |
| highlightCode | 围栏代码块是否交给 [`CodeHighlighter`](/x-components/code-highlighter) 渲染（语法着色 + 语言标识 + 一键复制）；`false` 回到朴素的 `pre > code` | `boolean`                                             | `true` |
| renderCode    | 完全自定义代码块渲染，优先级高于 `highlightCode`；返回的节点会**直接取代** `<pre>`，需自行负责包裹                                             | `(info: { lang: string; code: string }) => ReactNode` | -      |
| className     | 透传到根元素                                                                                                                                   | `string`                                              | -      |

## 注意事项

- `react-markdown` 是 `@aura-react-comp/x` 的**运行时依赖**（`dependencies`，随包自动安装），
  应用侧无需额外声明。
- 组件本身是**可选**的：不传 `contentRender` 时 [`Bubble`](/x-components/bubble) 按纯文本渲染。
  但依赖本身是必需的——包入口统一 re-export 了 `MarkdownContent`，而它内部是
  **静态** `import ReactMarkdown from 'react-markdown'`，因此从 `@aura-react-comp/x` 顶层引入
  任意组件时，打包器都需要能解析到 `react-markdown`。这正是它放在 `dependencies`
  而不是 `peerDependencies` 的原因（与 `@aura-react-comp/business` 处理 `pdfjs-dist` 同款）。
- 流式场景直接把累积文本传给 `children`；未闭合的代码块 / 表格由 remark
  按块级容错渲染，收到新内容后重新渲染即可。
- **代码块替换的是 `<pre>` 而不是 `<code>`**：围栏代码块在 hast 里是 `pre > code`，
  若在 `code` 渲染器里返回 `CodeHighlighter`（根节点是 `div`），会形成
  `<pre><div>` 这种非法嵌套。因此实现上覆写 `pre`、直接读子元素的
  `language-xxx` 类名，那层 `code` 也就不再渲染。
- 传入的代码内容带尾随换行，渲染前会去掉一个——否则单行代码会在末尾多出一条空白行。
