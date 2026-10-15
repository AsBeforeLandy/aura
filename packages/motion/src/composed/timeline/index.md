---
title: Timeline
subtitle: 时间线编排
group:
  title: 动效
  order: 15
order: 15
category: Components
demo:
  cols: 1
toc: content
---

进入视口后按 `at`（秒，相对序列起点）依次触发各 Step；`useSequence` 提供
命令式的绝对时刻编排。loop / 倒放属后续版本。

<code src="./demo/basic.tsx">依次揭示的流程时间线</code>

## Timeline API

| 属性                  | 说明                         | 类型            | 默认值     |
| --------------------- | ---------------------------- | --------------- | ---------- |
| autoplay              | 进入视口自动播放             | `boolean`       | `true`     |
| TimelineStep.at       | 相对序列起点的触发时刻（秒） | `number`        | -          |
| TimelineStep.duration | 时长令牌档位                 | `DurationToken` | `'normal'` |

`TimelineStep` 也可通过 `Timeline.Step` 访问，两种写法等价。

## useSequence

```ts | pure
const play = useSequence();
play([
  { at: 0, target: cardRef, to: { scale: 1.06 } },
  { at: 0.2, target: badgeRef, to: { opacity: 1, y: 0 } },
]);
```
