---
toc: content
---

# 概览

`@aura-react-comp/charts-3d` 是 charts 的 3D 延伸：真三维渲染（three.js + WebGL），但 API 风格、主题体系与提示框交互和 2D 图表完全一致。

## 安装

```bash
pnpm add @aura-react-comp/charts-3d three
```

`three` 是 peerDependency——不使用 3D 库时不会为其它包增加任何体积；使用 3D 时显式安装自己需要的版本。

## 30 秒看到效果

<code src="./demo/chart-3d.tsx" description="Bar3D 三维柱状矩阵：拖动旋转视角，滚轮缩放，悬停查看数值，柱体错峰生长入场。各组件的完整示例见上方索引对应的页面。">拖转我</code>

## 组件索引

| 组件                                  | 用途           | 关键能力                                 |
| ------------------------------------- | -------------- | ---------------------------------------- |
| [Scene3D](/charts-3d-scene)           | 3D 画布容器    | 自适应、视角预设（巡检模式）、WebGL 降级 |
| [Bar3D](/charts-3d-bar3d)             | 三维柱状矩阵   | 错峰生长动画、InstancedMesh、色带映射    |
| [Scatter3D](/charts-3d-scatter3d)     | 三维散点       | 三维位置编码、类别 / 按值着色            |
| [Surface3D](/charts-3d-surface3d)     | 三维曲面       | 顶点色渐变、多段色带、线框模式           |
| [Voxel3D](/charts-3d-voxel)           | 三维体素热力图 | 三维分类交叉、InstancedMesh、拾取提示    |
| [Network3D](/charts-3d-network)       | 三维关系网络   | 确定性布局、邻居高亮、分类图例           |
| [Globe3D](/charts-3d-globe)           | 三维地球业务图 | 真实卫星地球、经纬度点位、立体飞线       |
| [ParticleField](/charts-3d-particles) | 粒子背景装饰   | 星野 / 连线网络、鼠标视差、确定性初始化  |

## 设计三原则

**1. 与 2D 图表同一套语言**

高度编码数值、颜色沿色带映射、tooltip 的样式与交互——和 2D 热力图、折线图完全一致。读者从 2D 迁移到 3D 不需要学第二遍。

**2. 设计令牌直通**

场景内的颜色从 `--aura-*` CSS 变量读取（`useScene().readToken`），切换 `data-theme` 后 3D 场景与 2D 图表跟随同一套令牌。这是把 3D 做进 Aura 而不是「另起一个 three demo」的原因。

**3. 纯函数层与渲染层分离**

WebGL 无法在 jsdom 里运行，所以 3D 库的测试重心在**纯函数层**：投影（世界坐标 → 屏幕坐标，用正交相机手算断言）、高度缩放、色带归一化、粒子推进与连线收集。渲染层靠真浏览器截图验收。

## 体积与依赖

`three` 是 peerDependency（压缩后约 160KB，由使用方安装），`@react-three/fiber` 与 `three-stdlib` 是运行时依赖。产物里只包含 Aura 的几何与场景编排代码（7 个组件全量约 43KB brotli，支持 ESM 按需引入）——不用 3D 的下游完全不受影响。

## 后续规划

- 面向万级点云的 Scatter3D InstancedMesh 与拾取优化
- 关系网络的大规模布局预计算与增量更新
- 在明确地图数据授权后提供可选边界图层
