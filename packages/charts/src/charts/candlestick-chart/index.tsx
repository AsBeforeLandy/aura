import React, { useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import {
  createBandScale,
  createLinearScale,
  linearTicks,
} from '../../core/scale';
import { formatNumber, estimateTextWidth } from '../../core/format';
import { linePath, type CurvePoint } from '../../core/shape';
import { withAlpha, colorAt, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import {
  resolveAnimation,
  staggerProgress,
  type ResolvedAnimation,
} from '../../core/animation';
import { Tooltip } from '../../components/Tooltip';
import type { ChartAnimationInput, TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface CandlestickItem {
  /** 时间标签（交易日、周、月） */
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  /** 成交量；不传时不画副图 */
  volume?: number;
}

export interface CandlestickChartProps {
  data?: CandlestickItem[];
  /** 均线周期，默认 [5, 10, 20]；传空数组关闭 */
  ma?: number[];
  /** 是否显示成交量副图（需要数据里有 volume） */
  showVolume?: boolean;
  /**
   * 上涨颜色。默认红色 —— 遵循 A 股/港股「红涨绿跌」，
   * 与欧美市场相反；如需国际市场惯例请自行对调。
   */
  upColor?: string;
  /** 下跌颜色 */
  downColor?: string;
  width?: number | string;
  height?: number;
  theme?: ChartThemeInput;
  palette?: string[];
  tooltip?: boolean | TooltipConfig;
  animation?: ChartAnimationInput;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  emptyText?: string;
}

/** 简单移动平均；不足周期的位置返回 null（不能拿 0 顶替，否则线会拉到轴上） */
function movingAverage(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  let sum = 0;
  for (let index = 0; index < values.length; index += 1) {
    sum += values[index];
    if (index >= period) sum -= values[index - period];
    result.push(index >= period - 1 ? sum / period : null);
  }
  return result;
}

/**
 * K 线图。
 *
 * 一根蜡烛编码四个价格：开盘、收盘、最高、最低。
 * 实体（开收之间的矩形）表达当期多空结果，上下影线表达盘中波动范围。
 *
 * 配色遵循国内习惯：**红涨绿跌**，与国际市场相反。
 */
export function CandlestickChart({
  data = [],
  ma = [5, 10, 20],
  showVolume = true,
  upColor = '#ef4444',
  downColor = '#22c55e',
  width = '100%',
  height = 360,
  theme: themeInput,
  palette,
  tooltip = true,
  animation = true,
  className,
  style,
  ariaLabel,
  emptyText = '暂无数据',
}: CandlestickChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig: ResolvedAnimation = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  const dates = useMemo(() => data.map((item) => item.date), [data]);
  const hasVolume =
    showVolume && data.some((item) => Number.isFinite(item.volume));

  // 每行 [open, high, low, close, volume]，更新时逐项插值
  const matrix = useMemo(
    () =>
      data.map((item) => [
        item.open,
        item.high,
        item.low,
        item.close,
        item.volume ?? 0,
      ]),
    [data],
  );
  const transition = useChartTransition(matrix, animConfig);
  const progress = transition.progress;

  const priceRange = useMemo<[number, number]>(() => {
    if (!data.length) return [0, 1];
    const lows = data.map((item) => item.low);
    const highs = data.map((item) => item.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    if (min === max) return [min * 0.98, max * 1.02];
    const pad = (max - min) * 0.06;
    return [min - pad, max + pad];
  }, [data]);

  const volumeMax = useMemo(
    () => Math.max(1, ...data.map((item) => item.volume ?? 0)),
    [data],
  );

  const tickCount = Math.max(3, Math.min(6, Math.round((height * 0.6) / 54)));
  const yTicks = useMemo(
    () => linearTicks(priceRange[0], priceRange[1], tickCount),
    [priceRange, tickCount],
  );
  const yLabels = useMemo(
    () =>
      yTicks.map((tick) => formatNumber(tick, { compact: true, decimals: 2 })),
    [yTicks],
  );

  const geometry = useMemo(() => {
    const labelWidth = Math.max(
      0,
      ...yLabels.map((label) => estimateTextWidth(label, theme.font.size)),
    );
    const left = Math.ceil(labelWidth) + 8;
    const top = 10;
    const bottom = theme.font.size + 12;
    const plotWidth = Math.max(0, size.width - left - 12);
    const plotHeight = Math.max(0, size.height - top - bottom);
    const mainHeight = hasVolume ? plotHeight * 0.74 : plotHeight;
    return {
      left,
      top,
      plotWidth,
      plotHeight,
      mainHeight,
      volumeTop: top + mainHeight + 12,
      volumeHeight: Math.max(0, plotHeight - mainHeight - 12),
    };
  }, [yLabels, size.width, size.height, theme.font.size, hasVolume]);

  const xScale = useMemo(
    () =>
      createBandScale({
        domain: dates,
        range: [geometry.left, geometry.left + geometry.plotWidth],
        paddingInner: 0.34,
        paddingOuter: 0.16,
      }),
    [dates, geometry.left, geometry.plotWidth],
  );

  const yScale = useMemo(
    () =>
      createLinearScale({
        domain: priceRange,
        range: [geometry.top + geometry.mainHeight, geometry.top],
      }),
    [priceRange, geometry.top, geometry.mainHeight],
  );

  const maSeries = useMemo(() => {
    if (!ma.length || !data.length) return [];
    return ma.map((period, index) => ({
      period,
      color: colorAt(theme, index + 2),
      values: movingAverage(
        data.map((item) => item.close),
        period,
      ),
    }));
  }, [ma, data, theme]);

  const scene = useMemo<SceneNode[]>(() => {
    if (!data.length || geometry.plotWidth <= 0) return [];
    const nodes: SceneNode[] = [];
    const bodyWidth = Math.max(1, xScale.step * 0.62);

    // 水平网格 + 价格刻度
    yTicks.forEach((tick, index) => {
      const y = yScale.scale(tick);
      nodes.push({
        kind: 'line',
        key: `grid-${index}`,
        x1: geometry.left,
        y1: y,
        x2: geometry.left + geometry.plotWidth,
        y2: y,
        stroke: theme.grid.line,
        strokeWidth: theme.grid.lineWidth,
        strokeDasharray: theme.grid.dash.join(' ') || undefined,
      });
      nodes.push({
        kind: 'text',
        key: `yl-${index}`,
        x: geometry.left - 6,
        y,
        text: yLabels[index],
        fill: theme.axis.label,
        fontSize: theme.font.size,
        anchor: 'end',
        baseline: 'middle',
        fontFamily: theme.font.family,
      });
    });

    data.forEach((item, index) => {
      const cx = xScale.center(item.date);
      if (cx === undefined) return;

      const row = transition.values[index] ?? [
        item.open,
        item.high,
        item.low,
        item.close,
        item.volume ?? 0,
      ];
      const [open, high, low, close] = row as number[];
      const rising = close >= open;
      const color = rising ? upColor : downColor;
      const local = staggerProgress(
        progress,
        index,
        data.length,
        animConfig.stagger,
      );

      // 入场时以收盘价为锚点向两端展开，视觉上像「长出一根蜡烛」
      const anchorY = yScale.scale(close);
      const project = (value: number) =>
        anchorY + (yScale.scale(value) - anchorY) * local;

      const yHigh = project(high);
      const yLow = project(low);
      const yOpen = project(open);
      const yClose = project(close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));

      nodes.push({
        kind: 'line',
        key: `wick-${index}`,
        x1: cx,
        y1: yHigh,
        x2: cx,
        y2: yLow,
        stroke: color,
        strokeWidth: 1,
        pointerEvents: 'none',
      });

      nodes.push({
        kind: 'rect',
        key: `body-${index}`,
        x: cx - bodyWidth / 2,
        y: bodyTop,
        width: bodyWidth,
        height: bodyHeight,
        radius: 1,
        fill: color,
        opacity: activeIndex === null || activeIndex === index ? 1 : 0.55,
        pointerEvents: 'none',
      });

      // 成交量副图
      if (hasVolume && geometry.volumeHeight > 0) {
        const volume = row[4] ?? 0;
        const barHeight = Math.max(
          1,
          (volume / volumeMax) * geometry.volumeHeight * local,
        );
        nodes.push({
          kind: 'rect',
          key: `volume-${index}`,
          x: cx - bodyWidth / 2,
          y: geometry.volumeTop + geometry.volumeHeight - barHeight,
          width: bodyWidth,
          height: barHeight,
          radius: 1,
          fill: withAlpha(color, 0.55),
          pointerEvents: 'none',
        });
      }

      // x 轴标签：密集时抽样，避免压字
      const labelStep = Math.max(1, Math.ceil(data.length / 8));
      if (index % labelStep === 0 || index === data.length - 1) {
        nodes.push({
          kind: 'text',
          key: `xl-${index}`,
          x: cx,
          y: geometry.top + geometry.plotHeight + theme.font.size + 4,
          text: item.date,
          fill: theme.axis.label,
          fontSize: theme.font.size,
          anchor: 'middle',
          fontFamily: theme.font.family,
        });
      }
    });

    // 均线
    maSeries.forEach((item) => {
      const points: CurvePoint[] = item.values
        .map((value, index) => {
          if (value === null) return null;
          const cx = xScale.center(data[index].date);
          if (cx === undefined) return null;
          const target = yScale.scale(value);
          const anchor = yScale.scale(data[index].close);
          return { x: cx, y: anchor + (target - anchor) * progress };
        })
        .filter((point): point is CurvePoint => point !== null);

      const d = linePath(points, 'linear');
      if (!d) return;
      nodes.push({
        kind: 'path',
        key: `ma-${item.period}`,
        d,
        fill: 'none',
        stroke: item.color,
        strokeWidth: 1.4,
        linejoin: 'round',
        pointerEvents: 'none',
      });
    });

    return nodes;
  }, [
    data,
    geometry,
    xScale,
    yScale,
    yTicks,
    yLabels,
    theme,
    transition.values,
    progress,
    animConfig.stagger,
    upColor,
    downColor,
    hasVolume,
    volumeMax,
    maSeries,
    activeIndex,
  ]);

  const indexFromPointer = (clientX: number): number | null => {
    const element = ref.current;
    if (!element || xScale.step <= 0) return null;
    const rect = element.getBoundingClientRect();
    const localX = clientX - rect.left - geometry.left;
    if (localX < 0) return null;
    const index = Math.floor(localX / xScale.step);
    return index >= 0 && index < data.length ? index : null;
  };

  const active = activeIndex !== null ? data[activeIndex] : null;
  const tooltipPayload = active
    ? {
        label: active.date,
        row: null,
        series: [
          {
            key: 'open',
            name: '开盘',
            color: upColor,
            value: active.open,
            formatted: formatNumber(active.open, { decimals: 2 }),
          },
          {
            key: 'high',
            name: '最高',
            color: theme.text.secondary,
            value: active.high,
            formatted: formatNumber(active.high, { decimals: 2 }),
          },
          {
            key: 'low',
            name: '最低',
            color: theme.text.secondary,
            value: active.low,
            formatted: formatNumber(active.low, { decimals: 2 }),
          },
          {
            key: 'close',
            name: '收盘',
            color: downColor,
            value: active.close,
            formatted: formatNumber(active.close, { decimals: 2 }),
          },
          ...(Number.isFinite(active.volume)
            ? [
                {
                  key: 'volume',
                  name: '成交量',
                  color: theme.text.secondary,
                  value: active.volume ?? null,
                  formatted: formatNumber(active.volume ?? 0, {
                    compact: true,
                  }),
                },
              ]
            : []),
        ],
      }
    : null;

  const autoAriaLabel =
    ariaLabel ??
    `K 线图：${data.length} 个交易日，最新收盘 ${data[data.length - 1]?.close ?? '—'}`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="candlestick"
    >
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) =>
          setActiveIndex(indexFromPointer(event.clientX))
        }
        onPointerLeave={() => setActiveIndex(null)}
      >
        {data.length === 0 || size.width === 0 ? (
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
          x={
            activeIndex !== null
              ? (xScale.center(data[activeIndex].date) ?? 0)
              : 0
          }
          y={geometry.top + 12}
          containerWidth={size.width}
          containerHeight={size.height}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
