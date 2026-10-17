/**
 * @aura-react-comp/motion — 令牌驱动的场景化动画组件库。
 *
 * 三条使用约定：
 * 1. 所有组件从本入口导入，不要直接依赖 `motion/react`（引擎隔离层，便于将来替换）；
 * 2. 时长 / 缓动 / 位移一律传**令牌档位名**，不传裸数值；
 * 3. 一次性引入本包的 `tokens.css` 子路径（或经 ui 联动包级联引入）。
 */

// ---- 令牌 ----
export * from './tokens';

// ---- 全局配置与偏好 ----
export { MotionConfig } from './config';
export { useReducedMotion, useInView, useAnimationControls } from './hooks';

// ---- 基础组件 ----
export { Slide, Fade, Zoom, Collapse } from './primitive/transition';
export type {
  SlideProps,
  FadeProps,
  ZoomProps,
  CollapseProps,
  TransitionBaseProps,
} from './primitive/transition';
export { Reveal } from './primitive/reveal';
export type { RevealProps } from './primitive/reveal';
export { NumberTicker } from './primitive/number-ticker';
export type { NumberTickerProps } from './primitive/number-ticker';
export { SplitText } from './primitive/split-text';
export type { SplitTextProps } from './primitive/split-text';
export { Typewriter } from './primitive/typewriter';
export type { TypewriterProps } from './primitive/typewriter';
export { InViewport } from './primitive/in-viewport';
export type { InViewportProps } from './primitive/in-viewport';
export { Magnetic } from './primitive/magnetic';
export type { MagneticProps } from './primitive/magnetic';
export { SkeletonShimmer } from './primitive/skeleton-shimmer';
export type { SkeletonShimmerProps } from './primitive/skeleton-shimmer';
export { FocusRing } from './primitive/focus-ring';
export type { FocusRingProps } from './primitive/focus-ring';
export { Keyframes, KEYFRAMES_ALLOWED_PROPS } from './primitive/keyframes';
export type { KeyframesProps } from './primitive/keyframes';
export { TextShimmer } from './primitive/text-shimmer';
export type { TextShimmerProps } from './primitive/text-shimmer';
export { TypingDots } from './primitive/typing-dots';
export type { TypingDotsProps } from './primitive/typing-dots';
export { GradientBorder } from './primitive/gradient-border';
export type { GradientBorderProps } from './primitive/gradient-border';
export { Marquee } from './primitive/marquee';
export type { MarqueeProps } from './primitive/marquee';

// ---- 复杂场景 ----
export { FlipList } from './composed/flip-list';
export type { FlipListProps, FlipListItem } from './composed/flip-list';
export { LayoutGroup } from './composed/layout-group';
export {
  Reorder,
  ReorderGroup,
  ReorderItem,
} from './composed/reorder';
export { PageTransition } from './composed/page-transition';
export type { PageTransitionProps } from './composed/page-transition';
export { ViewTransition, useViewTransition } from './composed/view-transition';
export type { ViewTransitionProps } from './composed/view-transition';
export { ScrollDriven, ScrollProgressBar } from './composed/scroll-driven';
export type { ScrollDrivenProps } from './composed/scroll-driven';
export { Parallax } from './composed/parallax';
export type { ParallaxProps } from './composed/parallax';
export { PathDraw } from './composed/path-draw';
export type { PathDrawProps } from './composed/path-draw';
export {
  TimelineWithStep as Timeline,
  TimelineStepBase as TimelineStep,
  useSequence,
} from './composed/timeline';
export type {
  TimelineProps,
  TimelineStepProps,
  SequenceStep,
} from './composed/timeline';
export { Draggable } from './composed/draggable';
export type { DraggableProps } from './composed/draggable';
export { Cursor } from './composed/cursor';
export type { CursorProps } from './composed/cursor';
export { Confetti } from './composed/confetti';
export type { ConfettiProps } from './composed/confetti';
export { Aurora } from './composed/aurora';
export type { AuroraProps } from './composed/aurora';
export { LottiePlayer } from './composed/lottie-player';
export type { LottiePlayerProps } from './composed/lottie-player';
export { TiltCard } from './composed/tilt-card';
export type { TiltCardProps } from './composed/tilt-card';
export { ScrollScaleCard } from './composed/scroll-scale-card';
export type { ScrollScaleCardProps } from './composed/scroll-scale-card';
