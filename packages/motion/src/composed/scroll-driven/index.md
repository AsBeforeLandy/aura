---
title: ScrollDriven
subtitle: 滚动驱动
group:
  title: 动效
  order: 12
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

| 属性      | 说明                                                        | 类型                     | 默认值                       |
| --------- | ----------------------------------------------------------- | ------------------------ | ---------------------------- |
| children  | render prop：`(progress: MotionValue<number>) => ReactNode` | -                        | -                            |
| offset    | 进度判定区间（同引擎 useScroll 的 offset）                  | `ScrollOffset`           | `['start end', 'end start']` |
| smooth    | 进度弹簧平滑（0 关闭）                                      | `number`                 | `0`                          |
| container | 滚动容器；缺省自动探测最近的可滚动祖先                      | `RefObject<HTMLElement>` | 自动                         |

> **滚动轴如何判定**：`useScroll` 默认监听 window。组件会在挂载时向上查找最近的
> 「已溢出且 `overflow: auto/scroll/overlay`」的祖先作为滚动容器（抽屉、表格、
> demo 预览框等），未命中才回退到页面滚动轴。需要显式控制时传 `container`。
> 也可直接用导出的 `findScrollableAncestor(el)` 自查。
