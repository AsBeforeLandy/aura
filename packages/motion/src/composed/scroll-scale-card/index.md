---
title: ScrollScaleCard
subtitle: 滚动缩放揭示
group:
  title: 动效
  order: 30
order: 30
category: Components
demo:
  cols: 1
toc: content
---

卡片随滚动从 `from` 缩放至 1 并淡入——现代 landing 页的 sticky 卡片揭示形态。
进度映射：卡片进入视口底边（0）→ 到达视口中部（1）完成。
reduced-motion 下静态呈现。

<code src="./demo/basic.tsx">向下滚动体验</code>

## API

| 属性        | 说明       | 类型        | 默认值 |
| ----------- | ---------- | ----------- | ------ |
| children    | 卡片内容   | `ReactNode` | -      |
| from        | 起始缩放   | `number`    | `0.9`  |
| fromOpacity | 起始透明度 | `number`    | `0.5`  |
