---
title: CodeHighlighter
subtitle: 代码高亮
group:
  title: 反馈
  order: 403
category: Components
description: 基于 prism-react-renderer 的代码高亮：头部语言标识 + 一键复制，配色走 --aura-* 令牌，亮暗主题自动跟随。
order: 16
demo:
  cols: 1
toc: content
---

# CodeHighlighter 代码高亮

## 何时使用

- AI 回答里出现代码片段，需要语法着色与一键复制；
- 单独展示一段代码（如工具调用参数、生成的补丁）；
- [`MarkdownContent`](/x-components/markdown-content) 的**围栏代码块已默认走本组件**
  （`highlightCode` 默认 `true`），一般不必手动接入；需要换掉高亮实现时
  用它的 `renderCode` 逃生舱。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="多种语言的高亮效果；头部语言标识 + 复制按钮。">语言与复制</code>

### 自定义头部

<code src="./demo/custom-header.tsx" description="header=false 去掉头部，或传入函数自定义头部。">头部定制</code>

## API

### CodeHighlighterProps

| 参数              | 说明                                                                                           | 类型                                                                                   | 默认值     |
| ----------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| lang              | 代码语言；未内置的语言安全回退为纯文本                                                         | `string`                                                                               | `'text'`   |
| children          | 代码内容                                                                                       | `string`                                                                               | `''`       |
| header            | 头部内容：不传用默认头部（语言名 + 复制按钮）；`false` 不渲染；函数形式返回 `false` 同样不渲染 | `ReactNode \| ((info: { lang: string; code: string }) => ReactNode \| false) \| false` | -          |
| copiedText        | 复制成功后的提示文案                                                                           | `string`                                                                               | `'已复制'` |
| onCopy            | 复制成功回调                                                                                   | `(code: string) => void`                                                               | -          |
| className / style | 透传到根节点                                                                                   | -                                                                                      | -          |

### CodeHighlighterRef

| 属性          | 说明       | 类型                     |
| ------------- | ---------- | ------------------------ |
| nativeElement | 根节点 DOM | `HTMLDivElement \| null` |

## 注意事项

- **配色不绑定主题对象**：Prism 主题把颜色写成 `var(--aura-*)` 引用，
  `<style>` 内联样式里引用 CSS 变量同样生效，因此切换 `data-theme` 时高亮配色
  自动跟随，不需要在 JS 里判断明暗、也不存在两份配色表走样的风险。
- 内置语言由 `prism-react-renderer` 决定（js / ts / tsx / jsx / json / bash /
  css / html / markdown / python / go / java / sql / yaml 等约 30 种）；
  传入未内置的语言不会报错，按纯文本渲染。
- 复制优先用 Clipboard API，非安全上下文（`http://` 内网地址等）下
  `navigator.clipboard` 不可用，会自动回退到临时 `textarea` + `execCommand`。
- 行容器是 `display: block` 的 `<span>` 而非 `<div>`——`<pre>` / `<code>` 的内容模型
  只接受短语内容，塞 `div` 属于无效 HTML。
