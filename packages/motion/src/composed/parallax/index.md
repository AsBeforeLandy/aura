---
title: Parallax
subtitle: 视差
group:
  title: 动效
  order: 13
order: 13
category: Components
demo:
  cols: 1
toc: content
---

多层视差：每层以不同速度因子跟随滚动位移（负值反向）。仅位移 transform，合成器友好。

<code src="./demo/basic.tsx">滚动查看层速差</code>

## API

| 属性              | 说明                                          | 类型                  | 默认值 |
| ----------------- | --------------------------------------------- | --------------------- | ------ |
| layers            | 层定义：`{ speed, node }[]`，speed 为速度因子 | `ParallaxLayerSpec[]` | -      |
| smooth            | 位移弹簧平滑（0 关闭）                        | `number`              | `0`    |
| className / style | 应用到容器                                    | -                     | -      |
