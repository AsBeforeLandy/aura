---
title: FlipList 列表重排
group:
  title: 动效
  order: 16
order: 16
category: Components
demo:
  cols: 1
toc: content
---

列表增删 / 排序的自动重排（FLIP）：新增项淡入、删除项淡出、存量项平滑移动到新位置。
100+ 行时建议配合虚拟列表并开启 `virtualized`。

<code src="./demo/basic.tsx">随机增删排序</code>

## API

| 属性        | 说明                                      | 类型                           | 默认值     |
| ----------- | ----------------------------------------- | ------------------------------ | ---------- |
| items       | 列表项：`{ id, node }[]`，id 为稳定唯一键 | `FlipListItem[]`               | -          |
| as          | 渲染的列表标签                            | `'ul' \| 'ol'`                 | `'ul'`     |
| duration    | 时长令牌档位                              | `'fast' \| 'normal' \| 'slow'` | `'normal'` |
| virtualized | 配合虚拟列表时开启（关闭离场动画）        | `boolean`                      | `false`    |
