import React, { useCallback, useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { withAlpha, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Legend } from '../../components/Legend';
import { Tooltip } from '../../components/Tooltip';
import type { LegendConfig, TooltipConfig } from '../../types';
import { estimateTextWidth } from '../../core/format';
import '../../components/chart.less';

export interface RadarIndicator {
  /** 指标名，显示在顶点外侧 */
  name: string;
  /** 该指标的最大值 */
  max: number;
}

export interface RadarSeries {
  key: string;
  name?: string;
  /** 与 indicators 一一对应的数值 */
  values: number[];
  color?: string;
}

export interface RadarChartProps {
  indicators: RadarIndicator[];
  series: RadarSeries[];
  width?: number | string;
  height?: number;
  theme?: ChartThemeInput;
  palette?: string[];
  legend?: boolean | LegendConfig;
  tooltip?: boolean | TooltipConfig;
  /** 网格层数（同心多边形） */
  levels?: number;
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  emptyText?: string;
}

const GRID_LABEL_GAP = 10;

/**
 * 雷达图。
 *
 * 几何本质是极坐标：n 个指标把圆周等分，每个指标一条轴，
 * 数值映射为「沿轴距圆心的距离」。
 *
 * 与饼图相反，雷达图不编码总量，它编码的是**形状**——多指标的综合轮廓。
 * 因此各指标的 max 必须由使用者显式给出：自动取最大值会让「谁更好」失去参照。
 */
export function RadarChart({
  indicators = [],
  series = [],
  width = '100%',
  height = 320,
  theme: themeInput,
  palette,
  legend = true,
  tooltip = true,
  levels = 4,
  animation = true,
  className,
  style,
  ariaLabel,
  emptyText = '暂无数据',
}: RadarChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const visible = useMemo(
    () => series.filter((item) => !hiddenKeys.includes(item.key)),
    [series, hiddenKeys],
  );

  const colors = useMemo(
    () =>
      series.map(
        (item, index) =>
          item.color ?? theme.palette[index % theme.palette.length],
      ),
    [series, theme.palette],
  );

  const geometry = useMemo(() => {
    const count = Math.max(indicators.length, 3);
    // 顶点标签要占位置，半径留出文字宽度的一半
    const maxLabel = indicators.reduce(
      (max, item) =>
        Math.max(max, estimateTextWidth(item.name, theme.font.size)),
      0,
    );
    const padding = Math.min(64, maxLabel / 2 + GRID_LABEL_GAP + 6);
    const radius = Math.max(0, Math.min(size.width, size.height) / 2 - padding);
    return { cx: size.width / 2, cy: size.height / 2, radius, count };
  }, [indicators, size.width, size.height, theme.font.size]);

  const angleAt = useCallback(
    (index: number) => -Math.PI / 2 + (index * Math.PI * 2) / geometry.count,
    [geometry.count],
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

  const valueMatrix = useMemo(
    () => series.map((item) => item.values),
    [series],
  );
  const transition = useChartTransition(valueMatrix, animConfig);
  const progress = transition.progress;

  const scene = useMemo<SceneNode[]>(() => {
    const { cx, cy, radius } = geometry;
    if (radius <= 0 || indicators.length < 3) return [];
    const nodes: SceneNode[] = [];

    // 同心多边形网格
    for (let level = 1; level <= levels; level += 1) {
      const ratio = level / levels;
      const points = indicators
        .map((_, index) => {
          const angle = angleAt(index);
          return `${cx + Math.cos(angle) * radius * ratio},${cy + Math.sin(angle) * radius * ratio}`;
        })
        .join('L');
      nodes.push({
        kind: 'path',
        key: `grid-${level}`,
        d: `M${points}Z`,
        fill: level % 2 === 0 ? withAlpha(theme.grid.line, 0.05) : 'none',
        stroke: theme.grid.line,
        strokeWidth: theme.grid.lineWidth,
        strokeDasharray:
          level === levels ? undefined : theme.grid.dash.join(' '),
        pointerEvents: 'none',
      });
    }

    // 轴线
    indicators.forEach((_, index) => {
      const angle = angleAt(index);
      nodes.push({
        kind: 'line',
        key: `axis-${index}`,
        x1: cx,
        y1: cy,
        x2: cx + Math.cos(angle) * radius,
        y2: cy + Math.sin(angle) * radius,
        stroke: theme.axis.line,
        strokeWidth: 1,
        pointerEvents: 'none',
      });
    });

    // 指标名
    indicators.forEach((indicator, index) => {
      const angle = angleAt(index);
      const x = cx + Math.cos(angle) * (radius + GRID_LABEL_GAP);
      const y = cy + Math.sin(angle) * (radius + GRID_LABEL_GAP);
      const cos = Math.cos(angle);
      nodes.push({
        kind: 'text',
        key: `label-${index}`,
        x,
        y,
        text: indicator.name,
        fill: theme.text.secondary,
        fontSize: theme.font.size,
        anchor: Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end',
        baseline: 'middle',
        fontFamily: theme.font.family,
      });
    });

    // 数据多边形
    visible.forEach((item) => {
      const seriesIndex = series.indexOf(item);
      const color = colors[seriesIndex] ?? theme.palette[0];
      const isActive = activeKey === item.key;
      // 整块轮廓从圆心展开（同一系列内顶点同步），比逐点长出更符合「形状」语义
      const local = staggerProgress(
        progress,
        seriesIndex,
        visible.length,
        animConfig.stagger,
      );
      const row = transition.values[seriesIndex] ?? item.values;
      const points = indicators.map((indicator, index) => {
        const raw = row[index] ?? 0;
        const max = indicator.max || 1;
        // 超出 max 的数值会画到网格外，视觉上必须夹紧而不是溢出画布
        const ratio = Math.min(1.2, Math.max(0, raw / max)) * local;
        const angle = angleAt(index);
        return {
          x: geometry.cx + Math.cos(angle) * geometry.radius * ratio,
          y: geometry.cy + Math.sin(angle) * geometry.radius * ratio,
        };
      });

      nodes.push({
        kind: 'path',
        key: `area-${item.key}`,
        d: `M${points.map((p) => `${p.x},${p.y}`).join('L')}Z`,
        fill: withAlpha(color, isActive ? 0.28 : 0.16),
        stroke: color,
        strokeWidth: isActive
          ? theme.series.emphasisWidth
          : theme.series.lineWidth,
        linejoin: 'round',
        opacity: activeKey === null || isActive ? 1 : 0.5,
        pointerEvents: 'none',
      });

      points.forEach((point, index) => {
        nodes.push({
          kind: 'circle',
          key: `dot-${item.key}-${index}`,
          cx: point.x,
          cy: point.y,
          r: isActive ? 4 : 3,
          fill: theme.tooltip.background,
          stroke: color,
          strokeWidth: 2,
          opacity: activeKey === null || isActive ? 1 : 0.5,
          pointerEvents: 'none',
        });
      });
    });

    return nodes;
  }, [
    geometry,
    indicators,
    levels,
    angleAt,
    theme,
    visible,
    colors,
    series,
    activeKey,
    progress,
    transition.values,
    animConfig.stagger,
  ]);

  /** 指针 → 最近的多边形（按包围盒近似，够用且不引入额外几何计算） */
  const findNearest = useCallback(
    (clientX: number, clientY: number): string | null => {
      const element = ref.current;
      if (!element || visible.length === 0) return null;
      const rect = element.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const distance = Math.hypot(localX - geometry.cx, localY - geometry.cy);
      if (distance > geometry.radius + 12) return null;
      return visible[0].key;
    },
    [ref, visible, geometry],
  );

  const active = useMemo(() => {
    if (!activeKey) return null;
    const item = series.find((entry) => entry.key === activeKey);
    if (!item) return null;
    const color = colors[series.indexOf(item)] ?? theme.palette[0];
    return {
      item,
      color,
      payload: {
        label: item.name ?? item.key,
        row: null,
        series: indicators.map((indicator, index) => ({
          key: indicator.name,
          name: indicator.name,
          color,
          value: item.values[index] ?? null,
          formatted: `${item.values[index] ?? 0} / ${indicator.max}`,
        })),
      },
    };
  }, [activeKey, series, colors, theme.palette, indicators]);

  const legendItems = series.map((item, index) => ({
    key: item.key,
    name: item.name ?? item.key,
    color: colors[index],
    visible: !hiddenKeys.includes(item.key),
  }));

  const toggle = useCallback((key: string) => {
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }, []);

  const autoAriaLabel =
    ariaLabel ?? `雷达图：${indicators.map((item) => item.name).join('、')}`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="radar"
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
        onPointerMove={(event) =>
          setActiveKey(findNearest(event.clientX, event.clientY))
        }
        onPointerLeave={() => setActiveKey(null)}
      >
        {indicators.length < 3 || visible.length === 0 ? (
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
          payload={active?.payload ?? null}
          x={geometry.cx}
          y={geometry.cy - geometry.radius * 0.6}
          containerWidth={size.width}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
