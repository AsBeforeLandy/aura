---
title: Welcome
subtitle: 欢迎区
group: AI 组件
category: Components
description: 对话开始前的欢迎区：图标 + 标题 + 描述居中展示，extra 插槽常放 Prompts 提示词集引导用户开口。
order: 8
demo:
  cols: 1
toc: content
---

# Welcome 欢迎区

## 何时使用

- 对话页空状态：向用户打招呼并引导第一步；
- `extra` 插槽常与 [`Prompts`](/x-components/prompts) 组合，提供可点击的引导问题。

## 代码演示

### 基本用法（与 Prompts 组合）

<code src="./demo/basic.tsx" description="图标 + 标题 + 描述居中展示，extra 放提示词集引导开口。">欢迎与引导</code>

## API

### WelcomeProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| icon | 顶部图标 / 头像 | `ReactNode` | - |
| title | 欢迎标题 | `ReactNode` | - |
| description | 副标题 / 描述 | `ReactNode` | - |
| extra | 附加内容插槽（常放 Prompts） | `ReactNode` | - |
| variant | `board`（带边框面板）/ `simple`（纯内容） | `'board' \| 'simple'` | `'board'` |
