---
'@aura-react-comp/charts-3d': minor
---

feat(charts-3d): 新增 7 个 3D 可视化与氛围组件并完善底层渲染能力

- 新增 `Pie3D`（3D 立体饼图/环形图）、`Ribbon3D`（3D 丝带折线面积图）、`Funnel3D`（3D 立体漏斗/金字塔图）、`Radar3D`（3D 立体雷达图）
- 新增 `DandelionField`（蒲公英被风吹散 3D 动态背景，支持根部稳固悬臂柔弯、绒毛逐根拂风微颤与阵风交互）
- 新增 `Globe3D`（真实卫星地球贴图 + 内置兜底、云层、瑞利大气与 3D 飞线）与 `Network3D`（力导/球面/网格 3D 关系网络）
- 修复 `Bar3D` 多段色带、`InstancedBars` 色值归一与 `TextSprite` 字体缩放缺陷，补齐 `Scene3D` 自动旋转速度与 `SceneLegend` 令牌，并清理废弃组件 `HoloRing`
