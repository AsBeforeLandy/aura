import React, { useMemo, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import {
  formatNumber,
  formatPercent,
  estimateTextWidth,
} from '../../core/format';
import { withAlpha, type ChartThemeInput } from '../../theme';
import {
  layoutSankey,
  type SankeyLinkInput,
  type SankeyLinkPath,
  type SankeyNode,
} from '../../core/sankey';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import { Tooltip } from '../../components/Tooltip';
import type { ChartAnimationInput, TooltipConfig } from '../../types';
import '../../components/chart.less';

export interface SankeyChartProps {
  /** 节点列表；只传 links 时会自动从 links 推导 */
  nodes?: SankeyNode[];
  links?: SankeyLinkInput[];
  /** 节点矩形宽度 */
  nodeWidth?: number;
  /** 同层节点竖向间隙 */
  nodeGap?: number;
  /** 是否在节点旁显示流量数值 */
  showValue?: boolean;
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
 * 桑基图。
 *
 * 用带宽编码流量，用节点位置编码阶段，一眼能看出「东西从哪来、到哪去、路上漏了多少」。
 *
 * 与漏斗图的区别：漏斗只能表达单链路层层递减，桑基能表达分流与合流。
 */
export function SankeyChart({
  nodes: nodesProp,
  links = [],
  nodeWidth = 12,
  nodeGap = 10,
  showValue = true,
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
}: SankeyChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [activeLink, setActiveLink] = useState<SankeyLinkPath | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  /** 只给 links 时，按出现顺序补出节点 */
  const nodes = useMemo<SankeyNode[]>(() => {
    if (nodesProp?.length) return nodesProp;
    const seen = new Set<string>();
    const derived: SankeyNode[] = [];
    for (const link of links) {
      if (!seen.has(link.source)) {
        seen.add(link.source);
        derived.push({ name: link.source });
      }
      if (!seen.has(link.target)) {
        seen.add(link.target);
        derived.push({ name: link.target });
      }
    }
    return derived;
  }, [nodesProp, links]);

  const total = useMemo(
    () => links.reduce((sum, link) => sum + (link.value || 0), 0) || 1,
    [links],
  );

  // 左右各留出标签空间
  const labelSpace = 92;
  const layout = useMemo(
    () =>
      layoutSankey(
        nodes,
        links,
        {
          x: labelSpace,
          y: 12,
          width: Math.max(0, size.width - labelSpace * 2),
          height: Math.max(0, size.height - 24),
        },
        {
          nodeWidth,
          nodeGap,
          colorOf: (layer, index) =>
            theme.palette[(layer * 2 + index) % theme.palette.length],
        },
      ),
    [nodes, links, size.width, size.height, nodeWidth, nodeGap, theme.palette],
  );

  const valueMatrix = useMemo(
    () => [layout.links.map((link) => Math.round(link.value))],
    [layout.links],
  );
  const progress = useChartTransition(valueMatrix, animConfig).progress;

  const scene = useMemo<SceneNode[]>(() => {
    if (!layout.nodes.length || size.width <= 0) return [];
    const nodes: SceneNode[] = [];

    // 链接先画，节点压在上面
    layout.links.forEach((link, index) => {
      const local = staggerProgress(
        progress,
        link.source.layer,
        layout.layers,
        animConfig.stagger,
      );
      const isActive =
        activeLink?.source.name === link.source.name &&
        activeLink?.target.name === link.target.name &&
        activeLink.value === link.value;
      nodes.push({
        kind: 'path',
        key: `link-${index}`,
        d: link.d,
        fill: withAlpha(link.color, isActive ? 0.55 : 0.26),
        opacity: local,
        pointerEvents: 'none',
      });
    });

    layout.nodes.forEach((node, index) => {
      const local = staggerProgress(
        progress,
        node.layer,
        layout.layers,
        animConfig.stagger,
      );
      const isActive = activeNode === node.name;

      nodes.push({
        kind: 'rect',
        key: `node-${node.name}`,
        x: node.x,
        y: node.y,
        width: node.width,
        height: Math.max(2, node.height * local),
        radius: 2,
        fill: node.color,
        stroke: isActive ? theme.text.primary : undefined,
        strokeWidth: isActive ? 2 : 0,
        pointerEvents: 'none',
      });

      // 首尾两列标签放节点外侧，中间列放内侧；内侧会被色带压住，
      // 所以文字统一带白色光晕
      const isLastLayer = node.layer === layout.layers - 1;
      const onLeft = node.layer === 0 || isLastLayer;
      const labelX = onLeft ? node.x - 8 : node.x + node.width + 8;
      const maxLabelWidth = onLeft ? labelX - 4 : size.width - labelX - 4;
      if (maxLabelWidth < 24) return;

      const label =
        showValue && node.layer === layout.layers - 1
          ? `${node.name} ${formatNumber(node.value, { compact: true })}`
          : node.name;
      const text =
        estimateTextWidth(label, theme.font.size) > maxLabelWidth
          ? `${label.slice(0, Math.max(2, Math.floor(maxLabelWidth / theme.font.size)))}…`
          : label;

      nodes.push({
        kind: 'text',
        key: `node-label-${node.name}-${index}`,
        x: labelX,
        y: node.y + node.height / 2,
        text,
        fill: isActive ? theme.text.primary : theme.text.secondary,
        fontSize: theme.font.size,
        anchor: onLeft ? 'end' : 'start',
        baseline: 'middle',
        opacity: local,
        fontFamily: theme.font.family,
        // 光晕：文字压在色带上也读得清
        stroke: theme.tooltip.background,
        strokeWidth: 3,
      });
    });

    return nodes;
  }, [
    layout,
    size.width,
    theme,
    progress,
    animConfig.stagger,
    activeLink,
    activeNode,
    showValue,
  ]);

  const linkFromPointer = (
    clientX: number,
    clientY: number,
  ): SankeyLinkPath | null => {
    const element = ref.current;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // 节点优先
    for (const node of layout.nodes) {
      if (
        x >= node.x - 2 &&
        x <= node.x + node.width + 2 &&
        y >= node.y &&
        y <= node.y + node.height
      ) {
        setActiveNode(node.name);
        return null;
      }
    }
    setActiveNode(null);

    // 链接：按 x 在两端之间做线性插值，得到该处的带状区间
    for (const link of layout.links) {
      const x0 = link.source.x + link.source.width;
      const x1 = link.target.x;
      if (x < x0 || x > x1 || x1 <= x0) continue;
      const ratio = (x - x0) / (x1 - x0);
      const top = link.sourceY + (link.targetY - link.sourceY) * ratio;
      const thickness =
        link.sourceThickness +
        (link.targetThickness - link.sourceThickness) * ratio;
      if (y >= top && y <= top + thickness) return link;
    }
    return null;
  };

  const tooltipPayload = activeLink
    ? {
        label: `${activeLink.source.name} → ${activeLink.target.name}`,
        row: null,
        series: [
          {
            key: 'value',
            name: '流量',
            color: activeLink.color,
            value: activeLink.value,
            formatted: `${formatNumber(activeLink.value, { compact: true })}（${formatPercent(activeLink.value, total, 1)}）`,
          },
        ],
      }
    : activeNode
      ? (() => {
          const node = layout.nodes.find((item) => item.name === activeNode);
          if (!node) return null;
          return {
            label: node.name,
            row: null,
            series: [
              {
                key: 'value',
                name: '流量',
                color: node.color,
                value: node.value,
                formatted: formatNumber(node.value, { compact: true }),
              },
            ],
          };
        })()
      : null;

  const autoAriaLabel =
    ariaLabel ??
    `桑基图：${layout.nodes.length} 个节点，${layout.links.length} 条流向`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="sankey"
    >
      <div
        ref={ref}
        className={prefixCls('chart__plot')}
        onPointerMove={(event) => {
          const link = linkFromPointer(event.clientX, event.clientY);
          setActiveLink(link);
        }}
        onPointerLeave={() => {
          setActiveLink(null);
          setActiveNode(null);
        }}
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
          x={
            activeLink
              ? (activeLink.source.x + activeLink.target.x) / 2
              : size.width / 2
          }
          y={12}
          containerWidth={size.width}
          containerHeight={size.height}
          theme={theme}
          config={tooltip}
        />
      </div>
    </div>
  );
}
