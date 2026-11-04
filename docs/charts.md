---
toc: content
---

# 图表库

`@aura-react-comp/charts` 是 Aura 的自研图表库：双渲染内核（SVG / Canvas）+ 令牌驱动主题，不依赖任何第三方图表引擎。

## 设计取舍

市面上的图表方案大致三类，Aura 选择自研：

| 方案                      | 优点                                                        | 代价                                                          |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| 封装 ECharts              | 图表类型齐全，立刻可用                                      | +330KB 依赖；主题是「配置项」而非令牌；与组件库设计语言两张皮 |
| 封装轻量渲染库            | 体积可控                                                    | 图表类型少，复杂图仍需自己写                                  |
| **自研内核（Aura 选择）** | 主题即令牌、体积可控、SVG/Canvas 双渲染、可与组件库同频演进 | 前期投入大，需分期交付                                        |

## 安装

```bash
pnpm add @aura-react-comp/charts
```

图表读取组件库的 CSS 变量，请同时引入两份样式：

```ts
import '@aura-react-comp/ui/style.css';
import '@aura-react-comp/charts/style.css';
```

## 快速上手

```tsx | pure
import { LineChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', orders: 1240, refunds: 280 },
  { month: '2月', orders: 980, refunds: 210 },
];

<LineChart
  data={data}
  xKey="month"
  series={[
    { key: 'orders', name: '订单量' },
    { key: 'refunds', name: '退款量', area: true },
  ]}
/>;
```

<code src="./demo/chart-line.tsx" description="几行配置就能出一张可交互的折线图，主题自动跟随 Aura 令牌。">最小示例</code>

## 组件索引

**基础图表**

| 组件                                      | 用途     | 关键能力                           |
| ----------------------------------------- | -------- | ---------------------------------- |
| [LineChart](/charts/line-chart)           | 趋势     | 四种曲线插值、面积填充、缺失值断线 |
| [BarChart](/charts/bar-chart)             | 分类比较 | 分组 / 堆叠、正负双向、圆角方向    |
| [AreaChart](/charts/area-chart)           | 量的累积 | 堆叠面积、透明度可调               |
| [PieChart](/charts/pie-chart)             | 占比     | 实心 / 环形、引线标签、中心内容    |
| [FunnelChart](/charts/funnel-chart)       | 流程转化 | 按量收缩的梯形、内外标签           |
| [WaterfallChart](/charts/waterfall-chart) | 增减归因 | 增量柱、连接线、汇总项             |

**进阶**

| 组件                                          | 用途       | 关键能力                           |
| --------------------------------------------- | ---------- | ---------------------------------- |
| [ComboChart](/charts/combo-chart)             | 柱线混排   | 逐系列指定 type                    |
| [ScatterChart](/charts/scatter-chart)         | 变量关系   | 数值 x 轴、多标记形状              |
| [RadarChart](/charts/radar-chart)             | 多指标轮廓 | 同心网格、指标满分自定义           |
| [HeatmapChart](/charts/heatmap-chart)         | 二维分布   | 行列矩阵、色阶可换、缺失格区分     |
| [CandlestickChart](/charts/candlestick-chart) | 行情       | 蜡烛 + 均线 + 成交量副图，红涨绿跌 |
| [Chart](/charts/chart)                        | 配置式入口 | ECharts 风格 option、AI 生成友好   |

**层级类**

| 组件                                  | 用途        | 关键能力                  |
| ------------------------------------- | ----------- | ------------------------- |
| [TreemapChart](/charts/treemap-chart) | 占比 + 层级 | squarified 布局、多层展开 |
| [TreeChart](/charts/tree-chart)       | 从属结构    | 横向展开、正交连线        |

**指标类**

| 组件                                  | 用途     | 关键能力                     |
| ------------------------------------- | -------- | ---------------------------- |
| [GaugeChart](/charts/gauge-chart)     | 单值位置 | 240° 弧、分段配色、量程端点  |
| [RingProgress](/charts/ring-progress) | 完成度   | 紧凑环、中心自定义内容       |
| [Sparkline](/charts/sparkline)        | 迷你趋势 | 三种形态、无坐标轴、可嵌表格 |

## 关于体积

包体约 62 kB（brotli），是「16 个图表全量引入」的上限。实际业务按需 import，tree-shaking 后单个图表通常只有 3~6 kB：

```ts
import { LineChart } from '@aura-react-comp/charts'; // 只带走折线图与共用内核
```

内核（坐标、刻度、路径、场景、主题）是共享的，加第二个图表通常只增加 1~2 kB。

## 核心概念

**数据模型**：`data` 是行数组，`xKey` 指定分类字段，`series[].key` 指定数值字段。缺失值用 `null` 表示（不是 `0`）。

**系列配置**：一个 `series` 条目描述一个数据列怎么画。`type` 可逐系列覆盖图表默认类型，因此折柱混合不需要额外组件。

**主题**：运行时读 `--aura-*` 变量，`data-theme` 切换后自动跟随。详见[主题定制](/charts-theme)。

**动画**：入场逐图元错峰生长，数据更新则做值插值（不重播入场）。详见[动画](/charts-animation)。

**渲染器**：默认 SVG（可被读屏器读取、可打印为矢量）；数据点超过 2000 时自动切 Canvas。

**无障碍**：每张图都渲染一份视觉隐藏的数据表，屏幕阅读器能读到真实数值——这是 SVG 图表相对 Canvas 的最大优势，也是切 Canvas 时仍保留数据表的原因。

## 能力边界

写文档最大的价值是**如实说明没做到的部分**，避免使用者在错误预期上做技术选型：

- **地图图表未实现**：涉中国地图必须使用自然资源部标准地图数据源，这是合规红线
- **Canvas 渲染器不支持逐图元命中**：此时 tooltip 按 x 轴索引命中，不区分具体图元
- **暂不支持 dataZoom 与框选联动**：大数据量只能靠采样
- **关系图族**目前只做了层级部分（Treemap / Tree），Sankey / Graph / Chord 尚未实现
- **双轴已支持但请克制**：`yAxisRight` + `series[].yAxisIndex` 可用，使用纪律见[组合图](/charts/combo-chart)
