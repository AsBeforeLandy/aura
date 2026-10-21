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

## 组件清单（30 个）

**基础（primitive）**

| 组件                           | 场景                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| Slide / Fade / Zoom / Collapse | 进出场四件套（`Collapse` 用 `open`，其余用 `visible`）            |
| Reveal                         | 视口揭示，`variant`: fade / blur / mask / scale                   |
| NumberTicker                   | 数字滚动（逐位独立弹簧、位间错峰、tabular-nums）                  |
| SplitText                      | 文字拆分进场，`variant`: fade / rise / flip                       |
| Typewriter                     | 打字机（AI 流式回复补位）                                         |
| InViewport                     | 进入视口通用包装                                                  |
| Magnetic                       | 磁吸悬停                                                          |
| SkeletonShimmer                | 骨架屏光泽（`index` 错峰出光）                                    |
| FocusRing                      | 键盘焦点环跟随                                                    |
| Keyframes                      | 令牌驱动关键帧（白名单：opacity / scale / x / y / rotate / skew） |
| TextShimmer                    | 文字流光（AI 生成中）                                             |
| TypingDots                     | 思考三点脉冲（`role="status"`）                                   |
| GradientBorder                 | 流光渐变边框（旋转 conic 光带）                                   |
| Marquee                        | 无缝滚动横幅                                                      |

**复杂场景（composed）**

| 组件                                  | 场景                               |
| ------------------------------------- | ---------------------------------- |
| PageTransition                        | 路由转场（快退慢进）               |
| ViewTransition                        | 原生 View Transitions 渐进增强     |
| ScrollDriven / ScrollProgressBar      | 滚动进度驱动                       |
| Parallax                              | 多层视差                           |
| PathDraw                              | SVG 路径描边                       |
| Timeline / TimelineStep / useSequence | 时间线编排                         |
| FlipList                              | 列表增删自动重排（FLIP）           |
| Draggable                             | 自由拖拽（约束 / 网格吸附 / 惯性） |
| Reorder / ReorderGroup / ReorderItem  | 拖拽排序                           |
| LayoutGroup                           | 共享元素过渡                       |
| Cursor                                | 自定义光标跟随                     |
| Confetti                              | 庆祝粒子（纸条物理 + 翻面）        |
| Aurora                                | 渐变氛围背景                       |
| LottiePlayer                          | Lottie 动画（可选 peer）           |
| TiltCard                              | 3D 倾斜卡片（指针驱动 + 光泽跟随） |
| ScrollScaleCard                       | 滚动缩放揭示（landing 卡片）       |

编排 API：`AnimatePresence`、`motion`（源语）、`MotionConfig`、`useReducedMotion`、
`useInView`、`useAnimationControls`。

## 与 AI 对话场景组合

```tsx
import { Bubble } from '@aura-react-comp/x';
import { TypingDots, TextShimmer, GradientBorder } from '@aura-react-comp/motion';

// 思考中（Bubble 的 content 是字符串，自定义节点走 contentRender）
<Bubble role="assistant" content="" contentRender={() => <TypingDots />} />

// 生成中流光标题（header 接受 ReactNode）
<Bubble role="assistant" header={<TextShimmer>正在生成…</TextShimmer>} content="…" />

// 流光边框回答卡片
<GradientBorder><Bubble role="assistant" content="…" /></GradientBorder>
```

motion 是 x 的**可选增强**——未安装不影响 x 的任何功能。完整场景见文档站
[动效场景配方](https://asbeforelandy.github.io/aura/guide/motion-recipes)。

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
