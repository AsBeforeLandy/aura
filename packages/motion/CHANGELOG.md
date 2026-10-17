# @aura-react-comp/motion

## 0.2.0

### Minor Changes

- e79d80c: 新增 6 个高感知动效组件（全部令牌驱动、reduced-motion 降级、可测）：

  - **TextShimmer** 文字流光（AI 生成中质感，深浅底色双方案）；
  - **TypingDots** 思考三点脉冲（role=status + 意图状态机）；
  - **GradientBorder** 流光渐变边框（旋转 conic 光带，合成器友好）；
  - **Marquee** 无缝滚动横幅（双向、内容复制回绕）；
  - **TiltCard** 3D 倾斜卡片（指针驱动 rotateX/Y 弹簧 + 光泽跟随）；
  - **ScrollScaleCard** 滚动缩放揭示（0.9→1 + 淡入，landing 揭示形态）。

  同步补齐 6 个文档页与交互 demo（/motion-components 路由 + 「动效」侧栏分组）。

## 0.1.4

### Patch Changes

- d72f192: 继续精修两组件：

  - **SkeletonShimmer**：光带改 55% 宽度的柔和渐变（原全宽扫掠生硬），
    新增 `index` 支持相邻骨架块错峰出光（0.12s/位）；
  - **PageTransition**：改为「快退慢进」节奏——退场 0.6 倍时长 + accelerate，
    进场交给内层 decelerate 慢进，外层不再重复进场动画。

## 0.1.3

### Patch Changes

- 2cad6b1: 五组件动效精修（全部向后兼容，新增可选 props）：

  - **Reveal** 新增 `variant`：`blur`（8px→0 对焦揭示）/ `mask`（overflow 遮罩升起）/
    `scale`（0.96 卡片揭示），错峰改递增步进（0.08+0.04i 累加）；
  - **SplitText** 新增 `variant`：`rise`（逐字遮罩升起）/ `flip`（rotateX 翻牌+透视），
    默认 stagger 0.04→0.03；
  - **NumberTicker** 重写为逐位独立弹簧：位间错峰 40ms、千分位静态占位、
    容器 tabular-nums 消除数字宽度抖动，新增 `stagger`/`fromZero`；
  - **Confetti** 物理精修：纸条形态（1:2.6 + scaleY 正弦翻面）、上抛扇形初速、
    空气阻力 0.985、翻转速度与下落耦合、末段飘摆；
  - **Aurora** 质感精修：色块 480px/blur 120/透明度 0.32、椭圆形态 60s 慢自转、
    三色块互质轨道周期（14s/17s/21s）避免同步循环感。

## 0.1.2

### Patch Changes

- b722f15: 新增扁平命名导出 `ReorderGroup` / `ReorderItem` / `TimelineStep`（与
  `Reorder.Group` / `Reorder.Item` / `Timeline.Step` 等价），组件文档 demo 改用
  简单标识符 JSX——规避 dumi demo 编译器对「本包导入 + JSX 成员表达式」组合
  丢失绑定的问题（运行时 ReferenceError）。

## 0.1.1

### Patch Changes

- fb6a5b9: 补全全部 24 个动画组件的文档站 demo（每个组件一页 `index.md` + 交互式演示，
  含 API 表），并接入 `/motion-components` 路由与「动效」侧栏分组。
