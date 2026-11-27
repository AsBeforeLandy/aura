---
toc: content
---

# Ribbon3D

三维多系列趋势丝带 / 面积墙图。将多条时间序列沿 Z 轴前后错落排布，以带厚度与垂向渐变的 3D 立体波浪丝带墙叠加顶部高光脊线呈现，彻底消除 2D 多折线互相缠绕遮挡的问题，适合多区域、多产品线趋势对比与监控大屏。

`Ribbon3D` 是 `Scene3D` 的场景子组件。

## 何时使用

- 存在 3~8 条时间序列需要同屏对比，2D 折线图已出现严重交叉遮挡。
- 希望在保留各序列清晰趋势轮廓的同时，通过立体高度与渐变面积强化波动幅度。
- 需要支持悬停聚焦单条序列并查看精准节点指标。

## 代码演示

<code src="./demo/chart-3d-ribbon3d.tsx" description="四大区域月度营收趋势丝带：沿 Z 轴错落排布，支持平滑样条与节点光珠切换，悬停自动聚焦单条序列。">多系列趋势丝带</code>

## API

### Ribbon3DProps

| 属性         | 说明                               | 类型                                                                                 | 默认值       |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------------------ | ------------ |
| categories   | X 轴类目 / 时间刻度                | `string[]`                                                                           | `[]`         |
| series       | 多条趋势序列                       | `Ribbon3DSeries[]`                                                                   | `[]`         |
| width        | X 轴总宽（世界单位）               | `number`                                                                             | `280`        |
| depth        | Z 轴总深（世界单位）               | `number`                                                                             | `180`        |
| maxHeight    | 丝带最大高度（世界单位）           | `number`                                                                             | `125`        |
| thickness    | 丝带墙体厚度（世界单位）           | `number`                                                                             | `8`          |
| smooth       | 是否使用 Catmull-Rom 样条平滑采样  | `boolean`                                                                            | `true`       |
| palette      | 系列色板                           | `string[]`                                                                           | 场景主题色板 |
| legend       | 是否显示系列图例                   | `boolean`                                                                            | `true`       |
| tooltip      | 是否显示节点提示框                 | `boolean`                                                                            | `true`       |
| showNodes    | 是否显示顶部采样节点光珠并支持拾取 | `boolean`                                                                            | `true`       |
| showGrid     | 是否显示地面与背面参考网格         | `boolean`                                                                            | `true`       |
| onPointClick | 点击采样节点回调                   | `(info: { series: string; category: string; value: number; index: number }) => void` | -            |

### Ribbon3DSeries

```ts
interface Ribbon3DSeries {
  name: string;
  values: number[];
  color?: string;
}
```

### 纯函数

`buildRibbon3DModel(categories, series, options)` 返回每条序列的封闭立体墙体顶点/法线/索引、顶部脊线与采样点坐标，不依赖 React，可在 jsdom/Node 中单测。
