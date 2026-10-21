---
title: Transition
subtitle: 进出场过渡四件套（Slide / Fade / Zoom / Collapse）
group:
  title: 动效
  order: 1
order: 1
category: Components
demo:
  cols: 1
toc: content
---

进出场过渡四件套之一：内容以位移 + 淡入淡出的方式出现或消失。适用于抽屉、浮层、
区块显隐。另有 `Fade`（纯淡入淡出）、`Zoom`（缩放）、`Collapse`（高度展开收起）。

支持两种模式：

- **保留式**：传 `visible`，DOM 常驻，显隐由属性切换；
- **卸载式**：条件渲染 + 外层 `AnimatePresence`，卸载时播放退场动画。

<code src="./demo/basic.tsx">保留式显隐</code>

<code src="./demo/unmount.tsx">卸载式（配合 AnimatePresence）</code>

## API

| 属性      | 说明                                      | 类型                                                        | 默认值         |
| --------- | ----------------------------------------- | ----------------------------------------------------------- | -------------- |
| visible   | 保留式显隐；配合 AnimatePresence 时可省略 | `boolean`                                                   | `true`         |
| direction | 位移方向                                  | `'up' \| 'down' \| 'left' \| 'right'`                       | `'up'`         |
| distance  | 位移距离令牌档位                          | `'sm' \| 'md' \| 'lg'`                                      | `'md'`         |
| duration  | 时长令牌档位                              | `'instant' \| 'fast' \| 'normal' \| 'slow' \| 'deliberate'` | `'normal'`     |
| ease      | 缓动令牌档位                              | `'standard' \| 'decelerate' \| 'accelerate'`                | `'decelerate'` |

> `Collapse` 的显隐属性名是 **`open`**（不是 `visible`），其余四件套的显隐属性为
> `visible`。

其余属性透传给容器 `div`。组件根元素暴露 `data-motion-state`（`entered` / `exited`）。
