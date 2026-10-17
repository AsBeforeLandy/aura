---
title: Marquee
subtitle: 无缝滚动
group:
  title: 动效
  order: 28
order: 28
category: Components
demo:
  cols: 1
toc: content
---

无缝滚动横幅（logo 墙 / 公告跑马灯）：内容复制两份，位移 -50% 后无缝回绕，
只动画 transform。注意单份内容宽度需 ≥ 容器宽度，否则回绕处会露出空隙。
reduced-motion 下静态展示。

<code src="./demo/basic.tsx">双向滚动与 logo 墙</code>

## API

| 属性      | 说明                     | 类型                | 默认值   |
| --------- | ------------------------ | ------------------- | -------- |
| children  | 滚动内容（应足够长）     | `ReactNode`         | -        |
| duration  | 滚动一轮的时长（秒）     | `number`            | `18`     |
| direction | 滚动方向                 | `'left' \| 'right'` | `'left'` |
| gap       | 两份内容之间的间距（px） | `number`            | `48`     |
