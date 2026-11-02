# @aura-react-comp/motion

## 0.2.10

### Patch Changes

- e23cd11: **修复 `ScrollDriven` / `ScrollScaleCard` 在**内层滚动容器**里进度不更新的问题**

  - 根因：`useScroll({ target })` 未指定 `container` 时只监听 window 的滚动。目标位于
    抽屉 / 表格 / 文档 demo 预览框等内层滚动容器时，容器滚动不触发 window scroll，
    进度条永远停在初始值。
  - 新增 `hooks/useScrollContainer`：挂载时向上查找最近的「已溢出且
    `overflow: auto|scroll|overlay`」的祖先作为滚动容器，未命中才回退到页面滚动轴
    （用 isomorphic layout effect，避免首帧闪烁；SSR 安全）。
  - 两个组件新增 `container` 属性可显式覆盖；同时导出 `useScrollContainer` 与
    `findScrollableAncestor` 供业务复用。
  - 判据带溢出校验（`scrollHeight > clientHeight + 1`），不会把「声明了 auto 但
    未溢出」的容器（如 dumi 的 `.markdown`）误判为目标容器。
  - 新增 5 条单元测试覆盖命中 / 跳过 / 未溢出 / 无容器 / null 入参。

## 0.2.9

### Patch Changes

- 2f71288: **手感对齐 Motion 的生产级动画：弹簧优先**

  - **`Slide` / `Fade` / `Zoom` 默认改用弹簧物理**（`motionSprings.spring` = stiffness 320 /
    damping 30），位移与缩放不再匀速滑过，而是有质量感的"快进慢停"。新增 `spring`
    开关（默认 `true`），需要严格时序时设 `false` 退回 `duration + ease`。
    `Collapse` 刻意不接弹簧：高度带超调会"先冲过再回落"，观感是抖动。
  - **`FlipList` 改用分层过渡（per-value transition）**：位置重排走弹簧（跟手、无拖影），
    进出场的透明度/位移/缩放仍走时长——这是 Motion 官方推荐的做法，之前统一用
    duration 会让重排显得"飘"。
  - **`TiltCard` 弹簧 220/24 → 300/30**：更跟手，指针离开后回正更干脆。
  - **`Draggable` 显式惯性参数**：`dragElastic={0.5}`（拖出边界的橡皮筋，Motion 默认值）
    与 `dragTransition={{ power: 0.3, timeConstant: 700 }}`（松手滑行），手感可预期。
  - `TextShimmer` 一轮流光 2.2s → **1.8s**（更轻快）；`TypingDots` 循环 1.1s → **1.2s**
    （与 0.16s 错峰配合，节奏更接近 AI 思考态）。
  - 文档补充「弹簧优先」的设计说明与 `spring` 参数。

## 0.2.8

### Patch Changes

- aac8592: - **亮色主题下 `TiltCard` 的光泽改为紫色**（`--aura-motion-sheen` 亮色由
  `rgba(255,255,255,.9)` 改为 `rgba(124,58,237,.12)`）——浅色卡片上白色光泽几乎不可见，
  换成低饱和紫光后既保留"掠过"的质感又不刺眼；暗色仍为白色光泽。

## 0.2.7

### Patch Changes

- 9691272: **配色全面升级：新增颜色令牌层，组件不再硬编码色值**

  - **新增 `--aura-motion-*` 颜色令牌**（`tokens.css`，亮/暗各一套）：`accent` /
    `accent-strong` / `accent-soft` / `accent-glow` / `cyan` / `blue` / `fuchsia` /
    `card-bg` / `skeleton` / `skeleton-highlight` / `shimmer` / `sheen` / `focus-color`。
    业务方覆盖变量即可整体换肤，暗色模式自动切换。
  - **统一主色**：`GradientBorder` / `Cursor` / `FocusRing` / `ScrollDriven` 此前用的是
    旧灰紫 `#534ab7`，统一为品牌紫 `#7c3aed`（暗色 `#a855f7`）。
  - **`Confetti` 默认色板换成霓虹系**（原为赭橙 `#ba7517` / 砖红 `#d85a30` 等旧 AntD 色板）；
    色板移到 JS 侧 `motionConfettiColors`（canvas 无法解析 CSS 变量）。
  - **`Aurora` / `GradientBorder` 默认渐变**改为紫 → 青 → 品红霓虹序列。
  - `SkeletonShimmer` / `TextShimmer` / `TiltCard` 的表面、高光、光泽改为令牌，
    亮暗主题下对比度都成立。
  - 全部 30 个组件的文档 demo 同步换成新色板（旧色已全仓清零）。
  - 文档新增「颜色令牌」表，说明覆盖方式与 `Confetti` 的例外。

