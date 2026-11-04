---
title: Sparkline
subtitle: 迷你图
group: 图表 · 指标
category: Charts
description: 没有坐标轴的极简趋势图，可嵌入表格与卡片。
order: 2
demo:
  cols: 1
toc: content
---

# Sparkline 迷你图

迷你图没有坐标轴、没有图例、没有 tooltip。它唯一的职责是让读者在扫视时立刻看出「这条数据在涨还是在跌」。

## 何时使用

- 表格里的趋势列（一行一个实体）
- 卡片里的背景趋势
- KPI 数字旁边的走势提示

不适合：需要读数值（用[折线图](/charts/line-chart)）、需要比较多个系列的精确差异。

## 代码演示

<code src="./demo/types.tsx" description="三种形态：line 最轻、area 强调体量、bar 强调离散周期。上行紫、下行绿。">三种形态</code>

<code src="./demo/table.tsx" description="典型用法：表格的趋势列。颜色按整体涨跌决定，与数字列形成对照。">嵌入表格</code>

## API

### SparklineProps

| 属性           | 说明           | 类型                        | 默认值       |
| -------------- | -------------- | --------------------------- | ------------ |
| data           | 数值序列       | `number[]`                  | `[]`         |
| type           | 形态           | `'line' \| 'area' \| 'bar'` | `'line'`     |
| width / height | 尺寸           | `number`                    | `120` / `32` |
| color          | 颜色           | `string`                    | 主题强调色   |
| smooth         | 曲线平滑       | `boolean`                   | `false`      |
| showLast       | 高亮最后一个点 | `boolean`                   | `false`      |
| strokeWidth    | 线宽           | `number`                    | `1.6`        |

## 设计说明

**为什么没有 tooltip？**

迷你图的可点击区域只有几十像素，悬浮提示会频繁误触发，并且会把用户的注意力从整行数据拉走。需要看具体数值时，用户本来就会去看旁边的数字列。

**为什么不做 y 轴归一化提示？**

迷你图的 y 域是数据自身的 min~max，这意味着两条迷你图的「高度」不可直接比较——这是该图表类型的固有限制。如果两条趋势需要横向比较，请用同一个 [LineChart](/charts/line-chart) 的多个系列，或明确告诉读者不要比高度。

**空数据返回 null**

不渲染占位、不占空间。表格里的空单元格比一个「暂无数据」的小方块更干净。
