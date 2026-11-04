---
title: ScatterChart
subtitle: 散点图
group: 图表 · 进阶
category: Charts
description: 用点的位置表达两个数值变量之间的关系。
order: 1
demo:
  cols: 1
toc: content
---

# ScatterChart 散点图

散点图把每个观测值画成一个点，x 与 y 都是**连续数值**。它回答的是「这两个变量有没有关系」。

## 何时使用

- 观察两个数值变量的相关性（价格 vs 销量、投入 vs 产出）
- 发现离群点与聚类
- 数据量较大、需要看分布形状

不适合：x 是分类变量（用[柱状图](/charts/bar-chart)）、只需要看单一指标的排序。

## 代码演示

<code src="./demo/basic.tsx" description="价格与销量的关系，可以直观看出负相关。">基础用法</code>

<code src="./demo/series.tsx" description="多系列用颜色区分组别，也可换用不同标记形状——颜色之外多一层编码，对色觉障碍用户更友好。">多系列与标记形状</code>

<code src="./demo/boundary.tsx" description="x 值全部相同、只有单个点时，值域会自动扩边而不是退化成一条线。">边界情况</code>

## API

### ScatterChartProps

散点图的 x 轴是数值轴，因此**不复用** `BaseChartProps` 的 `series` 语义，单独声明：

| 属性                               | 说明                           | 类型                                                                   | 默认值     |
| ---------------------------------- | ------------------------------ | ---------------------------------------------------------------------- | ---------- |
| data                               | 数据源，每行含 x 与各系列 y 值 | `Record<string, unknown>[]`                                            | `[]`       |
| xKey                               | 数值型 x 字段名                | `string`                                                               | `'x'`      |
| series                             | 系列配置，`key` 指向 y 值字段  | `SeriesConfig[]`                                                       | `[]`       |
| symbol                             | 点形状                         | `'circle' \| 'square' \| 'diamond' \| 'triangle' \| 'star' \| 'cross'` | `'circle'` |
| symbolSize                         | 点直径                         | `number`                                                               | `8`        |
| legend / tooltip / theme / palette | 同基础图表                     | —                                                                      | —          |

## 设计说明

**为什么 x 轴不用 band 坐标？**

分类轴会把 `[1, 2, 100]` 摆成等间距。对散点图来说，这等于伪造了变量之间的比例关系——看起来三个点「挨得差不多近」，实际上第一个和第三个相差 100 倍。散点图的 x 必须走线性坐标，间距按数值比例分配。

**命中半径 28px**

散点很小，如果只在点的像素范围内响应 hover，鼠标几乎点不中。命中判定用 28px 的圆形邻域，取最近的点。

**值域扩边**

单点或全等值时，`min === max` 会让所有点压在轴线上。此时会自动向两侧扩出 4% 余量，保证图形可读。
