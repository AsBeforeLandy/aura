---
title: Actions
subtitle: 消息操作组
group: AI 组件
category: Components
description: 消息气泡下方的操作按钮组：复制、重新生成、点赞、删除等；支持 danger / active / disabled 态与纵向排列。
order: 6
demo:
  cols: 1
toc: content
---

# Actions 消息操作组

## 何时使用

- 在 [`Bubble`](/x-components/bubble) 的 `footer` 插槽中放置消息级操作：
  复制、重新生成、点赞 / 点踩、删除等；
- 语义为工具栏（`role="toolbar"`）：键盘可达，`aria-label` 供读屏使用。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="复制 / 重新生成 / 点赞（切换态）/ 删除（危险态）的完整交互。">基本用法</code>

## API

### ActionsProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 操作项 | `ActionItem[]` | - |
| direction | 排列方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| ariaLabel | 工具栏可访问名称 | `string` | `'操作'` |

### ActionItem

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一键 | `React.Key` |
| icon | 图标 | `ReactNode` |
| label | 文案（同时作为按钮的可访问名称与 title） | `ReactNode` |
| danger | 危险操作（红色态） | `boolean` |
| active | 切换态（如已点赞） | `boolean` |
| disabled | 禁用 | `boolean` |
| onClick | 点击回调 | `() => void` |

## 注意事项

- 与 `Bubble` 组合时放在 `footer` 插槽；「复制」建议用 `navigator.clipboard.writeText`
  写原始文本（而非渲染后的 HTML）。
