/**
 * 场景图节点定义。
 *
 * 图表不复用 React 元素树做几何描述（那样 Canvas 渲染器无从下手），
 * 而是先算出一份纯数据化的「场景」：一组带坐标的图元。
 * 于是：
 *   · SVG 渲染器 = 场景 → React 元素；
 *   · Canvas 渲染器 = 场景 → 2D 绘制指令。
 * 两者消费同一份场景，天然保持一致。
 */

export type TextAnchor = 'start' | 'middle' | 'end';
export type TextBaseline = 'auto' | 'middle' | 'hanging' | 'alphabetic';

interface Base {
  key: string;
  opacity?: number;
  /** 鼠标事件穿透控制；tooltip 命中区通常需要真实事件 */
  pointerEvents?: 'auto' | 'none';
}

export interface GroupNode extends Base {
  kind: 'group';
  children: SceneNode[];
  transform?: string;
}

export interface RectNode extends Base {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface PathNode extends Base {
  kind: 'path';
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  linecap?: 'butt' | 'round' | 'square';
  linejoin?: 'miter' | 'round' | 'bevel';
}

export interface CircleNode extends Base {
  kind: 'circle';
  cx: number;
  cy: number;
  r: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface LineNode extends Base {
  kind: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface TextNode extends Base {
  kind: 'text';
  x: number;
  y: number;
  text: string;
  fill?: string;
  fontSize?: number;
  fontWeight?: number;
  anchor?: TextAnchor;
  baseline?: TextBaseline;
  /** 绕自身锚点旋转的度数（x 轴刻度标签拥挤时用） */
  rotate?: number;
  fontFamily?: string;
}

export type SceneNode =
  GroupNode | RectNode | PathNode | CircleNode | LineNode | TextNode;

/** 递归统计节点数，便于性能告警与测试断言 */
export function countNodes(nodes: readonly SceneNode[]): number {
  let total = 0;
  for (const node of nodes) {
    total += 1;
    if (node.kind === 'group') total += countNodes(node.children);
  }
  return total;
}
