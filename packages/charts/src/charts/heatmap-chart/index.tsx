import React, { useCallback, useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { createBandScale } from '../../core/scale';
import { formatNumber, estimateTextWidth } from '../../core/format';
import { roundedRectPath } from '../../core/shape';
import { mixColor, withAlpha, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Tooltip } from '../../components/Tooltip';
import type { ChartAnimationInput, TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface HeatmapCell {
  /** 横轴分类 */
  x: string;
  /** 纵轴分类 */
  y: string;
  /** 该格数值；缺失时传 null，会渲染为空格 */
  value: number | null;
}

export interface HeatmapChartProps {
  data?: HeatmapCell[];
  /** 显式指定横轴顺序；不传则按数据出现顺序 */
  xLabels?: string[];
  /** 显式指定纵轴顺序；不传则按数据出现顺序 */
  yLabels?: string[];
  /** 色阶：从低到高的两端颜色，缺省用主题强调色的浅→深 */
  colorRange?: [string, string];
  /** 是否在格子内显示数值 */
  showValue?: boolean | 'auto';
  /** 格子间隙（像素） */
  cellGap?: number;
  /** 格子圆角 */
  cellRadius?: number;
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

/** 把数值映射到 0~1 的位置；全等值时统一给 0.6，避免整片同色看不清边界 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.6;
  return (value - min) / (max - min);
}

/**
 * 热力图。
 *
 * 用颜色深浅编码二维矩阵里的数值，密度远高于逐格标数字，
 * 适合「一眼看出哪块热」——访问时段分布、地域 × 品类销量、相关性矩阵。
 *
 * 注意：颜色编码的精度低于长度/位置（这是视觉感知的固有限制），
 * 需要读出准确数值时必须配合 tooltip 或数字。
 */
export function HeatmapChart({
  data = [],
  xLabels: xLabelsProp,
  yLabels: yLabelsProp,
  colorRange,
  showValue = 'auto',
  cellGap = 3,
  cellRadius = 3,
  width = '100%',
  height = 320,
  theme: themeInput,
  palette,
  tooltip = true,
  animation = true,
  className,
  style,
  ariaLabel,
  emptyText = '暂无数据',
}: HeatmapChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [activeCell, setActiveCell] = useState<HeatmapCell | null>(null);

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  const { xLabels, yLabels, lookup, range } = useMemo(() => {
    const xs = xLabelsProp?.length ? xLabelsProp : [];
    const ys = yLabelsProp?.length ? yLabelsProp : [];

    if (!xs.length) {
      for (const cell of data) if (!xs.includes(cell.x)) xs.push(cell.x);
    }
    if (!ys.length) {
      for (const cell of data) if (!ys.includes(cell.y)) ys.push(cell.y);
    }

    const map = new Map<string, number | null>();
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const cell of data) {
      map.set(`${cell.x}__${cell.y}`, cell.value);
      if (cell.value !== null && Number.isFinite(cell.value)) {
        min = Math.min(min, cell.value);
        max = Math.max(max, cell.value);
      }
    }

    return {
      xLabels: xs,
      yLabels: ys,
      lookup: map,
      range: [
        Number.isFinite(min) ? min : 0,
        Number.isFinite(max) ? max : 1,
      ] as [number, number],
    };
  }, [data, xLabelsProp, yLabelsProp]);

  // 用数值矩阵驱动动画：更新时颜色平滑过渡
  const matrix = useMemo(
    () =>
      yLabels.map((y) =>
        xLabels.map((x) => {
          const value = lookup.get(`${x}__${y}`);
          return value === undefined ? null : value;
        }),
      ),
    [xLabels, yLabels, lookup],
  );

  const transition = useChartTransition(matrix, animConfig);
  const progress = transition.progress;

  const geometry = useMemo(() => {
    const labelWidth = Math.max(
      0,
      ...yLabels.map((label) => estimateTextWidth(label, theme.font.size)),
    );
    const left = Math.ceil(labelWidth) + 8;
    const top = 8;
    const bottom = theme.font.size + 12;
    const right = 8;
    return {
      left,
      top,
      right,
      bottom,
      plotWidth: Math.max(0, size.width - left - right),
      plotHeight: Math.max(0, size.height - top - bottom),
    };
  }, [yLabels, size.width, size.height, theme.font.size]);

  const xScale = useMemo(
    () =>
      createBandScale({
        domain: xLabels,
        range: [geometry.left, geometry.left + geometry.plotWidth],
        paddingInner: 0,
        paddingOuter: 0,
      }),
    [xLabels, geometry.left, geometry.plotWidth],
  );

  const rowHeight =
    yLabels.length > 0 ? geometry.plotHeight / yLabels.length : 0;

  const colorAt = useCallback(
    (value: number): string => {
      const from = colorRange?.[0] ?? withAlpha(theme.emphasis, 0.08);
      const to = colorRange?.[1] ?? theme.emphasis;
      return mixColor(from, to, normalize(value, range[0], range[1]));
    },
    [colorRange, theme.emphasis, range],
  );

  const cellSize = Math.max(0, xScale.step - cellGap);
  const showNumbers =
    showValue === true ||
    (showValue === 'auto' && cellSize >= 42 && rowHeight >= 24);

  const scene = useMemo<SceneNode[]>(() => {
    if (!xLabels.length || !yLabels.length || geometry.plotWidth <= 0)
      return [];
    const nodes: SceneNode[] = [];
    const total = yLabels.length * xLabels.length;

    yLabels.forEach((yLabel, rowIndex) => {
      const y = geometry.top + rowIndex * rowHeight;
      nodes.push({
        kind: 'text',
        key: `yl-${yLabel}`,
        x: geometry.left - 8,
        y: y + rowHeight / 2,
        text: yLabel,
        fill: theme.axis.label,
        fontSize: theme.font.size,
        anchor: 'end',
        baseline: 'middle',
        fontFamily: theme.font.family,
      });

      xLabels.forEach((xLabel, columnIndex) => {
        const x = xScale.scale(xLabel);
        if (x === undefined) return;

        const raw = transition.values[rowIndex]?.[columnIndex] ?? null;
        const flatIndex = rowIndex * xLabels.length + columnIndex;
        const local = staggerProgress(
          progress,
          flatIndex,
          total,
          animConfig.stagger,
        );

        if (raw === null) {
          // 缺失格：画一个极浅的底，让矩阵结构仍然完整
          nodes.push({
            kind: 'rect',
            key: `empty-${xLabel}-${yLabel}`,
            x: x + cellGap / 2,
            y: y + cellGap / 2,
            width: cellSize,
            height: Math.max(0, rowHeight - cellGap),
            radius: cellRadius,
            fill: withAlpha(theme.axis.line, 0.35),
            opacity: local,
            pointerEvents: 'none',
          });
          return;
        }

        const isActive = activeCell?.x === xLabel && activeCell?.y === yLabel;

        nodes.push({
          kind: 'path',
          key: `cell-${xLabel}-${yLabel}`,
          d: roundedRectPath(
            x + cellGap / 2,
            y + cellGap / 2,
            cellSize,
            Math.max(0, rowHeight - cellGap),
            cellRadius,
          ),
          fill: colorAt(raw),
          stroke: isActive ? theme.text.primary : undefined,
          strokeWidth: isActive ? 1.5 : 0,
          opacity: local,
          pointerEvents: 'none',
        });

        if (showNumbers) {
          // 深色格子用白字，浅色用深字，保证可读
          const ratio = normalize(raw, range[0], range[1]);
          nodes.push({
            kind: 'text',
            key: `cell-value-${xLabel}-${yLabel}`,
            x: x + xScale.step / 2,
            y: y + rowHeight / 2,
            text: formatNumber(raw),
            fill: ratio > 0.55 ? '#fff' : theme.text.primary,
            fontSize: theme.font.sizeSmall,
            anchor: 'middle',
            baseline: 'middle',
            opacity: local,
            fontFamily: theme.font.family,
          });
        }
      });
    });

    // 横轴标签
    xLabels.forEach((xLabel) => {
      const x = xScale.scale(xLabel);
      if (x === undefined) return;
      nodes.push({
        kind: 'text',
        key: `xl-${xLabel}`,
        x: x + xScale.step / 2,
        y: geometry.top + geometry.plotHeight + theme.font.size + 4,
        text: xLabel,
        fill: theme.axis.label,
        fontSize: theme.font.size,
        anchor: 'middle',
        fontFamily: theme.font.family,
      });
    });

    return nodes;
  }, [
    xLabels,
    yLabels,
    geometry,
    rowHeight,
    xScale,
    cellSize,
    cellGap,
    cellRadius,
    theme,
    transition.values,
    progress,
    animConfig.stagger,
    range,
    showNumbers,
    activeCell,
    colorAt,
  ]);

  const cellFromPointer = (
    clientX: number,
    clientY: number,
  ): HeatmapCell | null => {
    const element = ref.current;
    if (!element || xScale.step <= 0 || rowHeight <= 0) return null;
    const rect = element.getBoundingClientRect();
    const localX = clientX - rect.left - geometry.left;
    const localY = clientY - rect.top - geometry.top;
    if (localX < 0 || localY < 0) return null;

    const column = Math.floor(localX / xScale.step);
    const row = Math.floor(localY / rowHeight);
    const x = xLabels[column];
    const y = yLabels[row];
    if (x === undefined || y === undefined) return null;
    const value = lookup.get(`${x}__${y}`);
    if (value === undefined) return null;
    return { x, y, value };
  };

  const tooltipPayload = activeCell
    ? {
        label: `${activeCell.y} · ${activeCell.x}`,
        row: null,
        series: [
          {
            key: activeCell.x,
            name: '数值',
            color:
              activeCell.value === null
                ? theme.text.secondary
                : colorAt(activeCell.value),
            value: activeCell.value,
            formatted:
              activeCell.value === null
                ? '无数据'
                : formatNumber(activeCell.value),
          },
        ],
      }
    : null;

  const autoAriaLabel =
    ariaLabel ?? `热力图：${yLabels.length} 行 × ${xLabels.length} 列`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="heatmap"
    >
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) =>
          setActiveCell(cellFromPointer(event.clientX, event.clientY))
        }
        onPointerLeave={() => setActiveCell(null)}
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
          x={size.width / 2}
          y={16}
          containerWidth={size.width}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
