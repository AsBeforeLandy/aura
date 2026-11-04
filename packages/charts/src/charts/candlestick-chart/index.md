---
title: CandlestickChart
subtitle: K 线图
group: 图表 · 进阶
category: Charts
description: 一根蜡烛编码开盘、收盘、最高、最低四个价格。
order: 5
demo:
  cols: 1
toc: content
---

# CandlestickChart K 线图

K 线（蜡烛图）用一根图形同时表达四个价格：**开盘、收盘、最高、最低**。实体表示开收之间的结果，上下影线表示盘中波动范围。

## 何时使用

- 股票、期货、加密货币等行情走势
- 需要同时看「当期结果」与「盘中波动」
- 需要叠加均线观察趋势

不适合：只有单一数值的时间序列（用[折线图](/charts/line-chart)）。

## 代码演示

<code src="./demo/basic.tsx" description="完整形态：蜡烛 + 三条均线 + 下方成交量副图。红涨绿跌，遵循国内习惯。">基础用法</code>

<code src="./demo/simple.tsx" description="精简形态（无成交量、单条均线），以及面向海外市场时对调涨跌色的写法。">精简与国际配色</code>

## API

### CandlestickChartProps

| 属性                        | 说明                                    | 类型                | 默认值          |
| --------------------------- | --------------------------------------- | ------------------- | --------------- |
| data                        | 行情数据                                | `CandlestickItem[]` | `[]`            |
| ma                          | 均线周期，传 `[]` 关闭                  | `number[]`          | `[5, 10, 20]`   |
| showVolume                  | 是否显示成交量副图（需数据含 `volume`） | `boolean`           | `true`          |
| upColor                     | 上涨颜色                                | `string`            | `#ef4444`（红） |
| downColor                   | 下跌颜色                                | `string`            | `#22c55e`（绿） |
| theme / tooltip / animation | 同基础图表                              | —                   | —               |

### CandlestickItem

```ts
interface CandlestickItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
```

## 设计说明

**红涨绿跌是刻意的默认**

A 股、港股与国内用户的心智都是「红涨绿跌」，与欧美市场相反。默认值按国内习惯给，面向海外时对调两个颜色即可——这比让所有人自己去查配置要好。

**均线不足周期时不画，而不是补 0**

MA5 需要前 4 根的收盘价。不足时返回 `null`、跳过该点，线自然从第 5 根开始。若用 0 顶替，前 4 根会把均线猛地拉到轴上，图形完全失真。

**成交量用同色但半透明**

成交量柱与当日蜡烛同色，但透明度降到 0.55。这样「放量上涨 / 缩量下跌」的组合一眼可辨，又不会让副图抢走主图的注意力。

**x 轴标签自动抽样**

交易日超过 8 个时按步长抽样，只保留首尾附近若干标签。密集的日期文字会连成一片黑条。

**入场动画以收盘价为锚点**

蜡烛从收盘价向两端展开，均线与成交量同步生长。这样动画过程中读到的「当前值」始终有意义，而不是从 0 凭空长出来。
