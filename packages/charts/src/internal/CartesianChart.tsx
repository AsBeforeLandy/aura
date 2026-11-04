import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type {
  AxisConfig,
  BaseChartProps,
  SeriesType,
  TooltipPayload,
} from '../types';
import type { SceneNode } from '../scene/types';
import { SvgScene } from '../scene/svg';
import { paintScene } from '../scene/canvas';
import { createBandScale, createLinearScale, linearTicks } from '../core/scale';
import { computeLayout, suggestTickCount } from '../core/layout';
import { estimateTextWidth, formatNumber } from '../core/format';
import { linePath, roundedRectPath, type CurvePoint } from '../core/shape';
import { withAlpha } from '../theme';
import { useChartTheme } from '../hooks/useChartTheme';
import { useElementSize } from '../hooks/useElementSize';
import { useChartTransition } from '../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../core/animation';
import {
  applyStacking,
  assignDefaultStack,
  buildTooltipItems,
  resolveSeries,
  resolveXValues,
  resolveYDomain,
} from './model';
import { Legend } from '../components/Legend';
import { Tooltip } from '../components/Tooltip';
import '../components/chart.less';

/** Canvas 切换阈值：超过这个图元数量，SVG 的 DOM 开销会明显拖慢滚动 */
const CANVAS_THRESHOLD = 2000;

export interface CartesianChartProps extends BaseChartProps {
  /** 系列默认类型，由各图表组件注入 */
  defaultType: SeriesType;
  /** 是否开启堆叠（等价于给每个系列设置同一个 stack id） */
  stack?: boolean;
}

function CanvasScene({
  nodes,
  width,
  height,
}: {
  nodes: SceneNode[];
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) paintScene(ref.current, nodes, { dpr: undefined });
  }, [nodes, width, height]);

  return (
    <canvas
      ref={ref}
      className={prefixCls('chart__canvas')}
      style={{ width, height }}
      // 无障碍由外层的隐藏数据表承担，canvas 本身对读屏器无意义
      aria-hidden="true"
    />
  );
}

/**
 * 直角坐标系图表内核。
 *
 * 折线 / 柱状 / 面积 / 折柱混合全部由它渲染 —— 差异只在 series.type。
 * 这样组合图（一个系列折线、一个系列柱子）天然支持，无需额外组件。
 */
