---
title: Keyframes 关键帧
group:
  title: 动效
  order: 10
order: 10
category: Components
demo:
  cols: 1
toc: content
---

令牌驱动的关键帧循环 / 播放。白名单只允许合成器友好属性
（opacity / scale / x / y / rotate / rotateX / rotateY / skewX / skewY），
传入其他属性会在开发环境告警。

<code src="./demo/basic.tsx">心跳与摇摆</code>

## API

| 属性        | 说明                                     | 类型                                   | 默认值       |
| ----------- | ---------------------------------------- | -------------------------------------- | ------------ |
| animate     | 关键帧数组，如 `{ scale: [1, 1.08, 1] }` | `Record<string, (number \| string)[]>` | -            |
| duration    | 时长令牌档位                             | `DurationToken`                        | `'normal'`   |
| ease        | 缓动令牌档位                             | `EaseToken`                            | `'standard'` |
| repeat      | 重复次数；`Infinity` 无限循环            | `number`                               | `0`          |
| repeatDelay | 每轮之间的停顿（秒）                     | `number`                               | `0`          |
