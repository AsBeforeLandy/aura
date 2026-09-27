---
title: Mermaid
subtitle: 图表工具
group:
  title: 反馈
  order: 403
category: Components
description: 把 mermaid 源码渲染为 SVG，支持图片 / 代码双视图、缩放、重置、下载与复制；mermaid 通过动态 import 按需加载。
order: 17
demo:
  cols: 1
toc: content
---

# Mermaid 图表工具

## 何时使用

- AI 回答里出现了 mermaid 图表源码（流程图、时序图、状态图等），需要直接渲染成图；
- 需要让用户在「看图」和「看源码」之间切换，或把图导出为 SVG。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="流程图与时序图；图片 / 代码切换 + 缩放 / 重置 / 下载 / 复制。">渲染与操作</code>

### 自定义头部

<code src="./demo/custom-header.tsx" description="header=null 去掉头部，或替换为全自定义头部；关闭内置操作按钮。">头部定制</code>

## API

### MermaidProps

| 参数               | 说明                                                                          | 类型                                 | 默认值                                            |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| children           | mermaid 源码                                                                  | `string`                             | `''`                                              |
| header             | 头部：不传用默认头部；`null` 不渲染；传节点则完全替换（内置操作按钮随之消失） | `ReactNode \| null`                  | -                                                 |
| config             | mermaid 配置；**必须是引用稳定的对象**                                        | `MermaidConfig`                      | `{ startOnLoad: false, securityLevel: 'strict' }` |
| actions            | 操作栏配置                                                                    | `MermaidActions`                     | 全部开启                                          |
| onRenderTypeChange | 渲染类型切换回调                                                              | `(value: 'image' \| 'code') => void` | -                                                 |
| className / style  | 透传到根节点                                                                  | -                                    | -                                                 |

### MermaidActions

| 参数           | 说明                       | 类型        | 默认值 |
| -------------- | -------------------------- | ----------- | ------ |
| enableZoom     | 显示放大 / 缩小 / 重置按钮 | `boolean`   | `true` |
| enableDownload | 显示下载 SVG 按钮          | `boolean`   | `true` |
| enableCopy     | 显示复制源码按钮           | `boolean`   | `true` |
| customActions  | 追加自定义操作节点         | `ReactNode` | -      |

## 注意事项

- **mermaid 是可选 peer 依赖**：组件用动态 `import()` 加载它，未安装时不会拖累主包，
  只有真正渲染到 `<Mermaid />` 时才报错并给出安装提示。
- `config` 传对象字面量会导致每次父组件重渲染都重新初始化并重绘图表，
  请用 `useMemo` 缓存或提取为模块常量。
- mermaid 自身的主题需要通过 `config.theme`（`'default' \| 'dark' \| 'neutral' \|
'forest'`）传入——它接受的是具体值而非 CSS 变量，所以无法像
  [`CodeHighlighter`](/x-components/code-highlighter) 那样自动跟随 `data-theme`。
- 渲染失败（语法错误）时不会白屏：显示错误详情，并可通过头部的「代码」视图查看源码定位问题。
- 默认 `securityLevel` 固定为 `'strict'`，会净化图表内的内联 HTML 与链接协议。
