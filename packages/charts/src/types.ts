import type { CurveType } from './core/shape';
import type { ChartAnimationOptions } from './core/animation';
import type { ChartThemeInput } from './theme';

/** 一行数据。数值列允许 null，表示缺失（折线断开、柱子不画） */
export type ChartDataRow = Record<string, string | number | null | undefined>;

export type SeriesType = 'line' | 'bar' | 'area' | 'scatter';

/** 系列配置 */
export interface SeriesConfig {
  /** 对应 data 中的字段名 */
  key: string;
  /** 图例与 tooltip 中展示的名字，缺省取 key */
  name?: string;
  /** 指定颜色；不填按主题色板顺序取色 */
  color?: string;
  /**
   * 系列类型。
   * 单个系列可覆盖图表默认类型，因此折柱混合图无需额外组件。
   */
  type?: SeriesType;
  /** 独立数据：不从 data 取，直接给定数组（散点/外部计算场景） */
  data?: (number | null)[];
  /** 堆叠分组 id；同一 id 的系列累加显示 */
  stack?: string;
  /** 曲线插值方式，仅 line / area 生效 */
  curve?: CurveType;
  /** 是否显示数据点标记 */
  showSymbol?: boolean;
  /** 柱子最大宽度，避免少数据时柱子过胖 */
  barMaxWidth?: number;
  /** 是否在系列内部启用堆叠（等价于 stack: '__default__'） */
  hidden?: boolean;
  /** 数值格式化，用于 tooltip / 标签 */
  valueFormatter?: (value: number) => string;
  /** 折线是否带面积填充（仅 line 类型生效） */
  area?: boolean;
  /** 面积填充不透明度覆盖 */
  areaOpacity?: number;
  /**
   * 使用哪根 y 轴：0 为左轴（默认），1 为右轴。
   * 只有图表启用了 `yAxisRight` 时，1 才生效。
   */
  yAxisIndex?: 0 | 1;
}

/** 坐标轴配置 */
export interface AxisConfig {
  /** 轴标题 */
  title?: string;
  /** 是否显示 */
  show?: boolean;
  /** 数值轴：是否从 0 开始（柱状图默认 true） */
  startFromZero?: boolean;
  /** 数值轴：强制最小值 / 最大值 */
  min?: number;
  max?: number;
  /** 刻度数量 */
  tickCount?: number;
  /** 刻度标签格式化 */
  formatter?: (value: number) => string;
  /** 是否画网格线 */
  grid?: boolean;
  /** 轴线颜色覆盖 */
  lineColor?: string;
  /** 标签颜色覆盖 */
  labelColor?: string;
}

export interface LegendConfig {
  show?: boolean;
  /** 位置，默认 top */
  position?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
}

export interface TooltipConfig {
  show?: boolean;
  /** axis：按 x 轴索引聚合所有系列；item：只显示当前图元 */
  trigger?: 'axis' | 'item';
  /** 数值格式化 */
  formatter?: (payload: TooltipPayload) => string | null;
}

export interface TooltipSeriesItem {
  key: string;
  name: string;
  color: string;
  value: number | null;
  formatted: string;
}

export interface TooltipPayload {
  /** x 轴分类值（数值散点则为 x 值） */
  label: string;
  /** 该位置的行数据 */
  row: ChartDataRow | null;
  series: TooltipSeriesItem[];
}

export type ChartRenderer = 'svg' | 'canvas' | 'auto';

/**
 * 动画配置。
 * true / false 沿用原来的开关语义；传对象可细调时长、缓动与错峰。
 */
export type ChartAnimationInput = boolean | ChartAnimationOptions;

/** 所有图表共享的 props */
/** 底部缩略轴（dataZoom）配置 */
export interface DataZoomOptions {
  /** 是否显示缩略轴，默认 true */
  show?: boolean;
  /** 缩略轴高度（像素） */
  height?: number;
}

export interface BaseChartProps {
  data?: ChartDataRow[];
  /** 作为 x 轴的字段名 */
  xKey?: string;
  series?: SeriesConfig[];
  /** 容器宽度，默认 100% 自适应 */
  width?: number | string;
  /** 高度，默认 320 */
  height?: number;
  /** 主题：内置名 / 完整主题对象 / 局部覆盖 */
  theme?: ChartThemeInput;
  /** 快捷替换色板 */
  palette?: string[];
  legend?: boolean | LegendConfig;
  tooltip?: boolean | TooltipConfig;
  /** 是否显示网格线，默认 true */
  grid?: boolean;
  /** 入场动画。传对象可配置时长 / 缓动 / 错峰 */
  animation?: ChartAnimationInput;
  /**
   * 底部缩略轴。开启后可拖动窗口只看局部区间，
   * 数据量大时配合 sampling 使用。
   */
  dataZoom?: boolean | DataZoomOptions;
  /** 非受控的初始窗口 [起, 止]，取值 0~1 */
  defaultZoom?: [number, number];
  /** 受控窗口 [起, 止]，取值 0~1 */
  zoom?: [number, number];
  /** 窗口变化回调 */
  onZoomChange?: (range: [number, number]) => void;
  /**
   * 单系列最大点数。超过后按 LTTB 保形降采样；
   * 传 false 关闭（数据量很大时建议保持开启）。
   */
  sampling?: number | false;
  /** 渲染器。auto 会在大量数据点时自动切 Canvas */
  renderer?: ChartRenderer;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  /**
   * 右侧第二根数值轴。
   * 传 true 使用默认配置；传对象可单独设置量程、标题与格式化。
   *
   * 使用建议：双轴只在「两套数据量纲差一个数量级以上、又必须放在一张图里对照」时使用，
   * 且务必给两根轴都写标题——否则读者无法判断某条线读的是哪根轴。
   */
  yAxisRight?: boolean | AxisConfig;
  className?: string;
  style?: React.CSSProperties;
  /** 无障碍描述，缺省自动拼接 */
  ariaLabel?: string;
  /** 空数据时的占位文案 */
  emptyText?: string;
  /** 点击数据点/柱子 */
  onPointClick?: (payload: TooltipPayload & { seriesKey: string }) => void;
  /** 数值格式化（tooltip 与坐标轴默认共用） */
  valueFormatter?: (value: number) => string;
}
