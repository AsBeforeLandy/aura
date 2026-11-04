import React, { useCallback, useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { formatNumber, formatPercent } from '../../core/format';
import { withAlpha, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Tooltip } from '../../components/Tooltip';
import type { TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface FunnelDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  data: FunnelDataItem[];
  width?: number | string;
  height?: number;
  /** 标签位置：堆叠在图元内 / 右侧外部 */
  label?: 'inside' | 'right' | false;
  /** 项之间的间隙（像素） */
  gap?: number;
  theme?: ChartThemeInput;
  palette?: string[];
  tooltip?: boolean | TooltipConfig;
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  emptyText?: string;
}

/**
 * 漏斗图。
 *
 * 每一项的宽度按数值比例决定，因此它能直观表达「逐层流失」。
 *
 * 注意：漏斗图的面积编码是**非线性的**（梯形面积 ∝ 上下宽之和 × 高），
 * 所以不要用它做精确的比例判断——它擅长的是「看出哪一层掉得最狠」。
 */
export function FunnelChart({
  data = [],
  width = '100%',
  height = 320,
  label = 'inside',
  gap = 4,
  theme: themeInput,
  palette,
  tooltip = true,
  animation = true,
  className,
  style,
  ariaLabel,
  emptyText = '暂无数据',
}: FunnelChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const items = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        color: item.color ?? theme.palette[index % theme.palette.length],
        index,
      })),
    [data, theme.palette],
  );

  const maxValue = useMemo(
    () => Math.max(...items.map((item) => item.value), 1),
    [items],
  );
  const baseValue = items[0]?.value ?? 1;

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  const valueMatrix = useMemo(() => [items.map((item) => item.value)], [items]);
  const transition = useChartTransition(valueMatrix, animConfig);
  const progress = transition.progress;

  const scene = useMemo<SceneNode[]>(() => {
    if (!items.length || size.width <= 0 || size.height <= 0) return [];
    const nodes: SceneNode[] = [];

    const count = items.length;
    const slot = (size.height - gap * (count - 1)) / count;
    // 右侧要留给标签
    const labelSpace = label === 'right' ? Math.min(160, size.width * 0.32) : 0;
    const maxWidth = Math.max(40, (size.width - labelSpace) * 0.82);
    const cx = (size.width - labelSpace) / 2;

    // 每层按自己的局部进度展开，整体呈「从上往下倾泻」的节奏
    const widthOf = (value: number, local: number) =>
      Math.max(4, (value / maxValue) * maxWidth * local);

    items.forEach((item, index) => {
      const local = staggerProgress(progress, index, count, animConfig.stagger);
      const animatedValue = transition.values[0]?.[index] ?? item.value;
      const topWidth = widthOf(animatedValue, local);
      // 最后一项收口，形成漏斗的尖底；其余项以「下一项的宽度」为底边
      const nextValue =
        transition.values[0]?.[index + 1] ?? items[index + 1]?.value ?? 0;
      const nextWidth =
        index < count - 1 ? widthOf(nextValue, local) : topWidth * 0.6;
      const y = index * (slot + gap);
      const isActive = activeIndex === index;

      const x1 = cx - topWidth / 2;
      const x2 = cx + topWidth / 2;
      const x3 = cx + nextWidth / 2;
      const x4 = cx - nextWidth / 2;

      nodes.push({
        kind: 'path',
        key: `funnel-${index}`,
        d: `M${x1},${y}L${x2},${y}L${x3},${y + slot}L${x4},${y + slot}Z`,
        fill: item.color,
        opacity: activeIndex === null || isActive ? 0.92 : 0.5,
        pointerEvents: 'none',
      });

      if (label === 'inside') {
        // 文字放在梯形上沿，宽度不足时跳过，避免文字溢出图形
        if (topWidth > 90 && slot > 26) {
          nodes.push({
            kind: 'text',
            key: `inside-${index}`,
            x: cx,
            y: y + slot / 2,
            text: `${item.name} ${formatNumber(item.value)}`,
            fill: '#fff',
            fontSize: theme.font.size,
            fontWeight: theme.font.weightMedium,
            anchor: 'middle',
            baseline: 'middle',
            opacity: progress,
          });
        }
      }

      if (label === 'right') {
        nodes.push({
          kind: 'line',
          key: `leader-${index}`,
          x1: cx + topWidth / 2,
          y1: y + slot / 2,
          x2: cx + maxWidth / 2 + 10,
          y2: y + slot / 2,
          stroke: withAlpha(theme.axis.line, 0.9),
          strokeWidth: 1,
          pointerEvents: 'none',
        });
        nodes.push({
          kind: 'text',
          key: `label-${index}`,
          x: cx + maxWidth / 2 + 14,
          y: y + slot / 2,
          text: `${item.name}`,
          fill: theme.text.primary,
          fontSize: theme.font.size,
          anchor: 'start',
          baseline: 'middle',
        });
        nodes.push({
          kind: 'text',
          key: `value-${index}`,
          x: cx + maxWidth / 2 + 14,
          y: y + slot / 2 + theme.font.size + 2,
          text: `${formatNumber(item.value)} · ${formatPercent(item.value, baseValue, 1)}`,
          fill: theme.text.secondary,
          fontSize: theme.font.sizeSmall,
          anchor: 'start',
          baseline: 'middle',
        });
      }
    });

    return nodes;
  }, [
    items,
    size.width,
    size.height,
    gap,
    label,
    maxValue,
    baseValue,
    progress,
    theme,
    activeIndex,
    transition.values,
    animConfig.stagger,
  ]);

  const indexFromPointer = useCallback(
    (clientY: number): number | null => {
      const element = ref.current;
      if (!element || !items.length) return null;
      const rect = element.getBoundingClientRect();
      const localY = clientY - rect.top;
      const slot = (size.height - gap * (items.length - 1)) / items.length;
      const index = Math.floor(localY / (slot + gap));
      return index >= 0 && index < items.length ? index : null;
    },
    [ref, items.length, size.height, gap],
  );

  const active = activeIndex !== null ? items[activeIndex] : null;

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
            formatted: `${formatNumber(active.value)}（${formatPercent(active.value, baseValue, 1)}）`,
          },
        ],
      }
    : null;

  const autoAriaLabel =
    ariaLabel ?? `漏斗图：${items.map((item) => item.name).join('、')}`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="funnel"
    >
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) =>
          setActiveIndex(indexFromPointer(event.clientY))
        }
        onPointerLeave={() => setActiveIndex(null)}
      >
        {items.length === 0 || size.width === 0 ? (
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
          y={
            activeIndex !== null
              ? (size.height / items.length) * activeIndex + 4
              : 0
          }
          containerWidth={size.width}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
