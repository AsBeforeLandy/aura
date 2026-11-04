/**
 * @aura-react-comp/charts
 *
 * 自研图表库：SVG / Canvas 双渲染内核 + 令牌驱动主题。
 *
 * 分层导出：
 *   · 图表组件（LineChart / BarChart / ...）—— 日常使用
 *   · 配置式 <Chart option> —— 迁移 ECharts 或让 AI 生成
 *   · 主题工具（createChartTheme / readAuraTheme）—— 深度定制
 *   · 内核（scale / shape）—— 自建图表时的乐高积木
 */

// 图表组件
export { LineChart } from './charts/line-chart';
export type { LineChartProps } from './charts/line-chart';
export { BarChart } from './charts/bar-chart';
export type { BarChartProps } from './charts/bar-chart';
export { AreaChart } from './charts/area-chart';
export type { AreaChartProps } from './charts/area-chart';
export { ComboChart } from './charts/combo-chart';
export type { ComboChartProps } from './charts/combo-chart';
export { ScatterChart } from './charts/scatter-chart';
export type { ScatterChartProps } from './charts/scatter-chart';
export { PieChart } from './charts/pie-chart';
export type { PieChartProps, PieDataItem } from './charts/pie-chart';

export { RadarChart } from './charts/radar-chart';
export type {
  RadarChartProps,
  RadarIndicator,
  RadarSeries,
} from './charts/radar-chart';
export { GaugeChart } from './charts/gauge-chart';
export type { GaugeChartProps, GaugeRange } from './charts/gauge-chart';
export { FunnelChart } from './charts/funnel-chart';
export type { FunnelChartProps, FunnelDataItem } from './charts/funnel-chart';
export { RingProgress } from './charts/ring-progress';
export type { RingProgressProps } from './charts/ring-progress';
export { WaterfallChart } from './charts/waterfall-chart';
export type {
  WaterfallChartProps,
  WaterfallItem,
} from './charts/waterfall-chart';
export { Sparkline } from './charts/sparkline';
export type { SparklineProps } from './charts/sparkline';
export { HeatmapChart } from './charts/heatmap-chart';
export type { HeatmapChartProps, HeatmapCell } from './charts/heatmap-chart';
export { CandlestickChart } from './charts/candlestick-chart';
export type {
  CandlestickChartProps,
  CandlestickItem,
} from './charts/candlestick-chart';
export { TreemapChart } from './charts/treemap-chart';
export type { TreemapChartProps } from './charts/treemap-chart';
export { TreeChart } from './charts/tree-chart';
export type { TreeChartProps } from './charts/tree-chart';

// 配置式入口
export { Chart } from './components/chart';
export type {
  ChartProps,
  ChartOption,
  ChartOptionSeries,
} from './components/chart';

// 通用类型
export type {
  BaseChartProps,
  ChartDataRow,
  SeriesConfig,
  SeriesType,
  AxisConfig,
  LegendConfig,
  TooltipConfig,
  TooltipPayload,
  TooltipSeriesItem,
  ChartRenderer,
  ChartAnimationInput,
} from './types';

// 主题
export {
  createChartTheme,
  readAuraTheme,
  resolveTheme,
  detectDarkMode,
  colorAt,
  withAlpha,
  mixColor,
  parseColor,
  lightTheme,
  darkTheme,
  DEFAULT_PALETTE,
} from './theme';
export type {
  ChartTheme,
  ChartThemeInput,
  ChartThemeOptions,
  DeepPartial,
} from './theme';

// 内核（供自建图表复用）
export {
  createBandScale,
  createPointScale,
  createLinearScale,
  linearTicks,
  niceStep,
  niceExtent,
  extentOf,
  extentWithZero,
} from './core/scale';
export type { BandScale, PointScale, LinearScale, Extent } from './core/scale';
export {
  linePath,
  areaPath,
  arcLinePath,
  arcPath,
  roundedRectPath,
  symbolPath,
  splitSegments,
} from './core/shape';
export type { CurveType, CurvePoint, Point, SymbolType } from './core/shape';
export {
  formatNumber,
  formatCompact,
  formatPercent,
  estimateTextWidth,
} from './core/format';
export {
  squarify,
  buildTreemap,
  layoutTree,
  sumValues,
} from './core/hierarchy';
export type {
  HierarchyNode,
  TreemapCell,
  TreeLayoutNode,
} from './core/hierarchy';
