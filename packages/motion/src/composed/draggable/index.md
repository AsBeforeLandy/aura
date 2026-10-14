---
title: Draggable 自由拖拽
group:
  title: 动效
  order: 17
order: 17
category: Components
demo:
  cols: 1
toc: content
---

自由拖拽：约束在包装容器内、可选网格吸附与惯性。reduced-motion 下退化为静态内容。

<code src="./demo/basic.tsx">约束 + 网格吸附</code>

## API

| 属性     | 说明                              | 类型                   | 默认值     |
| -------- | --------------------------------- | ---------------------- | ---------- |
| children | 被拖拽的内容                      | `ReactNode`            | -          |
| bounds   | 约束在包装容器内                  | `'parent' \| false`    | `'parent'` |
| grid     | 松手后吸附的网格尺寸 [x, y]（px） | `[number, number]`     | -          |
| inertia  | 释放后的惯性                      | `boolean`              | `true`     |
| axis     | 拖拽轴向                          | `'x' \| 'y' \| 'both'` | `'both'`   |
