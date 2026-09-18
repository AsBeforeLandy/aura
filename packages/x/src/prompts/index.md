---
title: Prompts
subtitle: 提示词集
group: AI 组件
category: Components
description: 可点击的提示词卡片列表，引导用户快速开口；支持纵向 / 横向排列与图标、描述。
order: 7
demo:
  cols: 1
toc: content
---

# Prompts 提示词集

## 何时使用

- 对话空状态引导用户开口（与 [`Welcome`](/x-components/welcome) 的 `extra` 组合）；
- 对话过程中提供快捷追问。

语义为按钮列表：键盘可达（Tab 聚焦，Enter / 空格触发）。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="纵向卡片列表，含图标与描述，点击回调。">基本用法</code>

## API

### PromptsProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 提示词列表 | `PromptItem[]` | - |
| onItemClick | 点击某条提示词 | `(item: PromptItem) => void` | - |
| direction | 排列方向 | `'vertical' \| 'horizontal'` | `'vertical'` |
| title | 分组标题 | `ReactNode` | - |

### PromptItem

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一键 | `React.Key` |
| label | 主文案 | `ReactNode` |
| description | 补充说明 | `ReactNode` |
| icon | 图标 | `ReactNode` |
