---
title: ThoughtChain
subtitle: 思维链
group:
  title: 推理
  order: 406
category: Components
description: 时间线形态的推理步骤展示：待办 / 进行中 / 成功 / 失败四态节点，可折叠为一行摘要，进行中强制展开。
order: 12
demo:
  cols: 1
toc: content
---

# ThoughtChain 思维链

## 何时使用

- 模型按步骤执行任务（检索 → 分析 → 生成），需要把每一步的进展与结果展示给用户；
- 与 [`Think`](/x-components/think) 的区别：Think 是单段思考文本的折叠面板，
  ThoughtChain 是多步骤的时间线，每一步有独立状态节点。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="三种状态链路混合的静态展示。">状态混合</code>

### 可折叠

<code src="./demo/collapsible.tsx" description="非受控开合；进行中的链路强制展开且不可手动收起。">折叠与回看</code>

## API

### ThoughtChainProps

| 参数            | 说明                                             | 类型                          | 默认值     |
| --------------- | ------------------------------------------------ | ----------------------------- | ---------- |
| items           | 步骤列表                                         | `ThoughtChainItem[]`          | -          |
| collapsible     | 是否可折叠（折叠为一行摘要）；`false` 时平铺展示 | `boolean`                     | `true`     |
| expanded        | 受控展开态                                       | `boolean`                     | -          |
| defaultExpanded | 非受控默认展开态                                 | `boolean`                     | `false`    |
| onExpandChange  | 展开态变化回调（受控 / 非受控都会触发）          | `(expanded: boolean) => void` | -          |
| title           | 头部标题                                         | `ReactNode`                   | `'思维链'` |

### ThoughtChainItem

| 参数        | 说明                                       | 类型                                              | 默认值      |
| ----------- | ------------------------------------------ | ------------------------------------------------- | ----------- |
| key         | 唯一键（缺省用索引）                       | `React.Key`                                       | -           |
| title       | 步骤标题                                   | `ReactNode`                                       | -           |
| description | 步骤描述                                   | `ReactNode`                                       | -           |
| status      | 步骤状态                                   | `'pending' \| 'thinking' \| 'success' \| 'error'` | `'pending'` |
| icon        | 自定义节点内容；缺省按 status 渲染内置图标 | `ReactNode`                                       | -           |

## 注意事项

- 头部摘要文案由状态自动推导：`进行中` / `已完成` / `含有失败步骤` / `共 N 步`；
- 存在 `thinking` 步骤时链路强制展开且头部不可点击（避免用户误关进行中的链路）；
  全部结束后恢复用户控制的折叠态；
- 节点装饰性内容（对勾 / 叉号）均 `aria-hidden`，可访问信息由步骤标题承载。
