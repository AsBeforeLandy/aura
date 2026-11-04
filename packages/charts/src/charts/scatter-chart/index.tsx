import React, { useCallback, useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { ChartDataRow, SeriesConfig, TooltipPayload } from '../../types';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { createLinearScale, extentOf, linearTicks } from '../../core/scale';
import { computeLayout, suggestTickCount } from '../../core/layout';
import { formatNumber } from '../../core/format';
import { symbolPath } from '../../core/shape';
import { colorAt, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Legend } from '../../components/Legend';
import { Tooltip } from '../../components/Tooltip';
import type { LegendConfig, TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface ScatterChartProps {
  data?: ChartDataRow[];
  /** 数值型 x 字段 */
  xKey?: string;
  series?: SeriesConfig[];
  width?: number | string;
  height?: number;
  theme?: ChartThemeInput;
  palette?: string[];
  legend?: boolean | LegendConfig;
  tooltip?: boolean | TooltipConfig;
  /** 点形状 */
  symbol?: 'circle' | 'square' | 'diamond' | 'triangle' | 'star' | 'cross';
  /** 点大小 */
  symbolSize?: number;
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  emptyText?: string;
}

interface ScatterPoint {
  seriesKey: string;
  seriesName: string;
  color: string;
  x: number;
  y: number;
  xIndex: number;
}

/**
 * 散点图。
 *
 * 与折线/柱状不同，散点的 x 是**连续的数值轴**而非分类轴：
 * 分类轴会把 [1, 2, 100] 摆成等间距，严重扭曲相关性判断。
 * 因此这里不复用 CartesianChart 的 band 坐标，改为线性 x 轴。
 */
export function ScatterChart({
  data = [],
  xKey = 'x',
  series = [],
  width = '100%',
  height = 320,
  theme: themeInput,
  palette,
  legend = true,
  tooltip = true,
  symbol = 'circle',
  symbolSize = 8,
  animation = true,
  className,
  style,
  ariaLabel,
  emptyText = '暂无数据',
}: ScatterChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const xValues = useMemo(
    () =>
      data.map((row) => {
        const raw = row[xKey];
        const num = typeof raw === 'number' ? raw : Number(raw);
        return Number.isFinite(num) ? num : null;
      }),
    [data, xKey],
  );

  const seriesList = useMemo(
    () =>
      series.map((config, index) => ({
        config,
        key: config.key,
        name: config.name ?? config.key,
        color: config.color ?? colorAt(theme, index),
        values: data.map((row, rowIndex) => {
          const raw = config.data ? config.data[rowIndex] : row[config.key];
          const num = typeof raw === 'number' ? raw : Number(raw);
          return Number.isFinite(num) ? num : null;
        }),
        visible: !config.hidden && !hiddenKeys.includes(config.key),
      })),
    [series, data, theme, hiddenKeys],
  );

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  // 每个系列一行数值，更新时在旧值之间插值
  const valueMatrix = useMemo(
    () => seriesList.map((item) => item.values),
    [seriesList],
  );
  const transition = useChartTransition(valueMatrix, animConfig);
  const progress = transition.progress;

  const points = useMemo<ScatterPoint[]>(() => {
    const list: ScatterPoint[] = [];
    let seriesIndex = -1;
    for (const item of seriesList) {
      seriesIndex += 1;
      if (!item.visible) continue;
      const row = transition.values[seriesIndex] ?? item.values;
      row.forEach((value, index) => {
        const x = xValues[index];
        if (value === null || x === null || x === undefined) return;
        list.push({
          seriesKey: item.key,
          seriesName: item.name,
          color: item.color,
          x,
          y: value,
          xIndex: index,
        });
      });
    }
    return list;
  }, [seriesList, xValues, transition.values]);

  const xDomain = useMemo<[number, number]>(() => {
    const [min, max] = extentOf(xValues);
    if (min === max) return [min - 1, max + 1];
    // 两端留 4% 余量，避免点被裁在轴线上
    const pad = (max - min) * 0.04;
    return [min - pad, max + pad];
  }, [xValues]);

  const yDomain = useMemo<[number, number]>(() => {
    const [min, max] = extentOf(points.map((point) => point.y));
    if (min === max) return [min - 1, max + 1];
    const pad = (max - min) * 0.08;
    return [min - pad, max + pad];
  }, [points]);

  const estimatedPlotHeight = Math.max(60, height - 48);
  const tickCount = suggestTickCount(estimatedPlotHeight);
  const yTicks = useMemo(
    () => linearTicks(yDomain[0], yDomain[1], tickCount),
    [yDomain, tickCount],
  );
  const xTicks = useMemo(
    () => linearTicks(xDomain[0], xDomain[1], Math.round(tickCount * 1.3)),
    [xDomain, tickCount],
  );

  const yLabels = useMemo(
    () => yTicks.map((tick) => formatNumber(tick)),
    [yTicks],
  );
  const xLabels = useMemo(
    () => xTicks.map((tick) => formatNumber(tick)),
    [xTicks],
  );

  const layout = useMemo(
    () =>
      computeLayout({
        width: Math.max(size.width, 0),
        height: Math.max(size.height, 0),
        yLabels,
        xLabels,
        theme,
      }),
    [size.width, size.height, yLabels, xLabels, theme],
  );

  const { plot } = layout;

  const xScale = useMemo(
    () =>
      createLinearScale({
        domain: xDomain,
        range: [plot.x, plot.x + plot.width],
      }),
    [xDomain, plot.x, plot.width],
  );

  const yScale = useMemo(
    () =>
      createLinearScale({
        domain: yDomain,
        range: [plot.y + plot.height, plot.y],
      }),
    [yDomain, plot.y, plot.height],
  );

  const animBaseY = plot.y + plot.height;

  const scene = useMemo<SceneNode[]>(() => {
    if (plot.width <= 0 || plot.height <= 0) return [];
    const nodes: SceneNode[] = [];

    for (const tick of yTicks) {
      nodes.push({
        kind: 'line',
        key: `gy-${tick}`,
        x1: plot.x,
        y1: yScale.scale(tick),
        x2: plot.x + plot.width,
        y2: yScale.scale(tick),
        stroke: theme.grid.line,
        strokeWidth: theme.grid.lineWidth,
        strokeDasharray: theme.grid.dash.join(' ') || undefined,
      });
    }

    yTicks.forEach((tick, index) => {
      nodes.push({
        kind: 'text',
        key: `yl-${index}`,
        x: plot.x - theme.axis.tickSize - 4,
        y: yScale.scale(tick),
        text: yLabels[index],
        fill: theme.axis.label,
        fontSize: theme.font.size,
        anchor: 'end',
        baseline: 'middle',
        fontFamily: theme.font.family,
      });
    });

    xTicks.forEach((tick, index) => {
      const x = xScale.scale(tick);
      if (x < plot.x - 1 || x > plot.x + plot.width + 1) return;
      nodes.push({
        kind: 'text',
        key: `xl-${index}`,
        x,
        y: plot.y + plot.height + theme.axis.tickSize + theme.font.size,
        text: xLabels[index],
        fill: theme.axis.label,
        fontSize: theme.font.size,
        anchor: 'middle',
        fontFamily: theme.font.family,
      });
    });

    nodes.push({
      kind: 'line',
      key: 'x-axis',
      x1: plot.x,
      y1: plot.y + plot.height,
      x2: plot.x + plot.width,
      y2: plot.y + plot.height,
      stroke: theme.axis.line,
      strokeWidth: theme.axis.lineWidth,
    });
    nodes.push({
      kind: 'line',
      key: 'y-axis',
      x1: plot.x,
      y1: plot.y,
      x2: plot.x,
      y2: plot.y + plot.height,
      stroke: theme.axis.line,
      strokeWidth: theme.axis.lineWidth,
    });

    points.forEach((point, pointIndex) => {
      const cx = xScale.scale(point.x);
      const targetY = yScale.scale(point.y);
      // 逐点错峰 + 透明度淡入，避免整片点同时「砸」在基线上
      const local = staggerProgress(
        progress,
        pointIndex,
        points.length,
        animConfig.stagger,
      );
      const cy = animBaseY + (targetY - animBaseY) * local;
      const isActive = activeKey === `${point.seriesKey}-${point.xIndex}`;
      const radius = isActive ? symbolSize * 0.75 : symbolSize * 0.55;

      nodes.push({
        kind: 'path',
        key: `pt-${point.seriesKey}-${point.xIndex}`,
        d: symbolPath(symbol, cx, cy, radius * 2),
        fill: point.color,
        opacity: (activeKey === null || isActive ? 0.85 : 0.35) * local,
        pointerEvents: 'none',
      });
    });

    return nodes;
  }, [
    plot,
    yTicks,
    xTicks,
    yLabels,
    xLabels,
    yScale,
    xScale,
    points,
    theme,
    progress,
    animBaseY,
    activeKey,
    symbol,
    symbolSize,
    animConfig.stagger,
  ]);

  /** 指针 → 最近的点（限定 28px 内，避免远处空白也触发） */
  const findNearest = useCallback(
    (clientX: number, clientY: number): ScatterPoint | null => {
      const element = ref.current;
      if (!element || !points.length) return null;
      const rect = element.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      let best: ScatterPoint | null = null;
      let minDistance = 28;
      for (const point of points) {
        const px = xScale.scale(point.x);
        const py = yScale.scale(point.y);
        const distance = Math.hypot(px - localX, py - localY);
        if (distance < minDistance) {
          minDistance = distance;
          best = point;
        }
      }
      return best;
    },
    [ref, points, xScale, yScale],
  );

  const activePoint = useMemo(() => {
    if (!activeKey) return null;
    return (
      points.find(
        (point) => `${point.seriesKey}-${point.xIndex}` === activeKey,
      ) ?? null
    );
  }, [activeKey, points]);

  const tooltipPayload: TooltipPayload | null = activePoint
    ? {
        label: `${xKey}: ${formatNumber(activePoint.x)}`,
        row: data[activePoint.xIndex] ?? null,
        series: [
          {
            key: activePoint.seriesKey,
            name: activePoint.seriesName,
            color: activePoint.color,
            value: activePoint.y,
            formatted: formatNumber(activePoint.y),
          },
        ],
      }
    : null;

  const legendItems = seriesList.map((item) => ({
    key: item.key,
    name: item.name,
    color: item.color,
    visible: item.visible,
  }));

  const toggle = useCallback((key: string) => {
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }, []);

  const autoAriaLabel =
    ariaLabel ?? `散点图：${seriesList.map((item) => item.name).join('、')}`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="scatter"
    >
      <Legend
        items={legendItems}
        theme={theme}
        config={legend}
        onToggle={toggle}
      />
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) => {
          const nearest = findNearest(event.clientX, event.clientY);
          setActiveKey(
            nearest ? `${nearest.seriesKey}-${nearest.xIndex}` : null,
          );
        }}
        onPointerLeave={() => setActiveKey(null)}
      >
        {points.length === 0 ? (
          <div className={prefixCls('chart__empty')}>{emptyText}</div>
        ) : (
          <SvgScene
            nodes={scene}
            width={size.width}
            height={size.height}
            ariaLabel={autoAriaLabel}
          />
        )}

        <Tooltip
          payload={tooltipPayload}
          x={activePoint ? xScale.scale(activePoint.x) : 0}
          y={activePoint ? yScale.scale(activePoint.y) : 0}
          containerWidth={size.width}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
