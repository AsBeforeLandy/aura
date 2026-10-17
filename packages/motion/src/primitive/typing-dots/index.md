---
title: TypingDots
subtitle: 思考三点
group:
  title: 动效
  order: 26
order: 26
category: Components
demo:
  cols: 1
toc: content
---

AI 思考中的三点脉冲：三点依次缩放 + 明暗呼吸（stagger 0.16s）。
带 `role="status"` 与「正在输入」无障碍标签；reduced-motion 下呈静态三点。

<code src="./demo/basic.tsx">基础用法</code>

## API

| 属性     | 说明                          | 类型     | 默认值         |
| -------- | ----------------------------- | -------- | -------------- |
| count    | 点数量                        | `number` | `3`            |
| size     | 点直径（px）                  | `number` | `6`            |
| gap      | 点间距（px）                  | `number` | `5`            |
| color    | 点颜色，默认继承 currentColor | `string` | `currentColor` |
| duration | 单点一轮脉冲时长（秒）        | `number` | `1.1`          |
