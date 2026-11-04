import React, { useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import {
  createBandScale,
  createLinearScale,
  linearTicks,
} from '../../core/scale';
import { computeLayout, suggestTickCount } from '../../core/layout';
import { formatNumber } from '../../core/format';
import { roundedRectPath } from '../../core/shape';
import { colorAt, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Tooltip } from '../../components/Tooltip';
import type { TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface WaterfallItem {
  name: string;
  /** 增量值：正为增加，负为减少 */
  value: number;
  /** 是否为汇总项（从 0 画到累计值） */
  isTotal?: boolean;
  color?: string;
}

export interface WaterfallChartProps {
  data: WaterfallItem[];
  width?: number | string;
  height?: number;
  /** 增加项颜色，默认主题色板首色 */
  positiveColor?: string;
  /** 减少项颜色，默认 Aura 错误色 */
  negativeColor?: string;
  /** 汇总项颜色 */
  totalColor?: string;
  /** 是否显示相邻柱之间的连接线 */
  connector?: boolean;
  theme?: ChartThemeInput;
  palette?: string[];
  tooltip?: boolean | TooltipConfig;
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  emptyText?: string;
}

interface Row {
  name: string;
  value: number;
  start: number;
  end: number;
  isTotal: boolean;
  color: string;
}

/**
 * 瀑布图。
 *
 * 用柱子的「起点 + 终点」表达增减过程，最后落到总计。
 * 与堆叠柱的区别：堆叠柱的每段都从 0 起算的相对量，瀑布图的每一段都是**增量**，
 * 位置取决于此前所有项的累计。
 */
export function WaterfallChart({
  data = [],
  width = '100%',
  height = 320,
  positiveColor,
  negativeColor = '#ef4444',
  totalColor,
  connector = true,
  theme: themeInput,
  palette,
  tooltip = true,
  animation = true,
  className,
  style,
  ariaLabel,
  emptyText = '暂无数据',
}: WaterfallChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const rows = useMemo<Row[]>(() => {
    const up = positiveColor ?? colorAt(theme, 0);
    const total = totalColor ?? colorAt(theme, 1);
    let running = 0;

    return data.map((item) => {
      if (item.isTotal) {
        const row: Row = {
          name: item.name,
          value: running,
          start: 0,
          end: running,
          isTotal: true,
          color: item.color ?? total,
        };
        return row;
      }
      const start = running;
      running += item.value;
      return {
        name: item.name,
        value: item.value,
        start,
        end: running,
        isTotal: false,
        color: item.color ?? (item.value >= 0 ? up : negativeColor),
      };
    });
  }, [data, positiveColor, negativeColor, totalColor, theme]);

  const domain = useMemo<[number, number]>(() => {
    if (!rows.length) return [0, 1];
    let min = 0;
    let max = 0;
    for (const row of rows) {
      min = Math.min(min, row.start, row.end);
      max = Math.max(max, row.start, row.end);
    }
    return min === max ? [0, max + 1] : [min, max];
  }, [rows]);

  const yTicks = useMemo(
    () =>
      linearTicks(
        domain[0],
        domain[1],
        suggestTickCount(Math.max(60, height - 48)),
      ),
    [domain, height],
  );
  const yLabels = useMemo(
    () => yTicks.map((tick) => formatNumber(tick)),
    [yTicks],
  );

  const layout = useMemo(
    () =>
      computeLayout({
        width: Math.max(size.width, 0),
        height: Math.max(size.height, 0),
        yLabels,
        xLabels: rows.map((row) => row.name),
        theme,
      }),
    [size.width, size.height, yLabels, rows, theme],
  );
  const { plot } = layout;

  const xScale = useMemo(
    () =>
      createBandScale({
        domain: rows.map((row) => row.name),
        range: [plot.x, plot.x + plot.width],
        paddingInner: 0.36,
        paddingOuter: 0.12,
      }),
    [rows, plot.x, plot.width],
  );
  const yScale = useMemo(
    () => createLinearScale({ domain, range: [plot.y + plot.height, plot.y] }),
    [domain, plot.y, plot.height],
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

  // 每根柱子用 [起点, 终点] 两个数描述，插值时两端一起平滑移动
  const valueMatrix = useMemo(
    () => rows.map((row) => [row.start, row.end]),
    [rows],
  );
  const transition = useChartTransition(valueMatrix, animConfig);
  const progress = transition.progress;

  const scene = useMemo<SceneNode[]>(() => {
    if (!rows.length || plot.width <= 0) return [];
    const nodes: SceneNode[] = [];

    yTicks.forEach((tick, index) => {
      nodes.push({
        kind: 'line',
        key: `grid-${index}`,
        x1: plot.x,
        y1: yScale.scale(tick),
        x2: plot.x + plot.width,
        y2: yScale.scale(tick),
        stroke: theme.grid.line,
        strokeWidth: theme.grid.lineWidth,
        strokeDasharray: theme.grid.dash.join(' ') || undefined,
      });
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

    // 零基线（负值场景下必须显式画出）
    if (domain[0] < 0) {
      nodes.push({
        kind: 'line',
        key: 'zero',
        x1: plot.x,
        y1: yScale.scale(0),
        x2: plot.x + plot.width,
        y2: yScale.scale(0),
        stroke: theme.axis.line,
        strokeWidth: 1,
      });
    }

    const barWidth = Math.min(xScale.bandWidth, 56);

    rows.forEach((row, index) => {
      const cx = xScale.center(row.name);
      if (cx === undefined) return;
      // 逐柱错峰 + 从各自起点生长（不是整排从底部弹起）
      const local = staggerProgress(
        progress,
        index,
        rows.length,
        animConfig.stagger,
      );
      const animatedStart = transition.values[index]?.[0] ?? row.start;
      const animatedEnd = transition.values[index]?.[1] ?? row.end;
      const drawnEnd = animatedStart + (animatedEnd - animatedStart) * local;
      const top = yScale.scale(drawnEnd);
      const bottom = yScale.scale(animatedStart);
      const y = Math.min(top, bottom);
      const h = Math.max(2, Math.abs(bottom - top));
      const isActive = activeIndex === index;

      nodes.push({
        kind: 'path',
        key: `bar-${index}`,
        d: roundedRectPath(cx - barWidth / 2, y, barWidth, h, 3, {
          tl: true,
          tr: true,
        }),
        fill: row.color,
        opacity: activeIndex === null || isActive ? 1 : 0.55,
        pointerEvents: 'none',
      });

      // 连接线：从前一根柱的终点水平引到本柱起点
      if (connector && index > 0) {
        const prev = rows[index - 1];
        const prevCx = xScale.center(prev.name);
        if (prevCx !== undefined) {
          const linkY = yScale.scale(prev.end);
          nodes.push({
            kind: 'line',
            key: `link-${index}`,
            x1: prevCx + barWidth / 2,
            y1: linkY,
            x2: cx - barWidth / 2,
            y2: linkY,
            stroke: theme.axis.line,
            strokeWidth: 1,
            strokeDasharray: '3 3',
            pointerEvents: 'none',
          });
        }
      }

      nodes.push({
        kind: 'text',
        key: `xlabel-${index}`,
        x: cx,
        y: plot.y + plot.height + theme.axis.tickSize + theme.font.size,
        text: row.name,
        fill: theme.axis.label,
        fontSize: theme.font.size,
        anchor: 'middle',
        fontFamily: theme.font.family,
      });
    });

    return nodes;
  }, [
    rows,
    plot,
    yTicks,
    yLabels,
    yScale,
    xScale,
    theme,
    progress,
    activeIndex,
    domain,
    connector,
    transition.values,
    animConfig.stagger,
  ]);

  const indexFromPointer = (clientX: number): number | null => {
    const element = ref.current;
    if (!element || !rows.length) return null;
    const rect = element.getBoundingClientRect();
    const localX = clientX - rect.left;
    let nearest: number | null = null;
    let min = Infinity;
    rows.forEach((row, index) => {
      const cx = xScale.center(row.name);
      if (cx === undefined) return;
      const distance = Math.abs(cx - localX);
      if (distance < min) {
        min = distance;
        nearest = index;
      }
    });
    return nearest;
  };

  const active = activeIndex !== null ? rows[activeIndex] : null;
  const tooltipPayload = active
    ? {
        label: active.name,
        row: null,
        series: [
          {
            key: active.name,
            name: active.isTotal ? '累计' : '增减',
            color: active.color,
            value: active.isTotal ? active.end : active.value,
            formatted: formatNumber(active.isTotal ? active.end : active.value),
          },
        ],
      }
    : null;

  const autoAriaLabel =
    ariaLabel ?? `瀑布图：${rows.map((row) => row.name).join('、')}`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="waterfall"
    >
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) =>
          setActiveIndex(indexFromPointer(event.clientX))
        }
        onPointerLeave={() => setActiveIndex(null)}
      >
        {rows.length === 0 || size.width === 0 ? (
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
          x={active ? (xScale.center(active.name) ?? 0) : 0}
          y={active ? yScale.scale(Math.max(active.start, active.end)) - 10 : 0}
          containerWidth={size.width}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
