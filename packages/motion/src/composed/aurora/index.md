---
title: Aurora 氛围背景
group:
  title: 动效
  order: 22
category: Components
demo:
  cols: 1
toc: content
---

数个大模糊色块缓慢漂移的渐变氛围背景——登录页、empty 态、hero 区。
模糊是静态 filter（不做 blur 动画，性能安全），漂移仅 transform。reduced-motion 下呈静止渐变。

<code src="./demo/basic.tsx">三种配色</code>

## API

| 属性   | 说明                   | 类型               | 默认值     |
| ------ | ---------------------- | ------------------ | ---------- |
| colors | 色块颜色序列，循环取用 | `string[]`         | 三色紫青粉 |
| blobs  | 色块数量               | `number`           | `3`        |
| height | 高度                   | `number \| string` | `320`      |
| blur   | 色块模糊半径（px）     | `number`           | `80`       |
