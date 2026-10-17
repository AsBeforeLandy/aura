---
title: GradientBorder
subtitle: 流光边框
group:
  title: 动效
  order: 27
order: 27
category: Components
demo:
  cols: 1
toc: content
---

沿边框游走的光效：旋转的 conic-gradient 光带层 + 内层实底，只动画
transform（合成器友好）。AI 产品卡片、升级入口的标配装饰。
reduced-motion 下呈现静态渐变边框。

<code src="./demo/basic.tsx">基础用法与悬停增强</code>

## API

| 属性       | 说明                   | 类型        | 默认值     |
| ---------- | ---------------------- | ----------- | ---------- |
| children   | 内容                   | `ReactNode` | -          |
| size       | 边框粗细（px）         | `number`    | `1.5`      |
| speed      | 光效绕行一周时长（秒） | `number`    | `4`        |
| colors     | 光带颜色序列           | `string[]`  | 紫 / 青    |
| background | 内层背景，可覆盖底色   | `string`    | 令牌回退白 |
| radius     | 圆角（px）             | `number`    | `12`       |
