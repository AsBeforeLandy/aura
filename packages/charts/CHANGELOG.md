# @aura-react-comp/charts

## 0.3.1

### Patch Changes

- f820ac7: fix: 声明文件相对引用补全扩展名，修复 moduleResolution node16/nodenext（含 TS 6 默认配置）下导出解析失败的问题——此前 skipLibCheck: true 时导出静默降级为 any，skipLibCheck: false 时报 TS2834/TS2835。
- Updated dependencies [f820ac7]
  - @aura-react-comp/shared@0.1.1

## 0.3.0

### Minor Changes

- d603971: feat: 组件包 ESM 产物内置 'use client' 指令，Next.js App Router 等 SSR/RSC 环境开箱即用——Server Component 可直接渲染组件，无需手动标记。浏览器特有 API 均在 effect/事件回调/命令式方法中访问（带 typeof 守卫与回退值），并以 Node 环境 renderToString 回归测试锁住渲染期安全。shared/request 纯工具包不注入，保持 Server Component 可直接调用。

### Patch Changes

- d603971: fix: PieChart 传 centerContent 时不再叠加内置中心文本——环图内置「总计」文本由调用方完全接管中心区域，与 RingProgress 的 children 接管语义对齐。

## 0.2.0

### Minor Changes

- 6ff642b: 新增两个库：`@aura-react-comp/charts` 与 `@aura-react-comp/editor`。

  ## @aura-react-comp/charts（图表库）

  自研 SVG / Canvas 双渲染内核，不依赖任何第三方图表引擎：

  - **图表组件（18 个）**：LineChart、BarChart、AreaChart、PieChart、FunnelChart、
    WaterfallChart、ComboChart、ScatterChart、RadarChart、HeatmapChart、CandlestickChart、
    TreemapChart、TreeChart、SankeyChart、GraphChart、GaugeChart、RingProgress、Sparkline
  - **渲染内核**：刻度算法（1/2/2.5/5 × 10^n）、band / point / linear 三种坐标、路径生成器（linear / monotone / smooth / step、扇形、圆弧、圆角矩形、符号）、场景图与 Canvas 批量绘制
  - **主题**：运行时读取 Aura CSS 变量，默认为组件库主题；支持 `'dark'`、`createChartTheme` 局部覆盖与 `palette` 快捷替换；`data-theme` 切换后自动跟随
  - **无障碍**：SVG `role="img"` + 隐藏数据表，读屏器可读取真实数值
  - **配置式入口**：`<Chart option={...}>` 支持 ECharts 风格的常用子集，便于迁移与 AI 生成

  ## @aura-react-comp/editor（编辑器）

  基于 Tiptap / ProseMirror 的 headless 引擎封装，外观完全由 Aura 令牌驱动：

  - 行内样式（加粗/斜体/下划线/删除线/行内码/上下标/高亮/颜色/字号）
  - 块级（H1-H6、引用、分割线、对齐、代码块含语法高亮）
  - 列表与任务列表、表格（增删行列、列宽拖拽）、图片（URL / 上传）、链接
  - 工具栏、撤销重做、字数统计、只读模式、中英文语言包
  - `features` 开关同时作用于「扩展注册」与「工具栏」，关闭即彻底关闭
  - `onChange` 一次给出 html / json / text / 字数

  ## 大数据能力（新增）
  - **LTTB 降采样**：`sampling`（默认 800 点）。分桶取「与前后选中点构成三角形面积最大」的点，
    保住尖峰；多系列共用一套下标，避免折线错位
  - **dataZoom 缩略轴**：`dataZoom` / `defaultZoom` / `zoom`（受控）/ `onZoomChange`，
    支持拖手柄、拖窗口、点轨道跳转；窗口最窄 2%，窗口变化时 y 轴重新缩放
  - 动画状态机在数据点数变化时跳过插值，避免缩放时出现「从 0 长出来」

  ## 双轴（新增）

  `yAxisRight` + `series[].yAxisIndex` 支持第二根数值轴，右轴刻度独立、可与左轴量纲不同。
  只在「传了 yAxisRight」且「确有系列使用右轴」时才绘制，避免出现空轴。

  ## 动画（新增）
  - 入场与数据更新拆成两套机制：入场逐图元错峰生长，更新走值插值，**不再每次数据变化重播入场**
  - `animation` 支持配置对象：`duration` / `easing` / `stagger` / `delay`，内置 5 条缓动曲线
  - 默认改为 `easeOutQuint` + `stagger 0.35`，图元按序扫过而非同时弹起
  - 柱图从各自基线生长、饼图扇区顺时针依次展开、散点淡入、仪表盘弧与数字同步推进
  - 命中 `prefers-reduced-motion`、页面隐藏、或 rAF 不触发时自动落到终态（避免图表卡在起始帧）

  ## 文档

  每个组件都有独立文档页（含 2~4 个可运行 demo、完整 API 表格与设计说明），
  由 dumi 依据目录内的 `index.md` 自动生成路由与侧边栏菜单。

  两个包均已接入 monorepo 的类型检查、覆盖率、体积与产物冒烟门禁。
