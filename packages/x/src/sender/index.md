---
title: Sender
subtitle: 对话输入框
group: AI 组件
category: Components
description: Enter 发送、Shift + Enter 换行、中文输入法组词保护；loading 时按钮变为「停止」。
order: 5
demo:
  cols: 1
toc: content
---

# Sender 对话输入框

## 何时使用

- AI 对话场景的输入区：Enter 提交、Shift + Enter 换行、中文输入法组词过程中不提交；
- 生成中需要「停止」按钮时（传 `loading` 与 `onCancel`）。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="Enter 提交、loading 时按钮变为「停止」、提交记录回显。">基本用法</code>

## API

### SenderProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控值 | `string` | - |
| defaultValue | 非受控初值 | `string` | `''` |
| onChange | 输入回调 | `(value: string) => void` | - |
| onSubmit | 提交回调（Enter 或点击发送；空白内容不触发） | `(content: string) => void` | - |
| onCancel | 取消回调：loading 时点击「停止」触发 | `() => void` | - |
| loading | 生成中：按钮变为「停止」，Enter 不再提交 | `boolean` | `false` |
| placeholder | 占位文本 | `string` | 输入消息，Enter 发送… |
| disabled | 禁用 | `boolean` | `false` |
| clearOnSubmit | 提交后清空输入（仅非受控模式生效） | `boolean` | `true` |
| autoFocus | 自动聚焦 | `boolean` | `false` |

## 注意事项

- 输入框为 `Input.TextArea`（1–6 行自适应）；可访问名称由 `aria-label="消息输入框"` 提供。
- 常与 `loading` 联动：把 `useXChat` 的 `loading` 传给 Sender，把 `stop` 传给 `onCancel`。
