---
toc: content
---

# 3D 示例

`@aura-react-comp/charts-3d` 是 charts 的 3D 延伸：真三维渲染（three.js + WebGL），但 API 风格、主题体系与提示框交互和 2D 图表完全一致。

## 安装

```bash
pnpm add @aura-react-comp/charts-3d three
```

`three` 是 peerDependency——不使用 3D 库时不会为其它包增加任何体积。

## 代码演示

在场景里**拖动鼠标可旋转视角**，滚轮缩放；鼠标悬停柱体查看数值。

<code src="./demo/chart-3d.tsx" description="汇报周期 × 区域的交付量矩阵：X / Z 两个分类维度，高度编码数值，颜色沿色带映射。拖动可旋转视角，柱体入场时错峰生长。">Bar3D 柱状矩阵</code>

<code src="./demo/chart-3d-bar-diff.tsx" description="差值类数据：负值（节省）落在色带左端、正值（超支）落在右端——colorRange 换一组颜色即可反转语义。">差值数据与自定义色带</code>

## Scatter3D

三个数值维度的位置编码（X / Y / Z），点大小与颜色可作为第四、第五个编码通道——但编码通道越多读者越难还原数值，按类别着色是默认。

<code src="./demo/chart-3d-scatter.tsx" description="三类用户聚簇 + 两个离群点：散点图的价值之一就是把离群点暴露出来。拖动旋转查看聚簇结构。">用户分层</code>

<code src="./demo/chart-3d-scatter-value.tsx" description="colorByValue：颜色沿色带按 Y 值（海拔）映射，自动旋转适合展示态。">按值渐变</code>

| 属性         | 说明                                      | 类型               | 默认值  |
| ------------ | ----------------------------------------- | ------------------ | ------- |
| data         | 散点数据                                  | `Scatter3DPoint[]` | `[]`    |
| pointSize    | 点半径（世界单位）                        | `number`           | `5`     |
| colorByValue | 按 Y 值渐变着色（关闭时按 category 着色） | `boolean`          | `true`  |
| colorRange   | 色带两端                                  | `[string, string]` | 紫 → 青 |
| ranges       | 坐标轴范围覆盖                            | `{ x?; y?; z? }`   | 自动    |
| axisLength   | 三条轴的长度                              | `number`           | `240`   |

## Surface3D

值矩阵 `values[row][col]` → 连续曲面：行列映射到 X / Z 平面，值映射到 Y 高度，顶点色沿多段色带渐变。适合优化地形、概率密度、能量面这类「双变量函数」。

| 属性          | 说明                         | 类型         | 默认值       |
| ------------- | ---------------------------- | ------------ | ------------ |
| values        | 值矩阵（任意 ≥2 的行列尺寸） | `number[][]` | `[]`         |
| width / depth | 网格宽深                     | `number`     | `240`        |
| maxHeight     | 最大起伏                     | `number`     | `90`         |
| colorRange    | 色带（支持多段）             | `string[]`   | 青 → 紫 → 粉 |
| wireframe     | 叠加线框                     | `boolean`    | `false`      |

## 动画

Bar3D 入场时从基线**错峰生长**（easeOutQuint，后一根柱子比前一根晚出发）——与 2D 图表的错峰语义一致：整排同时弹起是噪音，扫过才有方向感。数据更新不重播：3D 大屏多为展示态，更新直接落位。

## 视角预设（巡检模式）

大屏与汇报场景里，3D 图表最常见的用法是「不需要用户操作，自己转给人看」。`preset` 提供 4 种视角模板：

| 预设         | 相机       | 行为                               |
| ------------ | ---------- | ---------------------------------- |
| `default`    | 斜视角     | 静态，适合交互分析                 |
| `inspection` | 低角度环绕 | **自动旋转**，转速更快，巡检展示态 |
| `top`        | 正俯视     | 看平面分布，避免透视遮挡           |
| `front`      | 正视图     | 当「图表」用，接近 2D 阅读习惯     |

<code src="./demo/chart-3d-inspection.tsx" description="巡检模式：低角度自动环绕（inspection 预设），无需操作即可持续展示三维结构；柱体错峰生长入场。">巡检模式</code>

所有预设统一把 maxPolarAngle 限制在 π/2.05——不允许钻到地面以下，那会让柱底朝上、文字镜像。显式传 `cameraPosition` / `autoRotate` 可覆盖预设的单项配置。

## 性能

柱体规模超过 300 时自动切换 **InstancedMesh**：全部柱体共用一个 BoxGeometry，整屏一次 draw call，3000 柱无压力；raycaster 拾取用 instanceId 反查数据，tooltip 与高亮行为不变。阈值以下的柱体仍走逐柱 mesh（hover 高亮实现更直接）。

## 后续规划

## Scene3D

画布容器，收敛了所有 3D 渲染的基础设施：容器自适应（ResizeObserver）、DPR 上限（≤2 防止高分屏过载）、相机与三点光照预设、视角控制。

| 属性           | 说明                 | 类型                       | 默认值            |
| -------------- | -------------------- | -------------------------- | ----------------- |
| height         | 画布高度             | `number`                   | `360`             |
| cameraPosition | 相机位置             | `[number, number, number]` | `[320, 260, 380]` |
| enableRotate   | 允许拖转 / 缩放视角  | `boolean`                  | `true`            |
| autoRotate     | 自动旋转（展示模式） | `boolean`                  | `false`           |

SSR 安全：未测量到容器尺寸前不会创建 WebGL 上下文，服务端渲染只输出占位容器。

## Bar3D

数据是「行 × 列」矩阵：`x` 与 `z` 是两个分类维度，`value` 决定柱高；颜色沿色带按值映射——与 2D 热力图同一套编码语言，读者不需要学第二遍。

| 属性       | 说明                     | 类型               | 默认值    |
| ---------- | ------------------------ | ------------------ | --------- |
| data       | 数据矩阵                 | `Bar3DDataItem[]`  | `[]`      |
| maxHeight  | 柱体最大高度（世界单位） | `number`           | `160`     |
| cellSize   | 柱底面边长               | `number`           | `26`      |
| colorRange | 色带两端                 | `[string, string]` | 紫 → 浅紫 |
| tooltip    | 命中提示框               | `boolean`          | `true`    |

## 设计说明

**为什么 three 是 peerDependency**

three 压缩后约 160KB，是整个 Aura 体积里最大的一块。把它声明为 peerDependency 后：不用 3D 的下游完全不受影响；用 3D 的项目显式安装自己需要的版本。产物里只包含 Aura 的几何与命令编排代码（≤ 20KB），three 的 import 语句原样保留交给打包器。

**测试策略**

WebGL 无法在 jsdom 里运行，所以 3D 库的测试重心在**纯函数层**：投影（世界坐标 → 屏幕坐标，用正交相机手算断言）、高度缩放、色带归一化。渲染层靠场景断言与真浏览器截图验收。

**与设计令牌的关系**

场景内的颜色支持从 `--aura-*` CSS 变量读取（`useScene().readToken`），切换 `data-theme` 后 3D 场景与 2D 图表跟随同一套令牌——这是把 3D 做进 Aura 而不是「另起一个 three demo」的原因。

## 后续规划

- globe（3D 地球）：与 2D 地图同样的合规红线，须使用标准地图数据源
- 粒子背景装饰组件
