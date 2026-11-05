import React, { useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { formatNumber, formatPercent } from '../../core/format';
import { roundedRectPath } from '../../core/shape';
import {
  buildTreemap,
  countLeaves,
  sumValues,
  type HierarchyNode,
  type TreemapCell,
} from '../../core/hierarchy';
import { mixColor, withAlpha, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Tooltip } from '../../components/Tooltip';
import type { ChartAnimationInput, TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface TreemapChartProps {
  /** 根节点；只渲染它的子孙 */
  data?: HierarchyNode;
  /** 展开层数，1 表示只画根的直接子节点，2 表示再往里一层 */
  maxDepth?: number;
  /** 标签策略：auto 时按格子尺寸决定 */
  label?: 'auto' | 'always' | false;
  /** 是否在标签下方显示数值 */
  showValue?: boolean;
  /** 格子间隙（像素） */
  gap?: number;
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

/**
 * 矩形树图。
 *
 * 用面积编码数值，能在有限空间里同时表达「占比」与「层级」。
 * 布局用 squarified 算法：让每块尽量接近正方形，
 * 既放得下文字，也便于人眼比较面积。
 */
export function TreemapChart({
  data,
  maxDepth = 1,
  label = 'auto',
  showValue = true,
  gap = 2,
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
}: TreemapChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  const hierarchy = useMemo(() => {
    if (!data) return { cells: [] as TreemapCell[], total: 0, leaves: 0 };
    const total = sumValues(data);
    if (total <= 0) return { cells: [], total: 0, leaves: countLeaves(data) };

    const cells = buildTreemap(
      data,
      {
        x: 0,
        y: 0,
        width: Math.max(0, size.width),
        height: Math.max(0, size.height),
      },
      {
        maxDepth,
        headerHeight: 18,
        theme,
        colorOf: (depth, index, parentColor) => {
          if (depth === 0) return theme.palette[index % theme.palette.length];
          // 子层用父色向白混合，保持「同一父族颜色相近」的直觉
          return mixColor(parentColor ?? theme.palette[0], '#ffffff', 0.46);
        },
      },
    );

    return { cells, total, leaves: countLeaves(data) };
  }, [data, maxDepth, size.width, size.height, theme]);

  // 用各格面积驱动动画：数据变化时格子平滑伸缩
  const matrix = useMemo(
    () => [hierarchy.cells.map((cell) => Math.round(cell.width * cell.height))],
    [hierarchy.cells],
  );
  const transition = useChartTransition(matrix, animConfig);
  const progress = transition.progress;

  const scene = useMemo<SceneNode[]>(() => {
    if (!hierarchy.cells.length || size.width <= 0) return [];
    const nodes: SceneNode[] = [];

    hierarchy.cells.forEach((cell, index) => {
      const local = staggerProgress(
        progress,
        index,
        hierarchy.cells.length,
        animConfig.stagger,
      );
      const key = `${cell.depth}-${cell.node.name}-${index}`;
      const isActive = activeKey === key;

      nodes.push({
        kind: 'path',
        key,
        d: roundedRectPath(
          cell.x + gap / 2,
          cell.y + gap / 2,
          Math.max(0, cell.width - gap),
          Math.max(0, cell.height - gap),
          3,
        ),
        fill: cell.color,
        // 子层淡一些，形成「父块包着子块」的视觉层次
        opacity: (cell.depth === 0 ? 1 : 0.92) * local,
        stroke: isActive ? theme.text.primary : undefined,
        strokeWidth: isActive ? 2 : 0,
        pointerEvents: 'none',
      });

      const boxWidth = cell.width - gap;
      const boxHeight = cell.height - gap;
      const showLabel =
        label === 'always' ||
        (label === 'auto' && boxWidth >= 56 && boxHeight >= 22) ||
        (cell.depth === 0 && boxWidth >= 56 && boxHeight >= 22);
      if (!showLabel || label === false) return;

      const hasChildren = Boolean(cell.node.children?.length);
      const value = hasChildren ? sumValues(cell.node) : (cell.node.value ?? 0);
      const showNumber = showValue && boxHeight >= 40 && boxWidth >= 56;
      // 有子块的格子把名称放在顶部标题条里；叶子居中
      const labelY = hasChildren
        ? cell.y + 11
        : cell.y + (showNumber ? 16 : boxHeight / 2 + gap);

      nodes.push({
        kind: 'text',
        key: `${key}-label`,
        x: cell.x + 8,
        y: labelY,
        text: cell.node.name,
        fill: '#fff',
        fontSize: cell.depth === 0 ? theme.font.size : theme.font.sizeSmall,
        fontWeight: cell.depth === 0 ? theme.font.weightMedium : undefined,
        anchor: 'start',
        baseline: 'middle',
        opacity: local,
        fontFamily: theme.font.family,
      });

      // 父块的汇总数值放到标题条右端，既不占额外高度又保留信息
      if (hasChildren && showValue && boxWidth >= 130 && boxHeight >= 30) {
        nodes.push({
          kind: 'text',
          key: `${key}-total`,
          x: cell.x + boxWidth - 8,
          y: labelY,
          text: `${formatNumber(value, { compact: true })} · ${formatPercent(value, hierarchy.total, 1)}`,
          fill: withAlpha('#ffffff', 0.85),
          fontSize: theme.font.sizeSmall,
          anchor: 'end',
          baseline: 'middle',
          opacity: local,
          fontFamily: theme.font.family,
        });
      }

      if (showNumber && !hasChildren) {
        nodes.push({
          kind: 'text',
          key: `${key}-value`,
          x: cell.x + 8,
          y: cell.y + 32,
          text: `${formatNumber(value, { compact: true })} · ${formatPercent(value, hierarchy.total, 1)}`,
          fill: withAlpha('#ffffff', 0.82),
          fontSize: theme.font.sizeSmall,
          anchor: 'start',
          baseline: 'middle',
          opacity: local,
          fontFamily: theme.font.family,
        });
      }
    });

    return nodes;
  }, [
    hierarchy,
    size.width,
    gap,
    theme,
    progress,
    animConfig.stagger,
    activeKey,
    label,
    showValue,
  ]);

  /** 命中检测：从后往前找第一个包含点的格子（深层画在上层） */
  const cellFromPointer = (
    clientX: number,
    clientY: number,
  ): TreemapCell | null => {
    const element = ref.current;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (let index = hierarchy.cells.length - 1; index >= 0; index -= 1) {
      const cell = hierarchy.cells[index];
      if (
        x >= cell.x &&
        x <= cell.x + cell.width &&
        y >= cell.y &&
        y <= cell.y + cell.height
      ) {
        return cell;
      }
    }
    return null;
  };

  const activeCell = useMemo(() => {
    if (!activeKey) return null;
    return (
      hierarchy.cells.find(
        (cell, index) =>
          `${cell.depth}-${cell.node.name}-${index}` === activeKey,
      ) ?? null
    );
  }, [activeKey, hierarchy.cells]);

  const tooltipPayload = activeCell
    ? {
        label: activeCell.node.name,
        row: null,
        series: [
          {
            key: activeCell.node.name,
            name: '数值',
            color: activeCell.color,
            value: activeCell.node.value ?? sumValues(activeCell.node),
            formatted: `${formatNumber(activeCell.node.value ?? sumValues(activeCell.node), { compact: true })}（${formatPercent(activeCell.node.value ?? sumValues(activeCell.node), hierarchy.total, 1)}）`,
          },
        ],
      }
    : null;

  const autoAriaLabel =
    ariaLabel ??
    `矩形树图：共 ${hierarchy.leaves} 项，总计 ${formatNumber(hierarchy.total, { compact: true })}`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="treemap"
    >
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) => {
          const cell = cellFromPointer(event.clientX, event.clientY);
          setActiveKey(
            cell
              ? `${cell.depth}-${cell.node.name}-${hierarchy.cells.indexOf(cell)}`
              : null,
          );
        }}
        onPointerLeave={() => setActiveKey(null)}
      >
        {!hierarchy.cells.length || size.width === 0 ? (
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
          x={activeCell ? activeCell.x + activeCell.width / 2 : 0}
          y={activeCell ? activeCell.y + 8 : 0}
          containerWidth={size.width}
          containerHeight={size.height}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
