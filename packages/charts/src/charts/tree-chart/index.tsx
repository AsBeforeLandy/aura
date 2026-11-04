import React, { useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { formatNumber } from '../../core/format';
import {
  layoutTree,
  maxDepth,
  sumValues,
  treeLinkPath,
  type HierarchyNode,
  type TreeLayoutNode,
} from '../../core/hierarchy';
import { withAlpha, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Tooltip } from '../../components/Tooltip';
import type { ChartAnimationInput, TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface TreeChartProps {
  data?: HierarchyNode;
  /** 节点圆点半径 */
  nodeSize?: number;
  /** 是否显示节点数值 */
  showValue?: boolean;
  /** 叶子到右边界预留的标签宽度 */
  labelSpace?: number;
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
 * 树图（横向展开）。
 *
 * 与矩形树图的分工：矩形树图用面积编码数值、回答「谁占得多」；
 * 树图只表达层级结构与从属关系，节点大小恒定。
 *
 * 纵向位置按叶子顺序均分，父节点取子节点均值 —— 这样连线不交叉，
 * 同一父节点下的兄弟会自然聚成一簇。
 */
export function TreeChart({
  data,
  nodeSize = 4,
  showValue = false,
  labelSpace = 96,
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
}: TreeChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  const layout = useMemo(() => {
    if (!data) return { nodes: [] as TreeLayoutNode[], depth: 0 };
    return layoutTree(data, {
      x: 12,
      y: 16,
      // 右侧留出文字空间，否则最深一层的标签会被裁掉
      width: Math.max(0, size.width - 24 - labelSpace),
      height: Math.max(0, size.height - 32),
    });
  }, [data, size.width, size.height, labelSpace]);

  // 用叶子数驱动：结构变化时节点位置平滑过渡
  const matrix = useMemo(
    () => [layout.nodes.map((item) => Math.round(item.y))],
    [layout.nodes],
  );
  const transition = useChartTransition(matrix, animConfig);
  const progress = transition.progress;

  const scene = useMemo<SceneNode[]>(() => {
    if (!layout.nodes.length || size.width <= 0) return [];
    const nodes: SceneNode[] = [];
    const depthTotal = Math.max(1, maxDepth(data ?? { name: '' }));

    // 先画连线，保证节点压在线上
    layout.nodes.forEach((item, index) => {
      if (item.parent < 0) return;
      const parent = layout.nodes[item.parent];
      const local = staggerProgress(
        progress,
        item.depth,
        depthTotal,
        animConfig.stagger,
      );
      const animatedParent = {
        ...parent,
        y: transition.values[0]?.[item.parent] ?? parent.y,
      };
      const animatedChild = {
        ...item,
        y: transition.values[0]?.[index] ?? item.y,
      };
      nodes.push({
        kind: 'path',
        key: `link-${index}`,
        d: treeLinkPath(animatedParent, animatedChild, nodeSize),
        fill: 'none',
        stroke: withAlpha(theme.axis.line, 0.9),
        strokeWidth: 1.2,
        opacity: local,
        pointerEvents: 'none',
      });
    });

    layout.nodes.forEach((item, index) => {
      const y = transition.values[0]?.[index] ?? item.y;
      const isActive = activeIndex === index;
      const hasChildren = Boolean(item.node.children?.length);
      const local = staggerProgress(
        progress,
        item.depth,
        depthTotal,
        animConfig.stagger,
      );
      const color = hasChildren
        ? theme.emphasis
        : (item.node.color ?? theme.palette[item.depth % theme.palette.length]);

      nodes.push({
        kind: 'circle',
        key: `node-${index}`,
        cx: item.x,
        cy: y,
        r: isActive ? nodeSize + 2 : nodeSize,
        fill: hasChildren ? theme.tooltip.background : color,
        stroke: color,
        strokeWidth: hasChildren ? 2 : 0,
        opacity: local,
        pointerEvents: 'none',
      });

      nodes.push({
        kind: 'text',
        key: `label-${index}`,
        x: item.x + nodeSize + 8,
        y,
        text:
          showValue && item.node.value !== undefined
            ? `${item.node.name} ${formatNumber(item.node.value, { compact: true })}`
            : item.node.name,
        fill: hasChildren ? theme.text.primary : theme.text.secondary,
        fontSize: theme.font.size,
        fontWeight: hasChildren ? theme.font.weightMedium : undefined,
        anchor: 'start',
        baseline: 'middle',
        opacity: local,
        fontFamily: theme.font.family,
      });
    });

    return nodes;
  }, [
    layout,
    size.width,
    data,
    theme,
    progress,
    animConfig.stagger,
    activeIndex,
    nodeSize,
    showValue,
    transition.values,
  ]);

  const nodeFromPointer = (clientX: number, clientY: number): number | null => {
    const element = ref.current;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let nearest: number | null = null;
    let min = 18; // 命中半径，节点本身只有 4px，必须放宽
    layout.nodes.forEach((item, index) => {
      const distance = Math.hypot(item.x - x, item.y - y);
      if (distance < min) {
        min = distance;
        nearest = index;
      }
    });
    return nearest;
  };

  const active = activeIndex !== null ? layout.nodes[activeIndex] : null;
  const tooltipPayload = active
    ? {
        label: active.node.name,
        row: null,
        series: [
          {
            key: 'value',
            name: active.node.children?.length ? '合计' : '数值',
            color: theme.emphasis,
            value: sumValues(active.node),
            formatted: formatNumber(sumValues(active.node), { compact: true }),
          },
        ],
      }
    : null;

  const autoAriaLabel = ariaLabel ?? `树图：${layout.nodes.length} 个节点`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="tree"
    >
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) =>
          setActiveIndex(nodeFromPointer(event.clientX, event.clientY))
        }
        onPointerLeave={() => setActiveIndex(null)}
      >
        {!layout.nodes.length || size.width === 0 ? (
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
          x={active ? active.x : 0}
          y={active ? active.y - 12 : 0}
          containerWidth={size.width}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
