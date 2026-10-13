---
title: SkeletonShimmer 骨架屏
group:
  title: 动效
  order: 8
category: Components
demo:
  cols: 1
toc: content
---

骨架屏光泽扫过——引擎驱动的 transform 循环（合成器友好），reduced-motion 下呈现静止底色。

<code src="./demo/basic.tsx">卡片骨架组合</code>

## API

| 属性              | 说明                 | 类型               | 默认值          |
| ----------------- | -------------------- | ------------------ | --------------- |
| width / height    | 尺寸                 | `number \| string` | `'100%'` / `16` |
| radius            | 圆角                 | `number \| string` | `8`             |
| duration          | 扫过一轮的时长（秒） | `number`           | `1.4`           |
| className / style | 应用到骨架块         | -                  | -               |
