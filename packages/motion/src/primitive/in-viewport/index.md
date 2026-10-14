---
title: InViewport 视口触发
group:
  title: 动效
  order: 6
order: 6
category: Components
demo:
  cols: 1
toc: content
---

进入视口触发的通用包装——包裹任意内容，进场形态可由子元素自定义
（默认淡入上移）。与 Reveal 的区别：InViewport 是「触发器」，Reveal 是「揭示样式」。

<code src="./demo/basic.tsx">自定义进场形态</code>

## API

| 属性     | 说明                            | 类型            | 默认值                |
| -------- | ------------------------------- | --------------- | --------------------- |
| once     | 只播放一次                      | `boolean`       | `true`                |
| margin   | IntersectionObserver rootMargin | `string`        | `'0px 0px -64px 0px'` |
| duration | 时长令牌档位                    | `DurationToken` | `'normal'`            |
| offset   | 进场位移距离（px）；0 则只淡入  | `number`        | `16`                  |

其余属性透传给容器 `div`。
