---
title: Magnetic 磁吸
group:
  title: 动效
  order: 7
order: 7
category: Components
demo:
  cols: 1
toc: content
---

children 跟随指针做弹簧偏移，离开后回位——按钮、图标的微交互锦上添花。
reduced-motion 下不跟随。

<code src="./demo/basic.tsx">基础用法</code>

## API

| 属性              | 说明                                           | 类型        | 默认值 |
| ----------------- | ---------------------------------------------- | ----------- | ------ |
| children          | 被磁吸的元素（推荐按钮 / 图标）                | `ReactNode` | -      |
| strength          | 跟随强度 0~1：1 表示完全贴合指针相对中心的偏移 | `number`    | `0.35` |
| className / style | 应用到包装容器                                 | -           | -      |
