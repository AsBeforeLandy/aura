---
toc: content
---

# Pie3D

三维立体饼图 / 环形图。使用带平滑倒角的 3D 挤压切块表现占比结构，支持按占比呈立体高度阶梯、悬停沿径向平滑弹出与聚焦高亮，适合营收结构、渠道分布、资产配置与大屏核心 KPI 占比展示。

`Pie3D` 是 `Scene3D` 的场景子组件。

## 何时使用

- 需要在大屏或汇报场景中突出展示核心业务占比结构。
- 希望在 2D 饼图基础上通过「厚度阶梯 + 悬停径向弹出」强化重点板块辨识度。
- 需要在一套组件内灵活切换 3D 实心饼图与 3D 镂空环图。

## 代码演示

<code src="./demo/chart-3d-pie3d.tsx" description="云服务营收结构：支持一键切换 3D 环图 / 实心饼图与高度阶梯，悬停切片径向弹出高亮。">立体占比环图</code>

## API

### Pie3DProps

| 属性            | 说明                                          | 类型                          | 默认值       |
| --------------- | --------------------------------------------- | ----------------------------- | ------------ |
| data            | 占比数据                                      | `Pie3DDatum[]`                | `[]`         |
| radius          | 外半径（世界单位）                            | `number`                      | `115`        |
| innerRadius     | 内半径（世界单位）；`0` 为饼图、`>0` 为环图   | `number`                      | `48`         |
| depth           | 切片基础厚度（世界单位）                      | `number`                      | `28`         |
| heightScale     | 是否按占比缩放厚度形成高度阶梯                | `boolean`                     | `true`       |
| padAngle        | 切片间缝隙角度（弧度）                        | `number`                      | `0.03`       |
| explodeDistance | 悬停切片时沿径向弹出的距离（世界单位）        | `number`                      | `14`         |
| palette         | 分类色板                                      | `string[]`                    | 场景主题色板 |
| legend          | 是否显示带占比的分类图例                      | `boolean`                     | `true`       |
| tooltip         | 是否显示数值与占比提示框                      | `boolean`                     | `true`       |
| showLabels      | 是否在切片上方展示名称与占比标签（占比 ≥ 4%） | `boolean`                     | `true`       |
| animation       | 是否开启错峰生长与悬停径向弹出动画            | `boolean`                     | `true`       |
| onSliceClick    | 点击切片回调                                  | `(datum: Pie3DDatum) => void` | -            |

### Pie3DDatum

```ts
interface Pie3DDatum {
  name: string;
  value: number;
  color?: string;
}
```

非正数值（`<= 0`）或非有限值（`NaN` / `Infinity`）会被自动过滤。

### 纯函数

`buildPie3DModel(data, options)` 返回归一化后的扇区角度、占比、厚度阶梯、弹出方向向量与标签坐标，不依赖 React，可在 jsdom/Node 中直接单测。
