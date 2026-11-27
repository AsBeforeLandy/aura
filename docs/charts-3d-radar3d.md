---
toc: content
---

# Radar3D

三维多维立体分层雷达图。在精密 3D 底座蛛网之上，将多个对比系列沿垂直轴分层悬浮展示，搭配高亮闭合轮廓、发光维度顶点与悬停单层抬升聚焦，彻底化解 2D 多系列雷达图重叠成团的问题，适合 AI 模型评测、产品方案对比与综合评分卡。

`Radar3D` 是 `Scene3D` 的场景子组件。

## 何时使用

- 需要同时比较 2~~5 个模型、产品或团队在 5~~8 个指标维度上的能力画像。
- 2D 雷达图多边形叠压在一起难以分辨各系列边界与短板。
- 希望通过拖转视角立体透视多套方案的覆盖面积与指标差异。

## 代码演示

<code src="./demo/chart-3d-radar3d.tsx" description="三个 AI 模型在六大能力维度的三维分层雷达对比：可调整层距，拖动透视，悬停任意顶点聚焦该模型层级。">多模型能力雷达</code>

## API

### Radar3DProps

| 属性         | 说明                           | 类型                                                                                | 默认值       |
| ------------ | ------------------------------ | ----------------------------------------------------------------------------------- | ------------ |
| indicators   | 维度定义（至少 3 个）          | `Radar3DIndicator[]`                                                                | `[]`         |
| series       | 多维对比系列                   | `Radar3DSeries[]`                                                                   | `[]`         |
| radius       | 雷达最大半径（世界单位）       | `number`                                                                            | `115`        |
| layerHeight  | 多系列垂直分层间距（世界单位） | `number`                                                                            | `28`         |
| rings        | 底层同心蛛网圈数               | `number`                                                                            | `4`          |
| palette      | 系列色板                       | `string[]`                                                                          | 场景主题色板 |
| legend       | 是否显示系列图例               | `boolean`                                                                           | `true`       |
| tooltip      | 是否显示得分与达成率提示框     | `boolean`                                                                           | `true`       |
| showLabels   | 是否在外圈显示维度名称标签     | `boolean`                                                                           | `true`       |
| onPointClick | 点击维度顶点回调               | `(info: { series: string; indicator: string; value: number; max: number }) => void` | -            |

### Radar3DIndicator & Radar3DSeries

```ts
interface Radar3DIndicator {
  name: string;
  max?: number;
}

interface Radar3DSeries {
  name: string;
  values: number[];
  color?: string;
}
```

### 纯函数

`buildRadar3DModel(indicators, series, options)` 返回底层蛛网、外圈垂直标尺、各层悬浮多边形三角面、外框线及维度顶点坐标，不依赖 React，可在 jsdom/Node 中直接单测。
