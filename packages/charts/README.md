# @aura-react-comp/charts

Aura 图表库：18 个图表组件，自研 SVG / Canvas 双渲染内核，不依赖任何第三方图表引擎。

## 安装

```bash
pnpm add @aura-react-comp/charts
```

`react` / `react-dom` 为 peerDependencies，需由使用方提供（>=18）。

## 使用

```tsx
import { LineChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', orders: 1240 },
  { month: '2月', orders: 1560 },
  { month: '3月', orders: 1890 },
];

const App = () => (
  <LineChart
    data={data}
    xKey="month"
    series={[{ key: 'orders', name: '订单量' }]}
    height={320}
  />
);
```

样式随入口自动引入，无需单独 `import`。源码路径（`@aura-react-comp/charts/src/...`）不可用 —— 发布包只包含 `esm/` 产物。

## 组件总览（18 个）

| 分类       | 组件                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| **基础**   | LineChart、BarChart、AreaChart、PieChart、FunnelChart、WaterfallChart                                              |
| **进阶**   | ComboChart（折柱混合 + 双 Y 轴）、ScatterChart、RadarChart、HeatmapChart、CandlestickChart（K 线 + 均线 + 成交量） |
| **层级**   | TreemapChart（矩形树图）、TreeChart（树图）                                                                        |
| **关系**   | SankeyChart（桑基图）、GraphChart（力导向关系图）                                                                  |
| **指标**   | GaugeChart、RingProgress、Sparkline                                                                                |
| **配置式** | Chart（用一份 option 描述整张图）                                                                                  |

## 关键能力

**双渲染内核**：默认 SVG（可被读屏器读取、可打印为矢量），图元超过 2000 时自动切 Canvas。两种渲染器消费同一份场景数据，因此视觉与动效完全一致。

**主题**：运行时读取 `--aura-*` CSS 变量，`data-theme` 切换后自动跟随，无需重渲染。

**动画**：入场阶段逐图元错峰生长，数据更新走值插值——改一个数字不会让整张图重播。命中 `prefers-reduced-motion` 时自动跳过。

```tsx
<LineChart
  animation={{ duration: 620, easing: 'easeOutQuint', stagger: 0.35 }}
/>
```

**双 Y 轴**：量纲差一个数量级以上时使用，两根轴都要写标题。

```tsx
<ComboChart
  yAxisRight={{ formatter: (v) => `${v}%` }}
  series={[
    { key: 'revenue', name: '营收', type: 'bar' },
    { key: 'rate', name: '增长率', type: 'line', yAxisIndex: 1 },
  ]}
/>
```

**大数据**：默认按 LTTB 保形降采样到 800 点（保住尖峰），并支持底部缩略轴缩放。

```tsx
<LineChart data={bigData} dataZoom sampling={800} />
```

**无障碍**：每张图都渲染一份视觉隐藏的数据表，屏幕阅读器能读到真实数值。

## 体积

全量引入约 78 kB（brotli，18 个图表 + 内核）。按需 import 时 tree-shaking 后单个图表通常 3~6 kB，内核是共享的。

## 文档

完整文档与可运行示例：https://asbeforelandy.github.io/aura/charts

## 许可证

MIT
