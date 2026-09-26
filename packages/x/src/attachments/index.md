---
title: Attachments
subtitle: 附件列表
group:
  title: 交互
  order: 402
category: Components
description: 输入框上方的附件条：FileCard 列表化排布，支持移除、上传进度与横向滚动溢出模式。
order: 13
demo:
  cols: 1
toc: content
---

# Attachments 附件列表

## 何时使用

- 作为 [`Sender`](/x-components/sender) 的 `header` 插槽，展示待发送的附件；
- 展示消息中引用的文件集合、上传结果列表。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="换行模式移除文件、模拟上传进度；可切换为单行横滑模式。">附件条</code>

## API

### AttachmentsProps

| 参数     | 说明                                       | 类型                                            | 默认值   |
| -------- | ------------------------------------------ | ----------------------------------------------- | -------- |
| items    | 附件列表                                   | `AttachmentItem[]`                              | -        |
| onRemove | 移除回调，回传被移除项与索引               | `(item: AttachmentItem, index: number) => void` | -        |
| overflow | 溢出模式：`wrap` 换行 / `scrollX` 单行横滑 | `'wrap' \| 'scrollX'`                           | `'wrap'` |
| empty    | 空列表占位；缺省渲染 null                  | `ReactNode`                                     | -        |

### AttachmentItem

| 参数        | 说明                         | 类型                                         |
| ----------- | ---------------------------- | -------------------------------------------- |
| id          | 唯一键（同时作为 React key） | `React.Key`                                  |
| name        | 文件名                       | `string`                                     |
| size        | 字节数                       | `number`                                     |
| status      | 状态（同 FileCard）          | `'init' \| 'uploading' \| 'done' \| 'error'` |
| percent     | 上传进度（0–100）            | `number`                                     |
| description | 文件描述                     | `ReactNode`                                  |
| errorTip    | 失败原因                     | `ReactNode`                                  |
| file        | 原始 File 对象，随回调透传   | `File`                                       |

## 注意事项

- `onRemove` 不传时，卡片上的移除按钮不渲染（只读展示）；
- 容器为 `role="list"`，卡片均为 `listitem`，读屏可正确播报数量；
- `overflow="scrollX"` 适合附件较多的输入框：单行横滑，换行交给用户滚动。
- 与 `Sender` 组合时，`items` 为空请传 `undefined` 而不是空数组——
  `Sender` 只在 `header` 为真值时渲染插槽容器，否则会留下一条空的带内边距的横条。
  完整写法见 [`Sender` 的「附件组合」示例](/x-components/sender)。
