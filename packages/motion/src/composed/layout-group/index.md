---
title: LayoutGroup
subtitle: 共享元素
group:
  title: 动效
  order: 19
order: 19
category: Components
demo:
  cols: 1
toc: content
---

共享元素过渡：`LayoutGroup` 组内相同 `layoutId` 的元素互相"飞"过去——
列表卡片展开为详情、Tab 指示条滑动等。`layoutId` 需同时用在（同一时刻只出现一个的）
两个元素上。

<code src="./demo/basic.tsx">卡片展开为详情</code>

## API

转发引擎原样：`<LayoutGroup>` 包裹一组使用 `layoutId` 的 `motion` 元素即可；
元素上加 `layout` 属性以参与布局动画。
