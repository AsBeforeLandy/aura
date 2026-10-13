---
title: Cursor 自定义光标
group:
  title: 动效
  order: 20
category: Components
demo:
  cols: 1
toc: content
---

点 + 环双层弹簧跟随的自定义光标，悬停 `data-cursor` 元素时环放大。
触屏设备与 reduced-motion 环境不渲染。

<code src="./demo/basic.tsx">移动鼠标体验</code>

## API

| 属性         | 说明                         | 类型                   | 默认值            |
| ------------ | ---------------------------- | ---------------------- | ----------------- |
| variant      | 形态：双层点环或单点         | `'dot-ring' \| 'blob'` | `'dot-ring'`      |
| hoverTargets | 触发放大的选择器（事件委托） | `string`               | `'[data-cursor]'` |
| size         | 点的尺寸（px）               | `number`               | `8`               |
| hoverScale   | 环的放大倍数                 | `number`               | `2.4`             |

业务侧在被悬停增强的元素上加 `data-cursor` 属性即可，无需逐个注册。
