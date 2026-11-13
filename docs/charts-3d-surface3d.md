---
toc: content
---

# Surface3D

值矩阵 `values[row][col]` → 连续曲面：行列映射到 X / Z 平面，值映射到 Y 高度，顶点色沿多段色带渐变。适合优化地形、概率密度、能量面这类「双变量函数」。

## 代码演示

<code src="./demo/chart-3d-surface.tsx" id="surface-ripple" description="环形波纹曲面：顶点色沿三段色带（深青 → 亮青 → 浅金）渐变。可拖转视角。">环形波纹</code>

<code src="./demo/chart-3d-surface.tsx" id="surface-hills-wireframe" description="双高斯山丘的线框模式：叠加网格线便于排查曲面结构与网格密度，自动旋转展示。">线框模式</code>

## API

| 属性          | 说明                         | 类型         | 默认值       |
| ------------- | ---------------------------- | ------------ | ------------ |
| values        | 值矩阵（任意 ≥2 的行列尺寸） | `number[][]` | `[]`         |
| width / depth | 网格宽深                     | `number`     | `240`        |
| maxHeight     | 最大起伏                     | `number`     | `90`         |
| colorRange    | 色带（支持多段）             | `string[]`   | 青 → 紫 → 粉 |
| wireframe     | 叠加线框                     | `boolean`    | `false`      |

## 设计说明

**顶点色而不是贴图**

曲面颜色由每个顶点的值直接映射色带（vertexColors），three 在三角形间自动插值——不需要生成纹理贴图，数据变化时重建顶点色即可。

**多段色带**

`colorRange` 支持 [低, 中, 高] 任意段数，`sampleGradient` 做分段线性插值。三段色带（深青 → 亮青 → 浅金）比两端渐变更能突出「中间地带」的层次。

**NaN 值按 0 参与**

`NaN ?? 0` 不生效（空值合并只兜 null/undefined），实现里显式判 `Number.isFinite`。缺失值落成 0 高度比抛错或产生 NaN 顶点（整片曲面消失）可接受。

**几何在纯函数里构造**

顶点 / 索引 / 顶点色的生成是纯函数 `buildSurfaceGeometryData`，jsdom 可直接断言（顶点数、索引数、端点高度、色值范围）——WebGL 只负责画。
