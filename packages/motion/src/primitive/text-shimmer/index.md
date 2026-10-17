---
title: TextShimmer
subtitle: 文字流光
group:
  title: 动效
  order: 25
order: 25
category: Components
demo:
  cols: 1
toc: content
---

文字以背景渐变绘制字形，高光沿文字单向流过——「AI 生成中」的经典质感。
深底场景用默认的白色高光；浅底场景请传深色 `highlightColor`。
reduced-motion 下呈现静态单色文字。

<code src="./demo/basic.tsx">深浅底色对比</code>

## API

| 属性           | 说明                            | 类型     | 默认值                   |
| -------------- | ------------------------------- | -------- | ------------------------ |
| children       | 文字内容                        | `string` | -                        |
| duration       | 一轮流光时长（秒）              | `number` | `2.2`                    |
| spread         | 高光带宽（占文字宽度百分比）    | `number` | `12`                     |
| baseColor      | 文字底色，默认继承 currentColor | `string` | `currentColor`           |
| highlightColor | 高光颜色                        | `string` | `rgba(255,255,255,0.75)` |
