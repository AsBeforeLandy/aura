---
title: Confetti 庆祝粒子
group:
  title: 动效
  order: 21
category: Components
demo:
  cols: 1
toc: content
---

canvas 2d 庆祝粒子：`fire` 计数器变化时发射一轮，粒子全部离场后自动停止渲染。
reduced-motion 下不渲染任何内容。

<code src="./demo/basic.tsx">点击发射</code>

## API

| 属性   | 说明                           | 类型                       | 默认值               |
| ------ | ------------------------------ | -------------------------- | -------------------- |
| fire   | 发射触发器：计数器 +1 发射一轮 | `number`                   | -                    |
| count  | 每轮粒子数                     | `number`                   | `120`                |
| origin | 发射原点（相对视口比例 0~1）   | `{ x: number; y: number }` | `{ x: 0.5, y: 0.6 }` |
| colors | 粒子颜色序列                   | `string[]`                 | Aura 品牌色系        |