## 0.2.6

### Patch Changes

- 017584a: - **修复 Marquee 回绕时的「闪回」**：此前两份内容之间的间距由外层 flex 的 `gap` 提供，
  元素总宽为 `2c + g`，`x: -50%` 实际位移 `c + g/2`，比一个完整周期少 `g/2`——
  每次循环都会往回跳一下。现改为把间距放在每份内容的尾部（`paddingRight`），
  总宽变为 `2(c + g)`，`-50%` 正好等于一个周期，回绕完全无感。
  - 同时把内容副本标记为 `aria-hidden`，避免读屏重复播报。

## 0.2.5

### Patch Changes

- eb05c38: - 补齐 `LottiePlayer` 测试（5 条）：role=img 容器与尺寸、loadAnimation 参数透传、
  reduced-motion 下 loop/autoplay 强制关闭（单独文件规避引擎的模块级缓存）、
  卸载销毁实例、lottie-web 未安装时渲染占位不抛错；
  - motion 测试总数 62 → **67**，30 个组件全部具备意图断言覆盖。

## 0.2.4

### Patch Changes

- 11f6255: - 补齐 primitive 剩余组件测试（新增 12 条）：Reveal（四 variant）、InViewport、
  Magnetic、SkeletonShimmer、FocusRing（焦点环出现/消失）、LayoutGroup；
  - `tests/setup.ts` 新增 IntersectionObserver polyfill（observe 即进入视口），
    使 whileInView 类组件（Reveal / InViewport / motion 引擎）在 jsdom 中可测；
  - motion 测试总数 50 → **62**，全仓回归 1023 条通过。

## 0.2.3

### Patch Changes

- 88ca74a: - **修复**：`Timeline` 在无 `IntersectionObserver` 的环境（jsdom、老旧浏览器、
  SSR 水合前）直接抛 ReferenceError（并导致内容停在 opacity 0）——现降级为
  立即播放；
  - 补齐 composed 组件的意图断言测试（新增 19 条）：Draggable / ReorderGroup /
    Cursor / FlipList / Timeline / PageTransition / ViewTransition / ScrollDriven /
    Parallax / PathDraw / Confetti / Aurora；
  - composed 覆盖率：语句 46.46% → **79.61%**，函数 8.33% → **55.17%**。

## 0.2.2

### Patch Changes

- 1db6639: 完善对外检索面：

  - 包 README 补齐 30 个组件清单（分类表）、与 x 的 AI 对话组合示例与文档站链接；
  - `package.json` 补 keywords（text-shimmer / typing / tilt / parallax / aurora /
    confetti / reveal / split-text / scroll-animation）与首页指向 motion 文档路由；
  - `llms.txt` 新增动效组件段（供 AI 检索），根 README 包结构树补全
    icons / x / motion 三个长期缺位的包。

## 0.2.1

### Patch Changes

- 62149b6: - 新增 `AnimatePresence` 与 `motion` 源语导出（条件渲染进出场与自定义编排的
  刚需，业务代码仍优先使用组件；需要高级编排时不必再直接依赖 `motion/react`）；
  - 文档站总览页新增「动效演示墙」：8 个场景自动轮播（悬停暂停、指示器切换），
    组件索引补齐至 30 个。

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
