# @aura-react-comp/charts-3d

## 0.3.0

### Minor Changes

- 9534220: feat(charts-3d): 新增 7 个 3D 可视化与氛围组件并完善底层渲染能力

  - 新增 `Pie3D`（3D 立体饼图/环形图）、`Ribbon3D`（3D 丝带折线面积图）、`Funnel3D`（3D 立体漏斗/金字塔图）、`Radar3D`（3D 立体雷达图）
  - 新增 `DandelionField`（蒲公英被风吹散 3D 动态背景，支持根部稳固悬臂柔弯、绒毛逐根拂风微颤与阵风交互）
  - 新增 `Globe3D`（真实卫星地球贴图 + 内置兜底、云层、瑞利大气与 3D 飞线）与 `Network3D`（力导/球面/网格 3D 关系网络）
  - 修复 `Bar3D` 多段色带、`InstancedBars` 色值归一与 `TextSprite` 字体缩放缺陷，补齐 `Scene3D` 自动旋转速度与 `SceneLegend` 令牌，并清理废弃组件 `HoloRing`

## 0.2.1

### Patch Changes

- f820ac7: fix: 声明文件相对引用补全扩展名，修复 moduleResolution node16/nodenext（含 TS 6 默认配置）下导出解析失败的问题——此前 skipLibCheck: true 时导出静默降级为 any，skipLibCheck: false 时报 TS2834/TS2835。
- Updated dependencies [f820ac7]
  - @aura-react-comp/charts@0.3.1

## 0.2.0

### Minor Changes

- d603971: feat: 组件包 ESM 产物内置 'use client' 指令，Next.js App Router 等 SSR/RSC 环境开箱即用——Server Component 可直接渲染组件，无需手动标记。浏览器特有 API 均在 effect/事件回调/命令式方法中访问（带 typeof 守卫与回退值），并以 Node 环境 renderToString 回归测试锁住渲染期安全。shared/request 纯工具包不注入，保持 Server Component 可直接调用。

### Patch Changes

- Updated dependencies [d603971]
- Updated dependencies [d603971]
  - @aura-react-comp/charts@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [6ff642b]
  - @aura-react-comp/charts@0.2.0
