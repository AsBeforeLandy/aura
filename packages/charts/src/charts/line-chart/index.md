---
title: LineChart
subtitle: 折线图
group: 图表 · 基础
category: Charts
description: 用连续的线表达数值随时间或序列变化的趋势。
order: 0
demo:
  cols: 1
toc: content
---

# LineChart 折线图

折线图把相邻数据点连成线，用来表达**趋势**。当 x 轴是时间、序号等有序维度，且关心「涨还是跌、快还是慢」时使用它。

## 何时使用

- 展示指标随时间的变化趋势
- 对比多个系列在同一时间轴上的走势
- 数据点数量较多、需要看整体形状而非单个数值

不适合：分类之间没有顺序关系（用[柱状图](/charts/bar-chart)）、需要看构成占比（用[饼图](/charts/pie-chart)）。

## 代码演示

<code src="./demo/basic.tsx" description="最常见的多系列折线，默认自动显示数据点（点数 ≤ 24 时）。">基础用法</code>

<code src="./demo/curve.tsx" description="四种插值方式的对比。默认 monotone 是刻意选择：普通样条会在极值处冲出数据范围，等于画出不存在的高度。">曲线类型</code>

<code src="./demo/area.tsx" description="折线叠加面积填充与堆叠，用来强调量级与累积关系。">面积与堆叠</code>

<code src="./demo/states.tsx" description="缺失值应断开折线而不是补 0；空数据展示占位。">缺失值与空状态</code>

## API

### LineChartProps

继承 [BaseChartProps](/charts#通用-props)，并额外支持：

| 属性       | 说明                                 | 类型                                           | 默认值       |
| ---------- | ------------------------------------ | ---------------------------------------------- | ------------ |
| curve      | 曲线插值方式                         | `'linear' \| 'monotone' \| 'smooth' \| 'step'` | `'monotone'` |
| smooth     | 是否平滑，等价于 `curve="smooth"`    | `boolean`                                      | `false`      |
| area       | 是否给折线填充面积                   | `boolean`                                      | `false`      |
| showSymbol | 是否显示数据点；不传时按点数自动决策 | `boolean`                                      | 点数 ≤ 24    |
| stack      | 是否堆叠（配合 area 使用）           | `boolean`                                      | `false`      |

## 设计说明

**为什么默认是 monotone 而不是 smooth？**

普通样条（Catmull-Rom）在相邻点斜率突变时会「鼓包」，画出的曲线高于真实最大值。折线图一旦表达了不存在的高度，读者就会基于错误信息做判断。monotone 用的是 Fritsch–Carlson 单调切线：极值点处切线归零，曲线必然落在数据范围内。

**为什么缺失值是断线而不是补 0？**

补 0 会让「没有采集到」变成「值为零」，这是两种完全不同的业务含义。断线是诚实的表达。

**数据点显示策略**

点数 ≤ 24 时显示圆点，超过则隐藏——密集折线上的圆点会连成「毛毛虫」，反而遮蔽趋势。
