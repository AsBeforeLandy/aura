---
title: Suggestion
subtitle: 快捷建议
group: AI 组件
category: Components
description: 跟随输入的快捷续写建议列表；open 受控开合，空列表或关闭时渲染 null。
order: 10
demo:
  cols: 1
toc: content
---

# Suggestion 快捷建议

## 何时使用

- 在 [`Sender`](/x-components/sender) 上方展示快捷续写 / 追问建议；
- 开合由使用方受控（如「输入为空时隐藏」「流式结束后出现」）。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="点击建议回调 onSelect。">基本用法</code>

## API

### SuggestionProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 建议列表 | `SuggestionItem[]` | - |
| onSelect | 选中某条建议 | `(item: SuggestionItem) => void` | - |
| open | 是否展示 | `boolean` | `true` |

### SuggestionItem

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一键 | `React.Key` |
| label | 建议文案 | `ReactNode` |

## 注意事项

- 组件为纯展示（无浮层定位逻辑）；需要「悬浮在输入框上方」的效果，
  请在使用处自行叠加绝对定位。
