---
title: ScrollDriven 滚动驱动
group:
  title: 动效
  order: 12
category: Components
demo:
  cols: 1
toc: content
---

容器在视口内的滚动进度（0~1）通过 render prop 暴露，可接到任意 MotionValue 消费点。
附带的 `ScrollProgressBar` 是页面顶部滚动进度条的预置实现。

<code src="./demo/basic.tsx">滚动容器内的进度驱动</code>

## ScrollDriven API

| 属性     | 说明                                                        | 类型           | 默认值                       |
| -------- | ----------------------------------------------------------- | -------------- | ---------------------------- |
| children | render prop：`(progress: MotionValue<number>) => ReactNode` | -              | -                            |
| offset   | 进度判定区间（同引擎 useScroll 的 offset）                  | `ScrollOffset` | `['start end', 'end start']` |
| smooth   | 进度弹簧平滑（0 关闭）                                      | `number`       | `0`                          |
