---
title: ComboChart
subtitle: 组合图
group: 图表 · 进阶
category: Charts
description: 柱与线混排，在同一坐标系里同时表达量级与速率。
order: 0
demo:
  cols: 1
toc: content
---

# ComboChart 组合图

组合图让同一个图表里同时出现柱状与折线。业务上最常见的形态是「体量用柱、效率用线」。

> **实现说明**：`ComboChart` 没有独立渲染逻辑，它复用直角坐标系内核，由每个 series 的 `type` 决定画法。单独的组件名只是为了让这种高频场景有语义化的入口。

## 何时使用

- 同时展示绝对值与比率（营收 + 增长率）
- 展示主指标与辅助指标（订单量 + 客单价）
- 需要把两类量纲接近的数据放在一张图里对照

## 代码演示

<code src="./demo/basic.tsx" description="柱表示体量、线表示速率。两者量纲接近时共用一个 y 轴是可读的。">营收与增长率</code>

<code src="./demo/multi-metric.tsx" description="订单量用柱、客单价用线并显示数据点，适合看「促销带来单量但拉低客单价」这类关系。">主指标与辅助指标</code>

<code src="./demo/dual-axis.tsx" description="给系列加 yAxisIndex: 1 并开启 yAxisRight，营收（柱，左轴）与增长率（线，右轴）各自使用独立量程。">双轴</code>

<code src="./demo/three-series.tsx" description="两个柱系列 + 一条带面积的线，能表达三层信息，但已经接近单图可承载的信息量上限。">三系列组合</code>

## API

### ComboChartProps

继承 [BaseChartProps](/charts#通用-props)：

| 属性  | 说明           | 类型      | 默认值  |
| ----- | -------------- | --------- | ------- |
| stack | 柱系列是否堆叠 | `boolean` | `false` |

各系列的画法由 `series[].type` 决定：`'bar'` 柱子、`'line'` 折线、`'area'` 面积、`'scatter'` 散点。

## 设计说明

**双轴：能用，但要克制**

双轴曾是本库明确「不支持」的能力，因为它极易被滥用。现在支持了，代价是**把判断权交给使用者**：

```tsx | pure
<ComboChart
  yAxisRight={{ title: '增长率（%）', formatter: (v) => `${v}%` }}
  series={[
    { key: 'revenue', name: '营收', type: 'bar' },
    { key: 'rate', name: '增长率', type: 'line', yAxisIndex: 1 },
  ]}
/>
```

三条使用纪律：

1. **只在量纲差一个数量级以上时用**（万 vs 百分比）。量纲接近却用双轴，等于人为制造「两条线交叉」的假象；
2. **两根轴都要写标题**，否则读者无法判断某条线读的是哪根；
3. **不要用双轴强行制造相关或背离**——两根轴的量程都可以随手调，同一份数据能画出完全相反的结论。

**系列数上限**

一张图超过 3 个系列就该考虑拆分。组合图尤其容易堆叠信息——读者要在「柱高、线高、颜色」三套编码间来回切换。

**右轴的启用条件**

只有同时满足「传了 `yAxisRight`」与「确有系列声明 `yAxisIndex: 1`」才会画右轴。只传配置而没有系列使用，会画出一条空轴——那是纯噪声。
