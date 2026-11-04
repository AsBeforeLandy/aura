---
title: BarChart
subtitle: 柱状图
group: 图表 · 基础
category: Charts
description: 用矩形长度比较分类之间的数值大小。
order: 1
demo:
  cols: 1
toc: content
---

# BarChart 柱状图

柱状图用**长度**编码数值，是分类比较最准确的图形。人眼对长度的判断精度远高于对面积或角度的判断。

## 何时使用

- 比较不同分类的数值大小
- 分类数量在 2~20 个之间（过多时改用[折线图](/charts/line-chart)或热力图）
- 需要同时看总量与构成（堆叠模式）

## 代码演示

<code src="./demo/basic.tsx" description="分组柱状：同一分类下的多个系列并排，适合直接比较。">基础用法</code>

<code src="./demo/stack.tsx" description="堆叠与分组的区别：堆叠回答「总量多少、由什么构成」，分组回答「谁高谁低」。">堆叠与分组</code>

<code src="./demo/negative.tsx" description="正负值双向柱：正值向上、负值向下，基线始终在 0。">正负值</code>

## API

### BarChartProps

继承 [BaseChartProps](/charts#通用-props)，并额外支持：

| 属性        | 说明                               | 类型      | 默认值  |
| ----------- | ---------------------------------- | --------- | ------- |
| stack       | 是否堆叠                           | `boolean` | `false` |
| barMaxWidth | 柱子最大宽度，避免少数据时柱子过胖 | `number`  | `48`    |

## 设计说明

**y 轴必须从 0 开始**

柱状图用长度编码数值。如果基线不是 0（比如从 90 起），一根 100 的柱子看起来会是 10 的十倍长——这不是「放大细节」，这是制造错觉。因此 `BarChart` 的 `yAxis.startFromZero` 默认为 `true`，且不建议关闭。

**圆角只加在一端**

柱子的圆角只作用于远离基线的那两个角，贴基线的一端保持直角。四角全圆会让柱子的视觉长度比数据长度短一截。

**正负值分开堆叠**

同一分类里正值从 0 向上累加、负值从 0 向下累加，两者互不干扰。混在一起累加会让「收入正、支出负」的图整体错位。
