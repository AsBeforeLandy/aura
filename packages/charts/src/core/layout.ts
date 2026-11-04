import { estimateTextWidth } from './format';
import type { ChartTheme } from '../theme';

/**
 * 布局计算：把「容器尺寸」换算成「绘图区」。
 *
 * 难点在于坐标轴文字会占用边缘空间，而可用的边缘空间又取决于容器大小 ——
 * 这里采用业界通行的两遍法：
 *   第一遍用完整容器高度估算刻度数量 → 得到刻度标签；
 *   第二遍按标签实际宽度（估算）反推 margin。
 * 两遍都是纯计算，不触碰 DOM，因此可在 SSR 与测试中直接跑。
 */

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** x 轴标签的排布方式 */
export type LabelLayout = 'horizontal' | 'rotate' | 'hide';

export interface XAxisLayout {
  layout: LabelLayout;
  /** 旋转角度（负值为逆时针） */
  rotate: number;
  /** 字号 */
  fontSize: number;
  /** 该轴需要占用的底部空间 */
  height: number;
  /** 每隔几个标签显示一个，0 表示全部显示 */
  interval: number;
}

export interface ComputeLayoutInput {
  width: number;
  height: number;
  /** y 轴刻度标签文本 */
  yLabels: string[];
  /** x 轴刻度标签文本 */
  xLabels: string[];
  theme: ChartTheme;
  /** 是否显示 x 轴，false 时不预留底部空间 */
  showXAxis?: boolean;
  showYAxis?: boolean;
  /** 用户强制指定的 margin 覆盖项 */
  margin?: Partial<Margin>;
}

export interface LayoutResult {
  plot: PlotArea;
  margin: Margin;
  xAxis: XAxisLayout;
}

const AXIS_GAP = 8;

/**
 * 计算 x 轴标签布局。
 *
 * 判定顺序：
 *   1. 全部横排放得下 → horizontal
 *   2. 斜排 35° 放得下  → rotate
 *   3. 都不行 → 抽样显示（interval），强制横排，避免出现密集的"斜线森林"
 */
export function computeXAxisLayout(
  labels: readonly string[],
  availableWidth: number,
  theme: ChartTheme,
): XAxisLayout {
  const fontSize = theme.font.size;
  const count = labels.length;
  if (count === 0) {
    return {
      layout: 'horizontal',
      rotate: 0,
      fontSize,
      height: 0,
      interval: 0,
    };
  }

  const widths = labels.map((label) => estimateTextWidth(label, fontSize));
  const maxWidth = Math.max(...widths);
  const slot = availableWidth / count;

  if (maxWidth + 12 <= slot) {
    return {
      layout: 'horizontal',
      rotate: 0,
      fontSize,
      height: fontSize + AXIS_GAP,
      interval: 0,
    };
  }

  const rotate = -35;
  const rad = (Math.abs(rotate) * Math.PI) / 180;
  const rotatedWidth = maxWidth * Math.cos(rad) + fontSize * Math.sin(rad);
  if (rotatedWidth + 4 <= slot) {
    const height =
      Math.ceil(maxWidth * Math.sin(rad) + fontSize * Math.cos(rad)) + AXIS_GAP;
    return {
      layout: 'rotate',
      rotate,
      fontSize,
      height: Math.min(height, 72),
      interval: 0,
    };
  }

  // 抽样：至少保证标签间距不小于 1.6 个字符宽
  const interval = Math.max(
    1,
    Math.ceil(
      count / Math.max(1, Math.floor(availableWidth / (maxWidth + 12))),
    ),
  );
  return {
    layout: 'horizontal',
    rotate: 0,
    fontSize,
    height: fontSize + AXIS_GAP,
    interval,
  };
}

export function computeLayout(input: ComputeLayoutInput): LayoutResult {
  const {
    width,
    height,
    yLabels,
    xLabels,
    theme,
    showXAxis = true,
    showYAxis = true,
  } = input;

  const maxYLabelWidth = yLabels.length
    ? Math.max(
        ...yLabels.map((label) => estimateTextWidth(label, theme.font.size)),
      )
    : 0;

  const left = showYAxis
    ? Math.ceil(maxYLabelWidth + theme.axis.tickSize + AXIS_GAP)
    : 12;
  const right = 16;

  // 第一遍：先按横向标签预留底部空间，得出可用宽度
  const provisionalPlotWidth = Math.max(0, width - left - right);
  const xAxis = showXAxis
    ? computeXAxisLayout(xLabels, provisionalPlotWidth, theme)
    : {
        layout: 'horizontal' as LabelLayout,
        rotate: 0,
        fontSize: theme.font.size,
        height: 0,
        interval: 0,
      };

  const bottom = showXAxis ? xAxis.height + 4 : 12;
  const top = 12;

  const margin: Margin = {
    top: input.margin?.top ?? top,
    right: input.margin?.right ?? right,
    bottom: input.margin?.bottom ?? bottom,
    left: input.margin?.left ?? left,
  };

  const plot: PlotArea = {
    x: margin.left,
    y: margin.top,
    width: Math.max(0, width - margin.left - margin.right),
    height: Math.max(0, height - margin.top - margin.bottom),
  };

  return { plot, margin, xAxis };
}

/** 数值轴刻度数量的经验值：约每 44px 一个刻度，限制在 3~8 之间 */
export function suggestTickCount(plotHeight: number): number {
  return Math.min(8, Math.max(3, Math.round(plotHeight / 44)));
}
