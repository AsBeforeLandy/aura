---
title: Reveal 视口揭示
group:
  title: 动效
  order: 2
order: 2
category: Components
demo:
  cols: 1
toc: content
---

进入视口时淡入上移——滚动浏览场景的默认进场。多个 Reveal 用 `index` 传序号即可
获得依次揭示的节奏（80ms 步进），无需手写 delay。

<code src="./demo/basic.tsx">滚动查看依次揭示</code>

## API

| 属性     | 说明                                               | 类型            | 默认值                |
| -------- | -------------------------------------------------- | --------------- | --------------------- |
| index    | 兄弟序号，自动换算 80ms 步进延迟                   | `number`        | `0`                   |
| delay    | 显式延迟（秒），与 index 二选一                    | `number`        | -                     |
| duration | 时长令牌档位                                       | `DurationToken` | `'normal'`            |
| margin   | 视口判定边距（同 IntersectionObserver rootMargin） | `string`        | `'0px 0px -64px 0px'` |
| once     | 是否只播放一次（滚回上方不重播）                   | `boolean`       | `true`                |

reduced-motion 下直接渲染终态。
