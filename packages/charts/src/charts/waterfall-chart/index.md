---
title: WaterfallChart
subtitle: 瀑布图
group: 图表 · 基础
category: Charts
description: 用增量柱展示从期初到期末的增减构成。
order: 5
demo:
  cols: 1
toc: content
---

# WaterfallChart 瀑布图

瀑布图把「累计」拆成一段段增量：每根柱子的起点是前一根的终点，最后落到汇总。

## 何时使用

- 财务分析：期初 → 各项收入/支出 → 期末
- 归因分析：从基准值出发，逐项拆解影响因素
- 需要同时看到「总量变化」与「每项贡献」

不适合：项之间没有累计关系（用[柱状图](/charts/bar-chart)）、只需要看总量构成（用堆叠柱）。

## 代码演示

<code src="./demo/basic.tsx" description="期初余额经过四项增减落到期末，首尾两项为汇总项（从 0 起画）。">基础用法</code>

<code src="./demo/negative.tsx" description="负增长项向下生长，零基线会显式画出；关闭连接线后可对比版本。">负值与连接线</code>

## API

### WaterfallChartProps

| 属性                                  | 说明                 | 类型              | 默认值       |
| ------------------------------------- | -------------------- | ----------------- | ------------ |
| data                                  | 数据，按发生顺序排列 | `WaterfallItem[]` | `[]`         |
| positiveColor                         | 增加项颜色           | `string`          | 主题色板首色 |
| negativeColor                         | 减少项颜色           | `string`          | `#ef4444`    |
| totalColor                            | 汇总项颜色           | `string`          | 主题色板次色 |
| connector                             | 相邻柱之间的连接线   | `boolean`         | `true`       |
| theme / palette / tooltip / animation | 同基础图表           | —                 | —            |

### WaterfallItem

```ts
interface WaterfallItem {
  name: string;
  /** 增量值：正为增加，负为减少 */
  value: number;
  /** 汇总项：从 0 画到当前累计值 */
  isTotal?: boolean;
  color?: string;
}
```

## 设计说明

**`isTotal` 不是样式开关，是语义**

汇总项的柱子表示「此时此刻的绝对值」，因此从 0 起画；普通项表示「这一步的增量」，从上一项的累计处起画。两者混用会让读者完全误读数据，所以必须由使用方显式声明。

**涨跌配色**

默认增加用主题紫、减少用 Aura 错误色红。这与财务报表的习惯一致，但**与 A 股「红涨绿跌」相反**——如果这张图用于证券场景，请通过 `positiveColor` / `negativeColor` 交换配色。

**连接线的作用**

虚线把「上一根的终点」和「这一根的起点」连起来，读者的视线不会断。关掉后图形更干净，但读图时需要自己在脑中做加法。
