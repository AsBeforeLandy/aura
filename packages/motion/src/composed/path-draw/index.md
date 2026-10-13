---
title: PathDraw 路径描边
group:
  title: 动效
  order: 14
category: Components
demo:
  cols: 1
toc: content
---

SVG 路径的"一笔画出"效果——logo、插画、图表线条。支持多条路径顺序衔接与循环。

<code src="./demo/basic.tsx">对勾与循环波形</code>

## API

| 属性                 | 说明                                        | 类型                      | 默认值               |
| -------------------- | ------------------------------------------- | ------------------------- | -------------------- |
| paths                | 一条或多条 path 的 `d` 属性；多条按顺序描边 | `string[]`                | -                    |
| viewBox              | SVG viewBox                                 | `string`                  | `'0 0 100 100'`      |
| width                | 宽度                                        | `number \| string`        | `120`                |
| stroke / strokeWidth | 描边颜色与粗细                              | `string` / `number`       | `currentColor` / `2` |
| duration             | 每条路径的描边时长（秒或令牌档位名）        | `number \| DurationToken` | `'slow'`             |
| loop                 | 循环：`true` 无限；数字为次数               | `boolean \| number`       | `false`              |
| ease / delay         | 缓动令牌 / 起始延迟                         | `EaseToken` / `number`    | `'decelerate'` / `0` |
