---
title: Chart
subtitle: 配置式图表
group: 图表 · 进阶
category: Charts
description: 用一份 JSON 配置描述图表，兼容 ECharts 风格的常用子集。
order: 3
demo:
  cols: 1
toc: content
---

# Chart 配置式图表

`<Chart option={...} />` 是图表库的另一种入口：不写 JSX 组合，只给一份配置对象。

## 为什么需要两种 API

声明式（`<LineChart series={[...]} />`）表达力强、类型安全，适合手写业务代码。配置式则在两个场景里明显更好：

1. **迁移**：已经在用 ECharts 的项目，`option` 结构不用改就能先跑起来
2. **AI 生成**：让模型吐 JSON 比吐 JSX 组合可靠得多——JSON 不会被语法细节绊倒，也不需要理解 React 的组合规则

## 代码演示

<code src="./demo/basic.tsx" description="一段 ECharts 配置，只换组件名即可渲染。柱与线混合会自动走组合图。">从 ECharts 迁移</code>

<code src="./demo/dynamic.tsx" description="配置由函数动态拼装 —— 后端或 AI 输出 JSON，前端无需写任何 JSX 分支。">动态生成配置</code>

<code src="./demo/pie.tsx" description="series.type 为 pie 时切换到饼图分支，xAxis.data 作为分类名。">饼图配置</code>

## API

### ChartProps

| 属性              | 说明     | 类型                          |
| ----------------- | -------- | ----------------------------- |
| option            | 图表配置 | `ChartOption`                 |
| width / height    | 尺寸     | `number \| string` / `number` |
| theme / palette   | 主题     | 同基础图表                    |
| animation         | 入场动画 | `boolean`                     |
| className / style | 容器样式 | —                             |

### ChartOption（支持的子集）

| 字段                                         | 说明                                              |
| -------------------------------------------- | ------------------------------------------------- |
| `xAxis.data`                                 | 分类数据（同时作为饼图的名称来源）                |
| `xAxis.name` / `yAxis.name`                  | 轴标题                                            |
| `yAxis.min` / `yAxis.max`                    | 值域裁剪                                          |
| `series[].type`                              | `'line' \| 'bar' \| 'area' \| 'scatter' \| 'pie'` |
| `series[].name` / `.data`                    | 系列名与数据                                      |
| `series[].stack`                             | 堆叠分组                                          |
| `series[].smooth`                            | 折线平滑                                          |
| `series[].areaStyle`                         | 面积填充（传 `{}` 即开启）                        |
| `series[].itemStyle.color`                   | 单系列颜色                                        |
| `color`                                      | 色板                                              |
| `legend.show` / `tooltip.show` / `grid.show` | 元素开关                                          |
| `title.text` / `.subtext`                    | 标题与副标题                                      |

## 能力边界（重要）

这里刻意**只支持常用子集**，而不是假装全兼容：

- 未识别的 `series[].type` 会被跳过，而不是静默画错
- 不支持 `dataset`、`dataZoom`、`visualMap`、`graphic`、`brush` 等高级组件
- 不支持 `markLine` / `markPoint` / `markArea`
- 不支持双 y 轴与多 grid

原因：做一个「几乎兼容」的适配层，最终会陷入无穷的边界修补，且使用者无法判断哪些配置真的生效。宁可明确说清楚，让你在需要复杂能力时就地改用声明式 API。
