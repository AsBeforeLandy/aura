---
title: 动效组件
group:
  title: 动效
  order: 9
order: 9
category: Components
demo:
  cols: 1
toc: content
---

# 动效组件

`@aura-react-comp/motion` —— 令牌驱动的场景化动画组件库。

所有组件的时长与缓动来自 `--aura-motion-*` 令牌，`prefers-reduced-motion` 全链路降级；
组件只动画 `transform` / `opacity`，合成器友好。引擎为 Motion ^12（MIT），
业务代码请一律从 `@aura-react-comp/motion` 导入，不要直接依赖 `motion/react`。

## 组件一览

### 基础

| 组件                           | 场景                           |
| ------------------------------ | ------------------------------ |
| Slide / Fade / Zoom / Collapse | 进出场过渡四件套               |
| Reveal                         | 进入视口依次揭示               |
| NumberTicker                   | 数字滚动（计数器、金额、指标） |
| SplitText                      | 文字逐字 / 逐词 / 逐行进场     |
| Typewriter                     | 打字机（AI 流式回复补位）      |
| InViewport                     | 进入视口触发的通用包装         |
| Magnetic                       | 磁吸悬停                       |
| SkeletonShimmer                | 骨架屏光泽扫过                 |
| FocusRing                      | 键盘焦点环跟随                 |
| Keyframes                      | 令牌驱动的关键帧               |

### 复杂场景

| 组件                             | 场景                                 |
| -------------------------------- | ------------------------------------ |
| PageTransition                   | 路由转场（App Router template 模式） |
| ViewTransition                   | 原生 View Transitions API 渐进增强   |
| ScrollDriven / ScrollProgressBar | 滚动进度驱动                         |
| Parallax                         | 多层视差                             |
| PathDraw                         | SVG 路径描边                         |
| Timeline / useSequence           | 时间线编排                           |
| FlipList                         | 列表增删自动重排                     |
| Draggable                        | 自由拖拽（约束、网格吸附、惯性）     |
| Reorder                          | 拖拽排序                             |
| LayoutGroup / layout             | 共享元素过渡                         |
| Cursor                           | 自定义光标跟随                       |
| Confetti                         | 庆祝粒子                             |
| Aurora                           | 渐变氛围背景                         |
| LottiePlayer                     | Lottie 动画（可选 peer）             |

## 引入令牌

```ts | pure
import '@aura-react-comp/motion/tokens.css';
```
