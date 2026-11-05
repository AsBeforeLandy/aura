import React, { useCallback, useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { formatNumber, estimateTextWidth } from '../../core/format';
import { withAlpha, type ChartThemeInput } from '../../theme';
import {
  layoutForce,
  type ForceLink,
  type ForceNode,
  type ForceNodePosition,
} from '../../core/force';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Tooltip } from '../../components/Tooltip';
import type { ChartAnimationInput, TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface GraphChartProps {
  nodes?: ForceNode[];
  links?: ForceLink[];
  /** 力导向迭代次数，节点多时适当调低 */
  iterations?: number;
  /** 基础半径 */
  nodeSize?: number;
  /** 是否显示节点名称（节点少时才建议开） */
  showLabel?: boolean;
  /** 是否按连接数放大节点 */
  scaleByDegree?: boolean;
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
 * 关系图（力导向）。
 *
 * 节点两两相斥、有连边的相互吸引，最终收敛成「抱团」的形状：
 * 连得紧的聚成一簇，孤立的被推到边缘。这是一种**探索**型图表——
 * 它的价值是让你看到结构，而不是读出精确数值。
 */
export function GraphChart({
  nodes = [],
  links = [],
  iterations = 220,
  nodeSize = 7,
  showLabel = true,
  scaleByDegree = true,
  width = '100%',
  height = 380,
  theme: themeInput,
  palette,
  tooltip = true,
  animation = true,
  className,
  style,
  ariaLabel,
  emptyText = '暂无数据',
}: GraphChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [activeId, setActiveId] = useState<string | null>(null);

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  const groups = useMemo(() => {
    const list: string[] = [];
    nodes.forEach((node) => {
      const group = node.group ?? '__default__';
      if (!list.includes(group)) list.push(group);
    });
    return list;
  }, [nodes]);

  const positions = useMemo<ForceNodePosition[]>(() => {
    if (!nodes.length || size.width <= 0) return [];
    return layoutForce(
      nodes,
      links,
      { x: 0, y: 0, width: size.width, height: size.height },
      { iterations, radius: nodeSize + 4 },
    );
  }, [nodes, links, size.width, size.height, iterations, nodeSize]);

  const positionMap = useMemo(
    () => new Map(positions.map((item) => [item.id, item])),
    [positions],
  );

  const maxDegree = Math.max(1, ...positions.map((item) => item.degree));

  const radiusOf = useCallback(
    (position: ForceNodePosition): number => {
      if (!scaleByDegree) return nodeSize;
      // 连接越多半径越大，但限制在 2.2 倍以内，避免中心节点吞掉整张图
      return nodeSize * (1 + Math.min(1.2, position.degree / maxDegree) * 1.2);
    },
    [scaleByDegree, nodeSize, maxDegree],
  );

  const colorOf = useCallback(
    (node: ForceNode): string => {
      const groupIndex = groups.indexOf(node.group ?? '__default__');
      return theme.palette[Math.max(0, groupIndex) % theme.palette.length];
    },
    [groups, theme.palette],
  );

  const degreeMatrix = useMemo(
    () => [positions.map((item) => item.degree)],
    [positions],
  );
  const progress = useChartTransition(degreeMatrix, animConfig).progress;

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const link of links) {
      if (!map.has(link.source)) map.set(link.source, new Set());
      if (!map.has(link.target)) map.set(link.target, new Set());
      map.get(link.source)!.add(link.target);
      map.get(link.target)!.add(link.source);
    }
    return map;
  }, [links]);

  const scene = useMemo<SceneNode[]>(() => {
    if (!positions.length || size.width <= 0) return [];
    const nodes_: SceneNode[] = [];

    // 边
    links.forEach((link, index) => {
      const from = positionMap.get(link.source);
      const to = positionMap.get(link.target);
      if (!from || !to) return;
      const related =
        activeId === null ||
        activeId === link.source ||
        activeId === link.target;
      nodes_.push({
        kind: 'line',
        key: `edge-${index}`,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        stroke:
          related && activeId !== null
            ? theme.emphasis
            : withAlpha(theme.axis.line, 0.9),
        strokeWidth: related && activeId !== null ? 1.6 : 1,
        opacity: (related ? 1 : 0.25) * progress,
        pointerEvents: 'none',
      });
    });

    // 节点
    positions.forEach((position, index) => {
      const node = nodes.find((item) => item.id === position.id);
      if (!node) return;
      const baseRadius = radiusOf(position);
      const local = staggerProgress(
        progress,
        index,
        positions.length,
        animConfig.stagger,
      );
      const radius = baseRadius * local;
      const isActive = activeId === position.id;
      const isNeighbor = activeId
        ? (neighbors.get(activeId)?.has(position.id) ?? false)
        : false;
      const dim = activeId !== null && !isActive && !isNeighbor;

      nodes_.push({
        kind: 'circle',
        key: `node-${position.id}`,
        cx: position.x,
        cy: position.y,
        r: Math.max(0.5, radius),
        fill: colorOf(node),
        opacity: dim ? 0.28 : 1,
        stroke: isActive ? theme.text.primary : undefined,
        strokeWidth: isActive ? 2 : 0,
        pointerEvents: 'none',
      });

      if (!showLabel || radius < 4) return;
      const label = node.name ?? node.id;
      // 标签最多占 20% 画布宽度，超了就截断
      const maxWidth = size.width * 0.2;
      const text =
        estimateTextWidth(label, theme.font.sizeSmall) > maxWidth
          ? `${label.slice(0, Math.max(2, Math.floor(maxWidth / theme.font.sizeSmall)))}…`
          : label;

      nodes_.push({
        kind: 'text',
        key: `label-${position.id}`,
        x: position.x,
        y: position.y + radius + theme.font.sizeSmall + 2,
        text,
        fill: theme.text.secondary,
        fontSize: theme.font.sizeSmall,
        anchor: 'middle',
        baseline: 'middle',
        opacity: dim ? 0.3 : local,
        fontFamily: theme.font.family,
      });
    });

    return nodes_;
  }, [
    positions,
    links,
    positionMap,
    nodes,
    theme,
    activeId,
    neighbors,
    progress,
    animConfig.stagger,
    showLabel,
    size.width,
    radiusOf,
    colorOf,
  ]);

  const nodeFromPointer = (clientX: number, clientY: number): string | null => {
    const element = ref.current;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let nearest: string | null = null;
    let min = Number.POSITIVE_INFINITY;
    for (const position of positions) {
      const distance = Math.hypot(position.x - x, position.y - y);
      const hit = radiusOf(position) + 6;
      if (distance <= hit && distance < min) {
        min = distance;
        nearest = position.id;
      }
    }
    return nearest;
  };

  const activeNode = activeId
    ? nodes.find((node) => node.id === activeId)
    : null;
  const activePosition = activeId ? positionMap.get(activeId) : null;
  const tooltipPayload = activeNode
    ? {
        label: activeNode.name ?? activeNode.id,
        row: null,
        series: [
          {
            key: 'degree',
            name: '连接数',
            color: colorOf(activeNode),
            value: activePosition?.degree ?? 0,
            formatted: formatNumber(activePosition?.degree ?? 0),
          },
        ],
      }
    : null;

  const autoAriaLabel =
    ariaLabel ?? `关系图：${nodes.length} 个节点，${links.length} 条关系`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="graph"
    >
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) =>
          setActiveId(nodeFromPointer(event.clientX, event.clientY))
        }
        onPointerLeave={() => setActiveId(null)}
      >
        {!positions.length || size.width === 0 ? (
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
          x={activePosition ? activePosition.x : 0}
          y={activePosition ? activePosition.y - 20 : 0}
          containerWidth={size.width}
          containerHeight={size.height}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
