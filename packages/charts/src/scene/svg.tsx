import React from 'react';
import type { SceneNode } from './types';

/**
 * 场景 → SVG 元素。
 *
 * 为什么 SVG 是默认渲染器：
 *   · 每个图元都是真实 DOM，可被测试查询、可被无障碍工具读取；
 *   · 打印/导出为矢量不失真；
 *   · 主题换色只是改属性，无需重绘位图。
 * 数据量超过阈值时切 Canvas（见 canvas.ts）。
 */
function renderNode(node: SceneNode): React.ReactElement | null {
  const common = {
    opacity: node.opacity,
    pointerEvents: node.pointerEvents,
  } as const;

  switch (node.kind) {
    case 'group':
      return (
        <g key={node.key} transform={node.transform} {...common}>
          {node.children.map(renderNode)}
        </g>
      );
    case 'rect':
      return (
        <rect
          key={node.key}
          x={node.x}
          y={node.y}
          width={Math.max(0, node.width)}
          height={Math.max(0, node.height)}
          rx={node.radius}
          ry={node.radius}
          fill={node.fill ?? 'none'}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          strokeDasharray={node.strokeDasharray}
          {...common}
        />
      );
    case 'path':
      return (
        <path
          key={node.key}
          d={node.d}
          fill={node.fill ?? 'none'}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          strokeDasharray={node.strokeDasharray}
          strokeLinecap={node.linecap}
          strokeLinejoin={node.linejoin}
          {...common}
        />
      );
    case 'circle':
      return (
        <circle
          key={node.key}
          cx={node.cx}
          cy={node.cy}
          r={Math.max(0, node.r)}
          fill={node.fill ?? 'none'}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          {...common}
        />
      );
    case 'line':
      return (
        <line
          key={node.key}
          x1={node.x1}
          y1={node.y1}
          x2={node.x2}
          y2={node.y2}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth ?? 1}
          strokeDasharray={node.strokeDasharray}
          {...common}
        />
      );
    case 'text':
      return (
        <text
          key={node.key}
          x={node.x}
          y={node.y}
          fill={node.fill}
          fontSize={node.fontSize}
          fontWeight={node.fontWeight}
          fontFamily={node.fontFamily}
          textAnchor={node.anchor ?? 'start'}
          dominantBaseline={
            node.baseline === 'middle'
              ? 'central'
              : node.baseline === 'hanging'
                ? 'hanging'
                : 'auto'
          }
          transform={
            node.rotate
              ? `rotate(${node.rotate} ${node.x} ${node.y})`
              : undefined
          }
          {...common}
        >
          {node.text}
        </text>
      );
    default:
      return null;
  }
}

export interface SvgSceneProps {
  nodes: SceneNode[];
  width: number;
  height: number;
  /** 无障碍描述 */
  ariaLabel?: string;
  className?: string;
}

export function SvgScene({
  nodes,
  width,
  height,
  ariaLabel,
  className,
}: SvgSceneProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}
    >
      {nodes.map(renderNode)}
    </svg>
  );
}
