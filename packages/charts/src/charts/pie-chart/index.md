---
title: PieChart
subtitle: 饼图 / 环形图
group: 图表 · 基础
category: Charts
description: 用扇形角度表达各部分占总体的比例。
order: 3
demo:
  cols: 1
toc: content
---

# PieChart 饼图 / 环形图

饼图用**角度**编码占比。角度是三种视觉编码里精度最低的一种（长度 > 位置 > 角度），因此它只适合回答「谁占大头」这类粗粒度问题。

## 何时使用

- 表达部分与整体（一块饼切成几份）
- 分类数量在 2~6 之间
- 只需要读者记住「最大的那块是谁」

不适合：分类之间有细微差异需要精确比较（用[条形图](/charts/bar-chart)）、分类超过 6 个。

## 代码演示

<code src="./demo/basic.tsx" description="实心饼图配引线标签。标签自动左右分侧，避免全部挤在一侧。">基础用法</code>

<code src="./demo/donut.tsx" description="环形图把中心让出来放汇总信息，是仪表盘里最常见的形态。">环形图与中心内容</code>

<code src="./demo/boundary.tsx" description="分类过多时色板会循环、零值不产生扇区。">多分类与零值</code>

## API

### PieChartProps

饼图不使用直角坐标系，因此单独声明 props：

| 属性                                           | 说明                         | 类型                                                | 默认值      |
| ---------------------------------------------- | ---------------------------- | --------------------------------------------------- | ----------- |
| data                                           | 数据                         | `{ name: string; value: number; color?: string }[]` | `[]`        |
| innerRadius                                    | 内径比例，`0` 为实心饼图     | `number`                                            | `0.6`       |
| padAngle                                       | 扇区间隙角度（弧度）         | `number`                                            | `0.01`      |
| label                                          | 标签形式                     | `'outside' \| 'inside' \| false`                    | `'outside'` |
| centerContent                                  | 圆心自定义内容（仅环图有效） | `ReactNode`                                         | —           |
| legend / tooltip / theme / palette / animation | 同基础图表                   | —                                                   | —           |

## 设计说明

**命中判定不用 DOM 事件**

饼图的扇区是不规则多边形，逐个绑事件既慢又难维护。实现上改为把鼠标坐标换算成极坐标（半径 + 角度），再反查所属扇区——这样 SVG 与 Canvas 两种渲染方式可以共用同一套交互逻辑。

**引线标签的排布**

标签按 `cos(中点角)` 判断在左半侧还是右半侧，文本锚点随之切换为 `start` / `end`。不做这一步的话，左半边的标签会朝外溢出画布。

**为什么不建议超过 6 类**

色板只有 12 色，超过 6 类时相邻扇区的颜色已经难以区分，而人眼对相近角度的判断误差在 3° 以上。此时请改用横向条形图——长度编码在分类多时的可读性远好于角度。
