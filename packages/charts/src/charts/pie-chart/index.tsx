import React, { useCallback, useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { arcPath } from '../../core/shape';
import { formatPercent } from '../../core/format';
import type { ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Legend } from '../../components/Legend';
import { Tooltip } from '../../components/Tooltip';
import type { LegendConfig, TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface PieDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieDataItem[];
  width?: number | string;
  height?: number;
  theme?: ChartThemeInput;
  palette?: string[];
  legend?: boolean | LegendConfig;
  tooltip?: boolean | TooltipConfig;
  /** 内径比例，0 为实心饼图，0.6 为常见环图 */
  innerRadius?: number;
  /** 扇区间隙角度（弧度），默认 0.01 */
  padAngle?: number;
  /** 标签：outside 引线标签 / inside 内部百分比 / false 不显示 */
  label?: 'outside' | 'inside' | false;
  /** 圆心的自定义内容（仅环图有意义） */
  centerContent?: React.ReactNode;
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  emptyText?: string;
}

interface Slice extends PieDataItem {
  index: number;
  color: string;
  startAngle: number;
  endAngle: number;
  percent: number;
}

/**
 * 饼图 / 环形图。
 *
 * 交互命中不用 DOM 事件绑定在每个扇形上，而是把鼠标坐标换算成极坐标角度后
 * 反查所属扇区 —— 这样 SVG 与 Canvas 两种渲染方式可以共用同一套交互逻辑。
 */
export function PieChart({
  data = [],
  width = '100%',
  height = 320,
  theme: themeInput,
  palette,
  legend = true,
  tooltip = true,
  innerRadius = 0.6,
  padAngle = 0.01,
  label = 'outside',
  centerContent,
  animation = true,
  className,
  style,
  ariaLabel,
  emptyText = '暂无数据',
}: PieChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const visibleData = useMemo(
    () => data.filter((item) => !hiddenKeys.includes(item.name)),
    [data, hiddenKeys],
  );

  const total = useMemo(
    () =>
      visibleData.reduce(
        (sum, item) => sum + (Number.isFinite(item.value) ? item.value : 0),
        0,
      ),
    [visibleData],
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

  // 用插值后的数值重算角度：数据更新时扇区会平滑重排，而不是整块重画
  const valueMatrix = useMemo(
    () => [
      visibleData.map((item) => (Number.isFinite(item.value) ? item.value : 0)),
    ],
    [visibleData],
  );
  const transition = useChartTransition(valueMatrix, animConfig);
  const progress = transition.progress;
  const animatedValues = transition.values[0] ?? valueMatrix[0];
  const animatedTotal =
    animatedValues.reduce<number>((sum, value) => sum + (value ?? 0), 0) || 1;

  const slices = useMemo<Slice[]>(() => {
    const sum = animatedTotal || 1;
    let angle = -Math.PI / 2;
    return visibleData.map((item, index) => {
      const ratio = (animatedValues[index] ?? 0) / sum;
      const sweep = ratio * Math.PI * 2;
      const slice: Slice = {
        ...item,
        index,
        color: item.color ?? theme.palette[index % theme.palette.length],
        startAngle: angle,
        endAngle: angle + sweep,
        percent: ratio,
      };
      angle += sweep;
      return slice;
    });
  }, [visibleData, animatedValues, animatedTotal, theme.palette]);

  const geometry = useMemo(() => {
    const outer = Math.max(
      0,
      Math.min(size.width, size.height) / 2 - (label === 'outside' ? 36 : 14),
    );
    const inner = outer * Math.max(0, Math.min(0.92, innerRadius));
    return {
      cx: size.width / 2,
      cy: size.height / 2,
      outer,
      inner,
    };
  }, [size.width, size.height, label, innerRadius]);

  /** 是否由调用方接管中心区域（布尔化参与依赖，避免 ReactNode 引用每次渲染都击穿 memo） */
  const hasCenterContent =
    centerContent !== undefined && centerContent !== null;

  const scene = useMemo<SceneNode[]>(() => {
    if (!slices.length || geometry.outer <= 0) return [];
    const nodes: SceneNode[] = [];

    for (const slice of slices) {
      // 扇区错峰展开：从 12 点方向顺时针依次扫出，比整块同时膨胀自然
      const local = staggerProgress(
        progress,
        slice.index,
        slices.length,
        animConfig.stagger,
      );
      const end =
        slice.startAngle + (slice.endAngle - slice.startAngle) * local;
      const isActive = activeIndex === slice.index;
      const gap = slices.length > 1 ? padAngle / 2 : 0;
      const outer = isActive ? geometry.outer + 3 : geometry.outer;

      nodes.push({
        kind: 'path',
        key: `slice-${slice.name}`,
        d: arcPath(
          geometry.cx,
          geometry.cy,
          geometry.inner,
          outer,
          slice.startAngle + gap,
          Math.max(slice.startAngle + gap, end - gap),
        ),
        fill: slice.color,
        opacity: activeIndex === null || isActive ? 1 : 0.55,
        pointerEvents: 'none',
      });

      if (label === 'inside' && slice.percent >= 0.05) {
        const mid = (slice.startAngle + end) / 2;
        const radius = (geometry.inner + outer) / 2;
        nodes.push({
          kind: 'text',
          key: `inside-${slice.name}`,
          x: geometry.cx + Math.cos(mid) * radius,
          y: geometry.cy + Math.sin(mid) * radius,
          text: formatPercent(slice.percent, 1, 0),
          fill: '#fff',
          fontSize: theme.font.size,
          fontWeight: theme.font.weightMedium,
          anchor: 'middle',
          baseline: 'middle',
          opacity: progress,
        });
      }

      if (label === 'outside' && progress > 0.6 && slice.percent > 0.02) {
        const mid = (slice.startAngle + end) / 2;
        const anchorX = geometry.cx + Math.cos(mid) * (outer + 8);
        const anchorY = geometry.cy + Math.sin(mid) * (outer + 8);
        const elbowX = geometry.cx + Math.cos(mid) * (outer + 16);
        const elbowY = geometry.cy + Math.sin(mid) * (outer + 16);
        const isRight = Math.cos(mid) >= 0;
        const textX = elbowX + (isRight ? 8 : -8);
        const textY =
          elbowY + (Math.sin(mid) > 0.4 ? 4 : Math.sin(mid) < -0.4 ? -2 : 0);

        nodes.push({
          kind: 'path',
          key: `leader-${slice.name}`,
          d: `M${anchorX},${anchorY}L${elbowX},${elbowY}L${textX},${textY}`,
          fill: 'none',
          stroke: theme.axis.line,
          strokeWidth: 1,
          pointerEvents: 'none',
        });
        nodes.push({
          kind: 'text',
          key: `outside-${slice.name}`,
          x: textX + (isRight ? 2 : -2),
          y: textY,
          text: `${slice.name} ${formatPercent(slice.percent, 1, 1)}`,
          fill: isActive ? theme.text.primary : theme.text.secondary,
          fontSize: theme.font.size,
          anchor: isRight ? 'start' : 'end',
          baseline: 'middle',
          fontWeight: isActive
            ? theme.font.weightMedium
            : theme.font.weightNormal,
        });
      }
    }

    // centerContent 由调用方完全接管中心区域：此时不再渲染内置的
    // 「总计」文本，否则两层内容（SVG 内置 + HTML 自定义）会叠在圆心
    if (geometry.inner > 0 && !hasCenterContent) {
      const active = activeIndex !== null ? slices[activeIndex] : null;
      nodes.push({
        kind: 'text',
        key: 'center-main',
        x: geometry.cx,
        y: geometry.cy - (active ? 6 : 0),
        text: active
          ? String(Math.round(active.value))
          : String(Math.round(animatedTotal)),
        fill: theme.text.primary,
        fontSize: active ? 20 : 22,
        fontWeight: theme.font.weightMedium,
        anchor: 'middle',
        baseline: 'middle',
      });
      nodes.push({
        kind: 'text',
        key: 'center-sub',
        x: geometry.cx,
        y: geometry.cy + 18,
        text: active
          ? `${active.name} · ${formatPercent(active.percent, 1, 1)}`
          : '总计',
        fill: theme.text.secondary,
        fontSize: theme.font.sizeSmall,
        anchor: 'middle',
        baseline: 'middle',
      });
    }

    return nodes;
  }, [
    slices,
    geometry,
    progress,
    activeIndex,
    label,
    padAngle,
    theme,
    animatedTotal,
    animConfig.stagger,
    hasCenterContent,
  ]);

  /** 指针 → 扇区索引 */
  const indexFromPointer = useCallback(
    (clientX: number, clientY: number): number | null => {
      const element = ref.current;
      if (!element || !slices.length) return null;
      const rect = element.getBoundingClientRect();
      const dx = clientX - rect.left - geometry.cx;
      const dy = clientY - rect.top - geometry.cy;
      const radius = Math.hypot(dx, dy);
      if (radius < geometry.inner || radius > geometry.outer + 6) return null;

      let angle = Math.atan2(dy, dx);
      const start = -Math.PI / 2;
      // 归一化到 [start, start + 2π)
      while (angle < start) angle += Math.PI * 2;
      while (angle >= start + Math.PI * 2) angle -= Math.PI * 2;

      const hit = slices.find(
        (slice) => angle >= slice.startAngle && angle < slice.endAngle,
      );
      return hit ? hit.index : null;
    },
    [ref, slices, geometry],
  );

  const active = activeIndex !== null ? slices[activeIndex] : null;

  const tooltipPayload = active
    ? {
        label: active.name,
        row: null,
        series: [
          {
            key: active.name,
            name: active.name,
            color: active.color,
            value: active.value,
            formatted: `${active.value}（${formatPercent(active.percent, 1, 1)}）`,
          },
        ],
      }
    : null;

  const legendItems = data.map((item, index) => ({
    key: item.name,
    name: item.name,
    color: item.color ?? theme.palette[index % theme.palette.length],
    visible: !hiddenKeys.includes(item.name),
  }));

  const toggle = useCallback((key: string) => {
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }, []);

  const autoAriaLabel = ariaLabel ?? '饼图';

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="pie"
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
          setActiveIndex(indexFromPointer(event.clientX, event.clientY))
        }
        onPointerLeave={() => setActiveIndex(null)}
      >
        {slices.length === 0 || total <= 0 ? (
          <div className={prefixCls('chart__empty')}>{emptyText}</div>
        ) : (
          <>
            <SvgScene
              nodes={scene}
              width={size.width}
              height={size.height}
              ariaLabel={autoAriaLabel}
            />
            {centerContent && geometry.inner > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                {centerContent}
              </div>
            ) : null}
          </>
        )}

        <Tooltip
          payload={tooltipPayload}
          x={geometry.cx}
          y={activeIndex !== null ? geometry.cy - geometry.outer * 0.5 : 0}
          containerWidth={size.width}
          containerHeight={size.height}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
