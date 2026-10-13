# @aura-react-comp/motion

Aura 动效组件库 —— 令牌驱动的场景化动画组件。

## 安装

```bash
npm i @aura-react-comp/motion
```

`react` / `react-dom` 为 peer 依赖；`lottie-web` 为**可选** peer（仅 `<LottiePlayer>` 需要）。

## 引入令牌

所有组件的时长与缓动都走动效令牌，请一次性引入（或经 ui 联动包级联引入）：

```tsx
import '@aura-react-comp/motion/tokens.css';
```

## 快速开始

```tsx
import { Slide, NumberTicker, Reveal } from '@aura-react-comp/motion';

// 进出场（保留式：DOM 常驻）
<Slide visible={open} direction="up" distance="md">…</Slide>

// 进出场（卸载式：配合 AnimatePresence）
<AnimatePresence>{open && <Zoom key="modal">…</Zoom>}</AnimatePresence>

// 数字滚动
<NumberTicker value={128940} />

// 进入视口揭示
<Reveal index={0}>…</Reveal>
```

## 设计约定

1. **只从本包导入**，不要直接依赖 `motion/react`（引擎隔离层）；
2. 时长 / 缓动 / 位移传**令牌档位名**（`'fast'`、`'decelerate'`、`'md'`），不传裸数值；
3. 组件只动画 `transform` / `opacity`（`Collapse` 的 height 为既有例外，勿用于长列表）。

## 可访问性（三层降级）

| 层     | 机制                                                                 |
| ------ | -------------------------------------------------------------------- |
| 令牌层 | `prefers-reduced-motion: reduce` 时 CSS 令牌时长归零                 |
| 引擎层 | `<MotionConfig reducedMotion="user">` 全局开关                       |
| 组件层 | 每组件内 `useReducedMotion()` 分支（Confetti 不撒、Cursor 不跟随……） |

## 渐进增强声明

运行时依赖 Motion 引擎的浏览器基线（高于 ui 包的 chrome 80）。不满足时组件直接呈现
**终态**，无中间帧、无报错，页面功能不受影响；`<ViewTransition>` 在不支持的浏览器
自动降级为普通过渡。
