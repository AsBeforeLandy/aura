---
title: Sources
subtitle: 来源引用
group:
  title: 反馈
  order: 403
category: Components
description: 联网搜索 / RAG 场景的来源引用：头部摘要 + 有序列表，支持折叠、外链、图标与行内上标模式。
order: 15
demo:
  cols: 1
toc: content
---

# Sources 来源引用

## 何时使用

- 联网搜索或 RAG 场景下，答案引用了多个外部来源，需要把这些地址列在回答下方；
- 与 [`Bubble`](/x-components/bubble) 的 `footer` 插槽搭配，或用 `inline` 模式混排在正文里。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="头部摘要 + 有序列表；可折叠、可点击来源。">来源列表</code>

### 行内模式

<code src="./demo/inline.tsx" description="正文中的上标序号，悬停或聚焦时浮出来源详情。">行内上标</code>

## API

### SourcesProps

| 参数                | 说明                                        | 类型                          | 默认值    |
| ------------------- | ------------------------------------------- | ----------------------------- | --------- |
| items               | 来源列表                                    | `SourcesItem[]`               | -         |
| title               | 头部标题；缺省按条数生成「已引用 N 个来源」 | `ReactNode`                   | -         |
| expandIconPosition  | 折叠图标位置                                | `'start' \| 'end'`            | `'start'` |
| defaultExpanded     | 非受控默认展开态                            | `boolean`                     | `true`    |
| expanded            | 受控展开态                                  | `boolean`                     | -         |
| onExpand            | 展开态变化回调（受控 / 非受控都会触发）     | `(expanded: boolean) => void` | -         |
| onClick             | 点击某条来源                                | `(item: SourcesItem) => void` | -         |
| inline              | 行内模式：渲染为上标序号 + 悬停浮层         | `boolean`                     | `false`   |
| activeKey           | 行内模式下强制激活的项（受控）              | `React.Key`                   | -         |
| popoverOverlayWidth | 行内浮层宽度                                | `number \| string`            | `300`     |

### SourcesItem

| 参数        | 说明                                                                     | 类型        |
| ----------- | ------------------------------------------------------------------------ | ----------- |
| key         | 唯一键（缺省用索引）                                                     | `React.Key` |
| title       | 来源标题                                                                 | `ReactNode` |
| url         | 来源地址；有值时整项渲染为外链（`target="_blank"` + `rel="noreferrer"`） | `string`    |
| icon        | 来源图标                                                                 | `ReactNode` |
| description | 补充说明，显示在标题下方                                                 | `ReactNode` |

## 注意事项

- `items` 为空数组时整体渲染 `null`（与 `Suggestion` / `Attachments` 的约定一致）；
- 无 `url` 时：传了 `onClick` 渲染为按钮，否则渲染为纯文本（不留无效的可点击元素）；
- 列表容器是 `<ol>`，序号语义由列表本身承载，可见的序号徽标标了 `aria-hidden`；
- 行内模式的浮层是组件内自绘的绝对定位面板（非 portal），因此不会脱离文档流层级，
  也不会与页面上的弹窗抢 `z-index`。
