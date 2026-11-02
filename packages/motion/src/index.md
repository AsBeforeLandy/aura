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

<code src="./demo/showcase.tsx" description="8 个场景自动轮播（悬停暂停、点击圆点切换）：进出场、揭示、数字、文字、AI、卡片、氛围、加载。">动效演示墙</code>

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
| TextShimmer                    | 文字流光（AI 生成中）          |
| TypingDots                     | 思考三点脉冲（AI 等待态）      |
| GradientBorder                 | 流光渐变边框                   |
| Marquee                        | 无缝滚动横幅                   |

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
| TiltCard                         | 3D 倾斜卡片（指针驱动 + 光泽）       |
| ScrollScaleCard                  | 滚动缩放揭示（landing 卡片）         |

## 引入令牌

```ts | pure
import '@aura-react-comp/motion/tokens.css';
```

## 颜色令牌

组件的默认配色全部来自 `--aura-motion-*` 颜色变量（源码内已无硬编码色值），
业务方覆盖变量即可整体换肤；亮/暗各一套，`[data-theme='dark']` 下自动切换。

| 令牌                               | 用途                             | 亮色                   | 暗色                    |
| ---------------------------------- | -------------------------------- | ---------------------- | ----------------------- |
| `--aura-motion-accent`             | 主强调（光标 / 焦点环 / 进度条） | `#7c3aed`              | `#a855f7`               |
| `--aura-motion-accent-strong`      | 强调色加深                       | `#6d28d9`              | `#7c3aed`               |
| `--aura-motion-accent-soft`        | 强调色浅底                       | `rgba(124,58,237,.12)` | `rgba(168,85,247,.18)`  |
| `--aura-motion-accent-glow`        | 强调色发光                       | `rgba(124,58,237,.35)` | `rgba(168,85,247,.45)`  |
| `--aura-motion-cyan`               | 辅助青（流光 / 氛围）            | `#22d3ee`              | `#22d3ee`               |
| `--aura-motion-blue`               | 辅助蓝                           | `#3b82f6`              | `#60a5fa`               |
| `--aura-motion-fuchsia`            | 辅助品红                         | `#e879f9`              | `#e879f9`               |
| `--aura-motion-card-bg`            | 卡片内底（GradientBorder）       | `#ffffff`              | `#12141a`               |
| `--aura-motion-skeleton`           | 骨架底                           | `rgba(15,23,42,.08)`   | `rgba(255,255,255,.1)`  |
| `--aura-motion-skeleton-highlight` | 骨架扫光                         | `rgba(255,255,255,.9)` | `rgba(255,255,255,.5)`  |
| `--aura-motion-shimmer`            | 文字流光高光                     | `rgba(124,58,237,.85)` | `rgba(255,255,255,.85)` |
| `--aura-motion-sheen`              | 倾斜卡光泽                       | `rgba(255,255,255,.9)` | `rgba(255,255,255,.18)` |
| `--aura-motion-focus-color`        | 焦点环 / 光标描边                | `#7c3aed`              | `#a855f7`               |

覆盖示例（换成翡翠绿主题）：

```css
:root {
  --aura-motion-accent: #10b981;
  --aura-motion-focus-color: #10b981;
  --aura-motion-shimmer: rgba(16, 185, 129, 0.85);
}
```

> `Confetti` 用 canvas 2D 绘制，**无法解析 CSS 变量**——它的默认色板在 JS 侧
> （`motionConfettiColors`）。需要让它跟随业务主题时，请显式传 `colors`。
