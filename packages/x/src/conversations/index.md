---
title: Conversations
subtitle: 会话管理
group:
  title: 会话
  order: 404
category: Components
description: 多会话侧栏列表：激活高亮、时间戳、可配置操作菜单（重命名 / 置顶 / 删除），菜单点击自动关闭。
order: 7
demo:
  cols: 1
toc: content
---

# Conversations 会话管理

## 何时使用

- 多会话 AI 应用的侧栏：切换会话、管理（重命名 / 删除）会话；
- 组件只负责展示与回调——会话数据的增删改由使用方的 store 决定。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="激活高亮 + 操作菜单（删除后自动取消激活）。">基本用法</code>

## API

### ConversationsProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 会话列表 | `ConversationItem[]` | - |
| activeKey | 当前激活会话 | `React.Key` | - |
| onActiveChange | 激活会话变化 | `(key: React.Key) => void` | - |
| menu | 会话操作菜单配置；不传则不显示 … 按钮 | `(item: ConversationItem) => ConversationMenuConfig` | - |

### ConversationItem

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一键 | `React.Key` |
| label | 会话标题 | `ReactNode` |
| icon | 图标 | `ReactNode` |
| timestamp | 时间戳 | `ReactNode` |

### ConversationMenuConfig

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| icon | 菜单触发按钮的图标 | `ReactNode` |
| items | 菜单项 | `{ key; label: ReactNode; danger?: boolean }[]` |
| onClick | 菜单项点击（自动关闭菜单） | `(item: ConversationItem, menuItemKey: React.Key) => void` |

## 注意事项

- 同一时刻至多展开一个操作菜单；点击列表其他区域会自动收起。
- 「删除会话后取消激活」等联动逻辑由使用方在状态层处理（见 demo）。
