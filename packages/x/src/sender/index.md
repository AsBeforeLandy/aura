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

### 提交键位与插槽

`submitType` 切换提交键位；`header` / `footer` 插槽展示附件条与字数统计。

<code src="./demo/submit-type.tsx" description="shiftEnter 键位 + header/footer 插槽 + 字数统计。">键位与插槽</code>

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
| submitType | 提交键位：`enter` = Enter 提交 / Shift+Enter 换行；`shiftEnter` = Shift+Enter 提交 / Enter 换行 | `&'enter' \| 'shiftEnter'` | `'enter'` |
| autoSize | textarea 行数范围（透传 antd autoSize） | `{ minRows?: number; maxRows?: number }` | `{ minRows: 1, maxRows: 6 }` |
| header | 顶部插槽（如附件条、提示条） | `ReactNode` | - |
| footer | 底部插槽（如字数统计、免责声明） | `ReactNode` | - |
| autoFocus | 自动聚焦 | `boolean` | `false` |

## 注意事项

- 输入框为 `Input.TextArea`（1–6 行自适应）；可访问名称由 `aria-label="消息输入框"` 提供。
- 常与 `loading` 联动：把 `useXChat` 的 `loading` 传给 Sender，把 `stop` 传给 `onCancel`。
