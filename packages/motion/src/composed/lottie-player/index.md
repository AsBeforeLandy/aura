---
title: LottiePlayer
subtitle: Lottie 动画
group:
  title: 动效
  order: 23
order: 23
category: Components
demo:
  cols: 1
toc: content
---

Lottie 动画封装：`lottie-web` 为**可选 peer**（`peerDependenciesMeta.optional`），
未安装时渲染占位并告警，不会让构建失败。reduced-motion 下加载但停在首帧。

<code src="./demo/basic.tsx">远程 JSON 播放</code>

## API

| 属性           | 说明                                        | 类型               | 默认值 |
| -------------- | ------------------------------------------- | ------------------ | ------ |
| src            | 动画 JSON 的 URL（lottie-web 的 path 参数） | `string`           | -      |
| loop           | 循环播放                                    | `boolean`          | `true` |
| autoplay       | 自动播放                                    | `boolean`          | `true` |
| width / height | 尺寸                                        | `number \| string` | `120`  |
