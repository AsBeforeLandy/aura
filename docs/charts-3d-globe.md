---
toc: content
---

# Globe3D

三维地球业务可视化。用经纬度定位业务节点，用球面弧线表示跨区域连接，数值映射到点位大小和颜色，适合全球业务分布、物流干线、网络节点和区域指标大屏。

`Globe3D` 是 `Scene3D` 的场景子组件。

## 何时使用

- 需要展示全球或跨区域业务节点的地理位置与指标。
- 需要表达城市、机房、仓库之间的连接线路。
- 需要在不引入大型地图 SDK 的情况下展示轻量地球场景。

## 代码演示

<code src="./demo/chart-3d-globe.tsx" description="全球业务节点与线路：自动环绕、悬停查看指标、点击选择节点。">全球业务网络</code>

## API

### Globe3DProps

| 属性            | 说明                                             | 类型                            | 默认值                   |
| --------------- | ------------------------------------------------ | ------------------------------- | ------------------------ |
| points          | 业务节点                                         | `Globe3DPoint[]`                | `[]`                     |
| arcs            | 跨节点弧线                                       | `Globe3DArc[]`                  | `[]`                     |
| radius          | 地球半径（世界单位）                             | `number`                        | `120`                    |
| pointSize       | 点位基础半径（世界单位）                         | `number`                        | `4`                      |
| arcHeight       | 弧线最大抬升比例，相对于地球半径                 | `number`                        | `0.35`                   |
| textureUrl      | 真实地球地表贴图 URL（等距圆柱投影）             | `string`                        | 内置程序化自然地球       |
| normalMapUrl    | 地形法线贴图 URL（山脉立体光影起伏）             | `string`                        | -                        |
| bumpMapUrl      | 地形灰度凹凸贴图 URL                             | `string`                        | -                        |
| bumpScale       | 凹凸贴图高度系数                                 | `number`                        | `2.4`                    |
| specularMapUrl  | 海洋高光贴图 URL（海洋反光、陆地哑光）           | `string`                        | 内置海洋高光             |
| cloudsUrl       | 透明大气云层贴图 URL                             | `string`                        | 内置漂移云层             |
| globeColor      | 球体染色基准色                                   | `string`                        | `'#ffffff'`              |
| atmosphereColor | 大气层辉光颜色                                   | `string`                        | 真实瑞利天空蓝           |
| colorRange      | 点位与弧线数值色带两端                           | `[string, string]`              | `['#38bdf8', '#fbbf24']` |
| showClouds      | 是否显示缓慢漂移的独立 3D 大气云层               | `boolean`                       | `true`                   |
| showGrid        | 是否显示每 30° 的辅助经纬网与空间轨道环          | `boolean`                       | `false`                  |
| showDots        | 是否显示球面斐波那契圆点阵叠层                   | `boolean`                       | `false`                  |
| showAtmosphere  | 是否显示内外双层瑞利大气散射辉光                 | `boolean`                       | `true`                   |
| animateArcs     | 是否开启飞线流光、云层漂移与节点脉冲动画         | `boolean`                       | `true`                   |
| legend          | 是否显示数值色带图例                             | `boolean`                       | `true`                   |
| tooltip         | 是否显示命中提示框                               | `boolean`                       | `true`                   |
| showLabels      | 是否显示高可读胶囊城市标签；仅 30 个节点以内生效 | `boolean`                       | `false`                  |
| onPointClick    | 节点点击回调                                     | `(point: Globe3DPoint) => void` | -                        |

### Globe3DPoint

```ts
interface Globe3DPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  value?: number;
}
```

纬度范围 `[-90, 90]`，经度会归一化到 `[-180, 180)`。重复 `id` 保留首个节点，非有限坐标会被过滤。

### Globe3DArc

```ts
interface Globe3DArc {
  from: string;
  to: string;
  value?: number;
}
```

`from` 和 `to` 引用点位 `id`。不存在端点的弧线与自环会被忽略。

### 纯函数

| 函数                | 用途                                       |
| ------------------- | ------------------------------------------ |
| `latLngToVector3`   | 经纬度转 Three.js 三维坐标                 |
| `buildGlobeModel`   | 过滤业务数据并生成点位、弧线、经纬网与点阵 |
| `buildSphereDots`   | 生成均匀的斐波那契球面点阵坐标             |
| `buildArcTubes`     | 将球面弧线合并为立体渐变管道网格数据       |
| `sampleArcPosition` | 按归一化进度在弧线路径上插值定位飞线粒子   |

坐标约定为 `x = r·cos(lat)·cos(lng)`、`y = r·sin(lat)`、`z = -r·cos(lat)·sin(lng)`。

## 设计说明

**真实地球模型 + 零依赖兜底**

支持传入等距圆柱投影（Equirectangular）的真实卫星地球地表、地形法线/凹凸、海洋高光与透明云层贴图，经纬度坐标与标准 Three.js 球面 UV 精确对齐。未传外部贴图或贴图加载期间，组件会自动渲染内置程序化自然地球（海洋、陆地地貌、极地冰盖与云层），保证离线与弱网环境下同样开箱即用。

**弧线沿球面插值**

连线使用球面线性插值并在中点按正弦曲线抬升，避免穿越地球内部；对跖点采用确定性切平面处理，不会产生零向量或 NaN。

**限制信息密度**

默认不显示标签；开启后以高可读胶囊样式展示，且只在 30 个节点以内生效。需要展示大量城市时，建议聚合为区域节点，或通过点击联动外部列表。

## 地图数据合规

本组件及其文档演示使用的自然地理卫星纹理（NASA Visible Earth Public Domain）**仅展示自然地貌、海洋与云层，不包含国界线或行政区划**。若业务需要边界、海域或政区图层，请通过 `textureUrl` 自行接入具有明确授权与审图资质的数据源，并遵守目标地区的地图与测绘合规要求。
