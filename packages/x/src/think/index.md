---
title: Think
subtitle: 思考过程
group: AI 组件
category: Components
description: 折叠面板形态的思考过程展示：思考中自动展开并脉冲提示，完成后默认折叠、点击可回看。
order: 9
demo:
  cols: 1
toc: content
---

# Think 思考过程

## 何时使用

- 模型开启了「深度思考 / 推理」能力，需要把思考过程展示给用户；
- 思考中强制展开（标题显示「思考中…」并带脉冲动画、不可收起），
  完成后默认折叠，点击标题可回看完整内容。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="思考中 / 完成折叠 / 已完成展开三种状态。">三种状态</code>

## API

### ThinkProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 思考内容（长文本内部滚动） | `ReactNode` | - |
| thinking | 是否正在思考 | `boolean` | `false` |
| duration | 思考用时（秒），完成后标题显示 | `number` | - |
| defaultExpanded | 默认是否展开 | `boolean` | `false` |

## 注意事项

- 思考中标题不可点击收起（避免用户误关导致内容丢失）；完成后可自由开合。
- `duration` 由使用方计时后传入（组件不负责计时）。
