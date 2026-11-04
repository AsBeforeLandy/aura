---
title: RingProgress
subtitle: 环形进度
group: 图表 · 指标
category: Charts
description: 紧凑的环形进度指示，用于卡片角落与表格单元格。
order: 1
demo:
  cols: 1
toc: content
---

# RingProgress 环形进度

与[仪表盘](/charts/gauge-chart)的分工：仪表盘强调「在量程中的位置」（有刻度、有端点），环形进度强调「完成度」（无刻度、更紧凑、可嵌入任意容器）。

## 何时使用

- 资源占用率（CPU / 内存 / 磁盘）
- 卡片、列表项里的完成度指示
- 需要多个小指标并排展示

## 代码演示

<code src="./demo/basic.tsx" description="三种尺寸与环宽，第三个用 children 接管中心内容。">基础用法</code>

<code src="./demo/dashboard.tsx" description="并排的多个环形进度，是监控面板里最常见的排列。">监控面板</code>

## API

### RingProgressProps

| 属性        | 说明           | 类型        | 默认值          |
| ----------- | -------------- | ----------- | --------------- |
| value       | 当前值         | `number`    | —               |
| max         | 满值           | `number`    | `100`           |
| size        | 正方形边长     | `number`    | `160`           |
| thickness   | 环宽（像素）   | `number`    | `12`            |
| color       | 进度颜色       | `string`    | 主题强调色      |
| trackColor  | 轨道颜色       | `string`    | 轴线色 60%      |
| startAngle  | 起点角度（度） | `number`    | `-90`（正上方） |
| round       | 圆角端点       | `boolean`   | `true`          |
| showPercent | 中心显示百分比 | `boolean`   | `true`          |
| children    | 自定义中心内容 | `ReactNode` | —               |

## 设计说明

**为什么不复用 PieChart？**

饼图的几何是「多个扇区拼成整圆」，环形进度是「单条弧 + 轨道」。虽然视觉相似，但前者需要处理图例、扇区间隙、标签避让，后者只需要两段弧。为后者复用前者，会把一堆无关逻辑拖进最轻的组件里。

**尺寸由 `size` 控制而非 `width/height`**

环形进度必须保持正圆。允许传 width/height 会引出「拉扁了怎么办」的问题，直接用边长更不容易出错。
