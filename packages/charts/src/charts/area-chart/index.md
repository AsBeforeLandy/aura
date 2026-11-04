---
title: AreaChart
subtitle: 面积图
group: 图表 · 基础
category: Charts
description: 折线加填充，强调量的累积与整体规模。
order: 2
demo:
  cols: 1
toc: content
---

# AreaChart 面积图

面积图是带填充的折线图。填充让视线自然落在「线下方的总量」上，因此它比折线图更适合表达规模而非趋势。

## 何时使用

- 强调数值的累积量、总量规模
- 单系列展示随时间变化的体量
- 多系列时表达「总量 + 构成」（**必须堆叠**）

## 代码演示

<code src="./demo/basic.tsx" description="单系列面积图，填充不透明度由主题控制（默认 0.18），既能看出体量又不压住网格线。">基础用法</code>

<code src="./demo/stack.tsx" description="堆叠面积图：顶部线是总量，每一层的厚度是该系列的贡献。">堆叠面积</code>

<code src="./demo/overlap.tsx" description="多系列不堆叠时后画的会遮住先画的——这不是 bug，是面积图的固有缺陷，因此多系列请务必开 stack。">多系列的正确姿势</code>

## API

### AreaChartProps

继承 [BaseChartProps](/charts#通用-props)，并额外支持：

| 属性        | 说明         | 类型                                           | 默认值       |
| ----------- | ------------ | ---------------------------------------------- | ------------ |
| curve       | 曲线插值方式 | `'linear' \| 'monotone' \| 'smooth' \| 'step'` | `'monotone'` |
| smooth      | 是否平滑     | `boolean`                                      | `false`      |
| stack       | 是否堆叠     | `boolean`                                      | `false`      |
| areaOpacity | 填充不透明度 | `number`                                       | `0.18`       |

## 设计说明

**为什么多系列必须堆叠？**

面积图用「面积」编码数值，而面积是二维的：两个系列重叠时，上层完全盖住下层，读者看到的是上层的完整面积，会误以为那就是它的值。堆叠至少让每层的厚度可读。如果只想比较趋势而不关心总量，请直接用[折线图](/charts/line-chart)——不要用面积图。

**填充透明度为什么是 0.18？**

网格线在填充下方仍需可见。透明度太高会让网格消失，读者失去参照；太低则看不出面积。0.18 是多轮视觉校验后的取值，可通过 `areaOpacity` 覆盖。