export function CartesianChart(props: CartesianChartProps) {
  const {
    data = [],
    xKey = 'x',
    series: seriesConfig = [],
    width = '100%',
    height = 320,
    theme: themeInput,
    palette,
    legend = true,
    tooltip = true,
    grid = true,
    animation = true,
    renderer = 'auto',
    xAxis,
    yAxis,
    yAxisRight,
    className,
    style,
    ariaLabel,
    emptyText = '暂无数据',
    onPointClick,
    valueFormatter,
    defaultType,
    stack = false,
  } = props;

  const theme = useChartTheme(themeInput, palette);
  const { ref: plotRef, size } = useElementSize<HTMLDivElement>();
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const hiddenSet = useMemo(() => new Set(hiddenKeys), [hiddenKeys]);

  const xValues = useMemo(() => resolveXValues(data, xKey), [data, xKey]);

  const resolved = useMemo(() => {
    const list = resolveSeries({
      data,
      series: seriesConfig,
      theme,
      defaultType,
      hidden: hiddenSet,
    });
    if (stack) assignDefaultStack(list, true);
    applyStacking(list);
    return list;
  }, [data, seriesConfig, theme, defaultType, hiddenSet, stack]);

  const hasVisibleSeries = resolved.some((item) => item.visible);
  const isEmpty = data.length === 0 || seriesConfig.length === 0;

  /**
   * 右轴配置。
   * 只有「显式开启 yAxisRight」且「确有系列声明了 yAxisIndex: 1」时才真正启用，
   * 否则多留一条空轴只会增加噪声。
   */
  // 用 useMemo 固定引用：它是 scene 的依赖，条件表达式每次渲染都会产出新对象
  const rightConfig = useMemo<AxisConfig | undefined>(
    () => (!yAxisRight ? undefined : yAxisRight === true ? {} : yAxisRight),
    [yAxisRight],
  );
  const hasRightAxis = useMemo(
    () =>
      Boolean(rightConfig) &&
      resolved.some(
        (item) => item.visible && (item.config.yAxisIndex ?? 0) === 1,
      ),
    [rightConfig, resolved],
  );

  // 值域：柱状图必须含 0 基线，折线图允许裁剪
  const yDomain = useMemo(
    () =>
      resolveYDomain(resolved, {
        startFromZero: yAxis?.startFromZero ?? defaultType === 'bar',
        min: yAxis?.min,
        max: yAxis?.max,
        includeBase: resolved.some((item) => Boolean(item.stackId)),
        // 有右轴时，左轴只统计属于左轴的系列
        yAxisIndex: hasRightAxis ? 0 : undefined,
      }),
    [
      resolved,
      yAxis?.startFromZero,
      yAxis?.min,
      yAxis?.max,
      defaultType,
      hasRightAxis,
    ],
  );

  const yDomainRight = useMemo<[number, number]>(
    () =>
      hasRightAxis
        ? resolveYDomain(resolved, {
            startFromZero: rightConfig?.startFromZero ?? false,
            min: rightConfig?.min,
            max: rightConfig?.max,
            yAxisIndex: 1,
          })
        : [0, 1],
    [
      resolved,
      hasRightAxis,
      rightConfig?.startFromZero,
      rightConfig?.min,
      rightConfig?.max,
    ],
  );

  // 刻度数量先按估算高度定，再用它算 margin —— 避免「先算布局再算刻度」的循环依赖
  const estimatedPlotHeight = Math.max(60, height - 48);
  const tickCount = yAxis?.tickCount ?? suggestTickCount(estimatedPlotHeight);
  const yTicks = useMemo(
    () => linearTicks(yDomain[0], yDomain[1], tickCount),
    [yDomain, tickCount],
  );

  const decimals = useMemo(() => {
    if (yTicks.length < 2) return 0;
    const step = Math.abs(yTicks[1] - yTicks[0]);
    if (step === 0) return 0;
    return Math.min(4, Math.max(0, -Math.floor(Math.log10(step))));
  }, [yTicks]);

  const formatValue = useCallback(
    (value: number) =>
      valueFormatter?.(value) ?? formatNumber(value, { decimals }),
    [valueFormatter, decimals],
  );

  const yLabels = useMemo(
    () => yTicks.map((tick) => formatValue(tick)),
    [yTicks, formatValue],
  );

  const yTicksRight = useMemo(
    () =>
      hasRightAxis
        ? linearTicks(yDomainRight[0], yDomainRight[1], tickCount)
        : [],
    [hasRightAxis, yDomainRight, tickCount],
  );

  const rightFormatter = rightConfig?.formatter;
  const yLabelsRight = useMemo(
    () =>
      yTicksRight.map((tick) =>
        rightFormatter
          ? rightFormatter(tick)
          : formatNumber(tick, { decimals }),
      ),
    [yTicksRight, rightFormatter, decimals],
  );

  const layout = useMemo(
    () =>
      computeLayout({
        width: Math.max(size.width, 0),
        height: Math.max(size.height, 0),
        yLabels,
        xLabels: xValues,
        theme,
        showXAxis: xAxis?.show !== false,
        showYAxis: yAxis?.show !== false,
        margin: hasRightAxis
          ? {
              right:
                Math.ceil(
                  Math.max(
                    0,
                    ...yLabelsRight.map((label) =>
                      estimateTextWidth(label, theme.font.size),
                    ),
                  ),
                ) +
                theme.axis.tickSize +
                10,
            }
          : undefined,
      }),
    [
      size.width,
      size.height,
      yLabels,
      xValues,
      theme,
      xAxis?.show,
      yAxis?.show,
      hasRightAxis,
      yLabelsRight,
    ],
  );

  const { plot } = layout;

  const yScale = useMemo(
    () =>
      createLinearScale({
        domain: yDomain,
        range: [plot.y + plot.height, plot.y],
      }),
    [yDomain, plot.y, plot.height],
  );

  const yScaleRight = useMemo(
    () =>
      createLinearScale({
        domain: yDomainRight,
        range: [plot.y + plot.height, plot.y],
      }),
    [yDomainRight, plot.y, plot.height],
  );

  const hasBar = resolved.some((item) => item.visible && item.type === 'bar');

  const xScale = useMemo(
    () =>
      createBandScale({
        domain: xValues,
        range: [plot.x, plot.x + plot.width],
        // 柱子需要更紧的组内间距，纯折线则留更宽的呼吸空间
        paddingInner: hasBar ? 0.26 : 0.42,
        paddingOuter: 0.12,
      }),
    [xValues, plot.x, plot.width, hasBar],
  );

  /** 柱子的槽位分配：堆叠组共用一个槽位，未堆叠的系列各占一个 */
  const barSlots = useMemo(() => {
    const map = new Map<string, number>();
    let count = 0;
    for (const item of resolved) {
      if (!item.visible || item.type !== 'bar') continue;
      const slotId = item.stackId ?? `__solo__${item.key}`;
      if (!map.has(slotId)) {
        map.set(slotId, count);
        count += 1;
      }
    }
    return { count: Math.max(1, count), map };
  }, [resolved]);

  // 动画配置的引用可能每次渲染都变，用序列化值做依赖避免无谓重建
  const animationKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationKey],
  );

  const matrix = useMemo(() => resolved.map((item) => item.top), [resolved]);
  const transition = useChartTransition(matrix, animConfig);
  const progress = transition.progress;

  // 动画原点：绘图区底部。所有图元由此「长」到目标位置
  const animBaseY = plot.y + plot.height;

  const scene = useMemo<SceneNode[]>(() => {
    if (isEmpty || plot.width <= 0 || plot.height <= 0) return [];
    const nodes: SceneNode[] = [];
    /** 位置插值：local=0 贴基线，local=1 到目标位置 */
    const animY = (target: number, local = progress) =>
      animBaseY + (target - animBaseY) * local;

    // ---- 网格线 ----
    if (grid !== false && yAxis?.grid !== false) {
      const dash = theme.grid.dash.join(' ');
      for (const tick of yTicks) {
        const y = yScale.scale(tick);
        nodes.push({
          kind: 'line',
          key: `grid-${tick}`,
          x1: plot.x,
          y1: y,
          x2: plot.x + plot.width,
          y2: y,
          stroke: theme.grid.line,
          strokeWidth: theme.grid.lineWidth,
          strokeDasharray: dash || undefined,
        });
      }
    }

    // ---- 坐标轴 ----
    if (xAxis?.show !== false) {
      nodes.push({
        kind: 'line',
        key: 'x-axis-line',
        x1: plot.x,
        y1: plot.y + plot.height,
        x2: plot.x + plot.width,
        y2: plot.y + plot.height,
        stroke: xAxis?.lineColor ?? theme.axis.line,
        strokeWidth: theme.axis.lineWidth,
      });

      const { interval, rotate, fontSize } = layout.xAxis;
      xValues.forEach((value, index) => {
        if (interval > 0 && index % interval !== 0) return;
        const cx = xScale.center(value);
        if (cx === undefined) return;
        nodes.push({
          kind: 'text',
          key: `x-label-${index}`,
          x: cx,
          y: rotate
            ? plot.y + plot.height + theme.axis.tickSize + fontSize + 2
            : plot.y + plot.height + theme.axis.tickSize + fontSize,
          text: value,
          fill: xAxis?.labelColor ?? theme.axis.label,
          fontSize,
          anchor: rotate ? 'end' : 'middle',
          rotate: rotate || undefined,
          fontFamily: theme.font.family,
        });
      });
    }

    if (yAxis?.show !== false) {
      nodes.push({
        kind: 'line',
        key: 'y-axis-line',
        x1: plot.x,
        y1: plot.y,
        x2: plot.x,
        y2: plot.y + plot.height,
        stroke: yAxis?.lineColor ?? theme.axis.line,
        strokeWidth: theme.axis.lineWidth,
      });

      yTicks.forEach((tick, index) => {
        nodes.push({
          kind: 'text',
          key: `y-label-${index}`,
          x: plot.x - theme.axis.tickSize - 4,
          y: yScale.scale(tick),
          text: yLabels[index],
          fill: yAxis?.labelColor ?? theme.axis.label,
          fontSize: theme.font.size,
          anchor: 'end',
          baseline: 'middle',
          fontFamily: theme.font.family,
        });
      });
    }

    // ---- 右侧第二根 y 轴 ----
    if (hasRightAxis && rightConfig?.show !== false) {
      const axisX = plot.x + plot.width;

      nodes.push({
        kind: 'line',
        key: 'y-axis-right-line',
        x1: axisX,
        y1: plot.y,
        x2: axisX,
        y2: plot.y + plot.height,
        stroke: rightConfig?.lineColor ?? theme.axis.line,
        strokeWidth: theme.axis.lineWidth,
      });

      yTicksRight.forEach((tick, index) => {
        const y = yScaleRight.scale(tick);
        nodes.push({
          kind: 'text',
          key: `y-right-label-${index}`,
          x: axisX + theme.axis.tickSize + 4,
          y,
          text: yLabelsRight[index],
          fill: rightConfig?.labelColor ?? theme.axis.label,
          fontSize: theme.font.size,
          anchor: 'start',
          baseline: 'middle',
          fontFamily: theme.font.family,
        });
      });
    }

    // ---- 数据图元 ----
    const barSlotWidth =
      barSlots.count > 0 ? xScale.bandWidth / barSlots.count : xScale.bandWidth;

    let seriesIndex = -1;
    for (const item of resolved) {
      seriesIndex += 1;
      if (!item.visible) continue;
      // 更新阶段这里是从旧值插值来的当前值；入场阶段即目标值
      const row = transition.values[seriesIndex] ?? item.top;
      // 该系列归属哪根 y 轴（双轴图表里右轴系列用右轴比例尺）
      const yS =
        item.config.yAxisIndex === 1 && hasRightAxis ? yScaleRight : yScale;

      if (item.type === 'bar') {
        const slotId = item.stackId ?? `__solo__${item.key}`;
        const slotIndex = barSlots.map.get(slotId) ?? 0;
        const barWidth = Math.max(
          1,
          Math.min(barSlotWidth * 0.72, item.config.barMaxWidth ?? 48),
        );

        row.forEach((value, index) => {
          if (value === null) return;
          const bandLeft = xScale.scale(xValues[index]);
          if (bandLeft === undefined) return;

          // 错峰：整排柱子从左到右依次生长，而不是同时弹起
          const local = staggerProgress(
            progress,
            index,
            xValues.length,
            animConfig.stagger,
          );
          const base = item.base[index] ?? 0;
          const topY = animY(yS.scale(value), local);
          const baseY = animY(yS.scale(base), local);
          const y = Math.min(topY, baseY);
          const h = Math.max(1, Math.abs(baseY - topY));
          const x =
            bandLeft + barSlotWidth * slotIndex + (barSlotWidth - barWidth) / 2;

          // 圆角只加在「远离基线」的那一端，贴基线的一端保持直角
          const isPositive = value >= base;
          const radius =
            item.config.barMaxWidth === 0 ? 0 : theme.series.barRadius;

          nodes.push({
            kind: 'path',
            key: `bar-${item.key}-${index}`,
            d: roundedRectPath(
              x,
              y,
              barWidth,
              h,
              radius,
              isPositive
                ? { tl: true, tr: true, bl: false, br: false }
                : { tl: false, tr: false, bl: true, br: true },
            ),
            fill: item.color,
            opacity: activeIndex === null || activeIndex === index ? 1 : 0.55,
            pointerEvents: 'none',
          });
        });
        continue;
      }

      if (item.type === 'scatter') {
        row.forEach((value, index) => {
          if (value === null) return;
          const cx = xScale.center(xValues[index]);
          if (cx === undefined) return;
          const local = staggerProgress(
            progress,
            index,
            xValues.length,
            animConfig.stagger,
          );
          nodes.push({
            kind: 'circle',
            key: `dot-${item.key}-${index}`,
            cx,
            cy: animY(yS.scale(value), local),
            r:
              activeIndex === index
                ? theme.series.symbolSize * 0.75
                : theme.series.symbolSize * 0.55,
            fill: item.color,
            opacity: activeIndex === null || activeIndex === index ? 0.9 : 0.4,
            pointerEvents: 'none',
          });
        });
        continue;
      }

      // line / area
      const points: CurvePoint[] = row.map((value, index) => {
        if (value === null) return null;
        const cx = xScale.center(xValues[index]);
        if (cx === undefined) return null;
        // 逐点错峰：线条像被画笔从左往右扫出来，而不是整条同时抬起
        const local = staggerProgress(
          progress,
          index,
          xValues.length,
          animConfig.stagger,
        );
        return { x: cx, y: animY(yS.scale(value), local) };
      });

      const curve = item.config.curve ?? 'monotone';
      const wantArea = item.type === 'area' || item.config.area === true;

      if (wantArea) {
        const baselineY = yS.scale(
          Math.max(
            (item.config.yAxisIndex === 1 ? yDomainRight : yDomain)[0],
            0,
          ),
        );
        const safeBaseline = Math.min(
          Math.max(baselineY, plot.y),
          plot.y + plot.height,
        );
        nodes.push({
          kind: 'path',
          key: `area-${item.key}`,
          d: areaPathOf(points, safeBaseline, curve),
          fill: withAlpha(
            item.color,
            item.config.areaOpacity ?? theme.series.areaOpacity,
          ),
          pointerEvents: 'none',
        });
      }

      nodes.push({
        kind: 'path',
        key: `line-${item.key}`,
        d: linePath(points, curve),
        fill: 'none',
        stroke: item.color,
        strokeWidth: theme.series.lineWidth,
        linecap: 'round',
        linejoin: 'round',
        opacity: activeIndex === null ? 1 : 0.9,
        pointerEvents: 'none',
      });

      // 数据点：默认在点数不多时显示，避免密集折线变成「毛毛虫」
      const showSymbol = item.config.showSymbol ?? xValues.length <= 24;
      if (showSymbol) {
        row.forEach((value, index) => {
          if (value === null) return;
          const cx = xScale.center(xValues[index]);
          if (cx === undefined) return;
          const active = activeIndex === index;
          const local = staggerProgress(
            progress,
            index,
            xValues.length,
            animConfig.stagger,
          );
          nodes.push({
            kind: 'circle',
            key: `symbol-${item.key}-${index}`,
            cx,
            cy: animY(yS.scale(value), local),
            r: active
              ? theme.series.symbolSize * 0.85
              : theme.series.symbolSize * 0.55,
            fill: theme.tooltip.background,
            stroke: item.color,
            strokeWidth: active ? theme.series.emphasisWidth : 2,
            pointerEvents: 'none',
          });
        });
      }
    }

    // ---- 高亮指示线 ----
    if (activeIndex !== null) {
      const cx = xScale.center(xValues[activeIndex]);
      if (cx !== undefined) {
        nodes.push({
          kind: 'line',
          key: 'indicator',
          x1: cx,
          y1: plot.y,
          x2: cx,
          y2: plot.y + plot.height,
          stroke: theme.axis.line,
          strokeWidth: 1,
          strokeDasharray: '3 3',
          pointerEvents: 'none',
        });
      }
    }

    return nodes;
  }, [
    isEmpty,
    plot,
    yTicks,
    yLabels,
    yScale,
    xScale,
    xValues,
    resolved,
    theme,
    grid,
    xAxis,
    yAxis,
    layout.xAxis,
    activeIndex,
    barSlots,
    animBaseY,
    progress,
    transition.values,
    animConfig.stagger,
    yDomain,
    yDomainRight,
    yScaleRight,
    hasRightAxis,
    yTicksRight,
    yLabelsRight,
    rightConfig,
  ]);

  // ---- 交互 ----
  const indexFromClientX = useCallback(
    (clientX: number): number | null => {
      const element = plotRef.current;
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const localX = clientX - rect.left;
      if (localX < plot.x - 8 || localX > plot.x + plot.width + 8) return null;

      let nearest: number | null = null;
      let minDistance = Infinity;
      xValues.forEach((value, index) => {
        const cx = xScale.center(value);
        if (cx === undefined) return;
        const distance = Math.abs(cx - localX);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = index;
        }
      });
      return nearest;
    },
    [plotRef, plot.x, plot.width, xValues, xScale],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (tooltip === false || isEmpty) return;
      setActiveIndex(indexFromClientX(event.clientX));
    },
    [tooltip, isEmpty, indexFromClientX],
  );

  const handlePointerLeave = useCallback(() => setActiveIndex(null), []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!onPointClick) return;
      const index = indexFromClientX(event.clientX);
      if (index === null) return;
      const payload = buildTooltipItems(resolved, index);
      const label = xValues[index] ?? '';
      if (payload.length === 0) return;
      onPointClick({
        label,
        row: data[index] ?? null,
        series: payload,
        seriesKey: payload[0].key,
      });
    },
    [onPointClick, indexFromClientX, resolved, xValues, data],
  );

  const tooltipPayload: TooltipPayload | null = useMemo(() => {
    if (activeIndex === null || !hasVisibleSeries) return null;
    return {
      label: xValues[activeIndex] ?? '',
      row: data[activeIndex] ?? null,
      series: buildTooltipItems(resolved, activeIndex),
    };
  }, [activeIndex, hasVisibleSeries, xValues, data, resolved]);

  const tooltipPosition = useMemo(() => {
    if (activeIndex === null) return { x: 0, y: 0 };
    const cx = xScale.center(xValues[activeIndex]) ?? plot.x;
    let top = plot.y + plot.height;
    for (const item of resolved) {
      if (!item.visible) continue;
      const value = item.top[activeIndex];
      if (value === null || value === undefined) continue;
      const yScaleOfItem =
        item.config.yAxisIndex === 1 && hasRightAxis ? yScaleRight : yScale;
      top = Math.min(top, yScaleOfItem.scale(value));
    }
    return { x: cx, y: Math.max(top, plot.y + 8) };
  }, [
    activeIndex,
    xScale,
    xValues,
    plot,
    resolved,
    yScale,
    yScaleRight,
    hasRightAxis,
  ]);

  const totalPoints = resolved.reduce(
    (sum, item) => sum + item.values.length,
    0,
  );
  const useCanvas =
    renderer === 'canvas' ||
    (renderer === 'auto' && totalPoints > CANVAS_THRESHOLD);

  const legendItems = resolved.map((item) => ({
    key: item.key,
    name: item.name,
    color: item.color,
    visible: item.visible,
  }));

  const toggleSeries = useCallback((key: string) => {
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }, []);

  const autoAriaLabel =
    ariaLabel ??
    `图表：${seriesConfig.map((item) => item.name ?? item.key).join('、') || '数据'}`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="cartesian"
    >
      <Legend
        items={legendItems}
        theme={theme}
        config={legend}
        onToggle={toggleSeries}
      />

      <div
        ref={plotRef}
        className={prefixCls('chart__plot')}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        {isEmpty || !hasVisibleSeries ? (
          <div className={prefixCls('chart__empty')}>{emptyText}</div>
        ) : size.width > 0 && size.height > 0 ? (
          useCanvas ? (
            <CanvasScene
              nodes={scene}
              width={size.width}
              height={size.height}
            />
          ) : (
            <SvgScene
              nodes={scene}
              width={size.width}
              height={size.height}
              ariaLabel={autoAriaLabel}
            />
          )
        ) : null}

        <Tooltip
          payload={tooltipPayload}
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          containerWidth={size.width}
          theme={theme}
          config={tooltip}
        />
      </div>

      {/* 无障碍数据表：读屏器与 SEO 到此读取真实数值 */}
      <table className={prefixCls('chart__a11y-table')}>
        <caption>{autoAriaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">{xKey}</th>
            {resolved.map((item) => (
              <th key={item.key} scope="col">
                {item.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th scope="row">{xValues[rowIndex]}</th>
              {resolved.map((item) => (
                <td key={item.key}>{item.values[rowIndex] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 面积填充路径（支持 null 断点），与 linePath 保持同步的分段逻辑 */
function areaPathOf(
  points: readonly CurvePoint[],
  baseline: number,
  curve: Parameters<typeof linePath>[1],
): string {
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (const point of points) {
    if (point) current.push(point);
    else if (current.length) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length) segments.push(current);

  return segments
    .map((segment) => {
      if (!segment.length) return '';
      const top = linePath(segment, curve);
      const last = segment[segment.length - 1];
      const first = segment[0];
      return `${top}L${last.x},${baseline}L${first.x},${baseline}Z`;
    })
    .filter(Boolean)
    .join('');
}
