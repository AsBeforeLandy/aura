import type { ChartTheme } from '../theme';

/** 层级数据：叶子节点用 value，分支节点可不填（由子节点求和） */
export interface HierarchyNode {
  name: string;
  value?: number;
  children?: HierarchyNode[];
  color?: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 递归求和：分支节点取子节点之和，叶子取自身 value */
export function sumValues(node: HierarchyNode): number {
  if (node.children?.length) {
    return node.children.reduce((sum, child) => sum + sumValues(child), 0);
  }
  return Math.max(0, node.value ?? 0);
}

/** 叶子总数，用于树图的纵向排布 */
export function countLeaves(node: HierarchyNode): number {
  if (!node.children?.length) return 1;
  return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

/** 树的最大深度（根为 0） */
export function maxDepth(node: HierarchyNode, depth = 0): number {
  if (!node.children?.length) return depth;
  return Math.max(...node.children.map((child) => maxDepth(child, depth + 1)));
}

export interface TreemapCell extends Rect {
  node: HierarchyNode;
  /** 层级深度，根的直接子节点为 0 */
  depth: number;
  /** 归一化数值（0~1），用于颜色深浅 */
  ratio: number;
  /** 该格最终使用的颜色（顶层取色板，子层继承父色的浅化版） */
  color: string;
}

/**
 * Squarified Treemap 布局（Bruls, Huizing & van Wijk, 2000）。
 *
 * 为什么不用「交替横竖切」（slice-and-dice）：那个算法会产生极端细长的矩形，
 * 面积虽然对得上，但细条既放不下文字、也难以目测比较。
 * squarified 通过逐行控制最差宽高比，让每块尽量接近正方形。
 */
export function squarify(values: number[], rect: Rect): Rect[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0 || rect.width <= 0 || rect.height <= 0) {
    return values.map(() => ({ x: rect.x, y: rect.y, width: 0, height: 0 }));
  }

  // 按面积降序，squarified 的前提是大块先摆
  const order = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value);

  const result: Rect[] = values.map(() => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }));
  const area = rect.width * rect.height;
  const scale = area / total;

  let free: Rect = { ...rect };
  let cursor = 0;

  while (cursor < order.length) {
    const shortSide = Math.min(free.width, free.height);
    if (shortSide <= 0) break;

    // 贪心地把当前行填到「宽高比不再变好」为止
    const row: { value: number; index: number }[] = [];
    let rowSum = 0;
    let bestRatio = Number.POSITIVE_INFINITY;

    while (cursor < order.length) {
      const candidate = order[cursor];
      const nextSum = rowSum + candidate.value;
      const ratio = worstAspectRatio(
        [...row.map((item) => item.value), candidate.value],
        nextSum * scale,
        shortSide,
      );
      if (row.length === 0 || ratio <= bestRatio) {
        row.push(candidate);
        rowSum = nextSum;
        bestRatio = ratio;
        cursor += 1;
      } else {
        break;
      }
    }

    // 摆放这一行
    const rowArea = rowSum * scale;
    const horizontal = free.width >= free.height;
    // 沿短边铺：短边是高时竖着排，短边是宽时横着排
    const thickness =
      rowArea / Math.max(1e-6, horizontal ? free.height : free.width);

    let offset = 0;
    for (const item of row) {
      const length = (item.value * scale) / Math.max(1e-6, thickness);
      if (horizontal) {
        result[item.index] = {
          x: free.x,
          y: free.y + offset,
          width: thickness,
          height: length,
        };
      } else {
        result[item.index] = {
          x: free.x + offset,
          y: free.y,
          width: length,
          height: thickness,
        };
      }
      offset += length;
    }

    if (horizontal) {
      free = {
        x: free.x + thickness,
        y: free.y,
        width: Math.max(0, free.width - thickness),
        height: free.height,
      };
    } else {
      free = {
        x: free.x,
        y: free.y + thickness,
        width: free.width,
        height: Math.max(0, free.height - thickness),
      };
    }
  }

  return result;
}

/**
 * 一行的最差宽高比。
 *
 * 公式来自原论文：给定行内各块面积、该行总面积与所在边的长度，
 * 返回值越接近 1，矩形越接近正方形。
 */
function worstAspectRatio(
  row: number[],
  rowArea: number,
  side: number,
): number {
  if (rowArea <= 0 || side <= 0) return Number.POSITIVE_INFINITY;
  const max = Math.max(...row);
  const min = Math.min(...row);
  if (min <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(
    (side * side * max) / (rowArea * rowArea),
    (rowArea * rowArea) / (side * side * min),
  );
}

export interface TreemapOptions {
  /** 最多展开到第几层（0 表示只画根的直接子节点） */
  maxDepth?: number;
  theme: ChartTheme;
  /**
   * 取色函数。depth 为 0 时返回顶层颜色；
   * 更深层通常返回父色的浅化版本。
   */
  colorOf?: (depth: number, index: number, parentColor?: string) => string;
  /**
   * 会继续展开的格子，在顶部预留的标题条高度。
   * 不留这条，父级名称会被子块直接盖住。
   */
  headerHeight?: number;
}

/**
 * 递归铺满：先对根的直接子节点做 squarify，再在每个矩形内部继续切分。
 */
export function buildTreemap(
  root: HierarchyNode,
  rect: Rect,
  options: TreemapOptions,
): TreemapCell[] {
  const {
    maxDepth: depthLimit = 1,
    theme,
    colorOf,
    headerHeight = 0,
  } = options;
  const cells: TreemapCell[] = [];
  const total = sumValues(root) || 1;

  const walk = (
    node: HierarchyNode,
    area: Rect,
    depth: number,
    parentColor?: string,
  ) => {
    const children = node.children ?? [];
    // depth 是「本层要渲染的层级」：maxDepth=1 时只渲染 depth 0
    if (!children.length || depth >= depthLimit) return;

    const values = children.map(sumValues);
    const rects = squarify(values, area);

    children.forEach((child, index) => {
      const box = rects[index];
      if (box.width <= 0 || box.height <= 0) return;

      const color =
        child.color ??
        colorOf?.(depth, index, parentColor) ??
        theme.palette[index % theme.palette.length];

      cells.push({
        node: child,
        depth,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        ratio: Math.min(1, sumValues(child) / total),
        color,
      });

      // 该格还会继续展开时，把子块的区域向下让出标题条
      const willExpand =
        Boolean(child.children?.length) && depth + 1 < depthLimit;
      const inner =
        willExpand && headerHeight > 0 && box.height > headerHeight + 24
          ? {
              x: box.x,
              y: box.y + headerHeight,
              width: box.width,
              height: box.height - headerHeight,
            }
          : box;

      walk(child, inner, depth + 1, color);
    });
  };

  walk(root, rect, 0);
  return cells;
}

export interface TreeLayoutNode {
  node: HierarchyNode;
  depth: number;
  x: number;
  y: number;
  /** 父节点在返回数组中的下标，根为 -1 */
  parent: number;
}

/**
 * 树图布局：横向展开（深度 → x），纵向按叶子顺序均分。
 *
 * 父节点的 y 取子节点 y 的均值，这样连线不会交叉，
 * 也让「同一父节点下的兄弟」在视觉上聚成一簇。
 */
export function layoutTree(
  root: HierarchyNode,
  rect: Rect,
): { nodes: TreeLayoutNode[]; depth: number } {
  const depth = Math.max(1, maxDepth(root));
  const leaves = Math.max(1, countLeaves(root));
  const rowHeight = rect.height / leaves;
  const columnWidth = depth > 0 ? rect.width / depth : rect.width;

  const nodes: TreeLayoutNode[] = [];
  let leafCursor = 0;

  const walk = (node: HierarchyNode, level: number, parent: number): number => {
    const index = nodes.length;
    const x = rect.x + level * columnWidth;
    nodes.push({ node, depth: level, x, y: 0, parent });

    if (!node.children?.length) {
      const y = rect.y + leafCursor * rowHeight + rowHeight / 2;
      leafCursor += 1;
      nodes[index].y = y;
      return y;
    }

    const childYs = node.children.map((child) => walk(child, level + 1, index));
    const y =
      childYs.reduce((sum, value) => sum + value, 0) /
      Math.max(1, childYs.length);
    nodes[index].y = y;
    return y;
  };

  walk(root, 0, -1);
  return { nodes, depth };
}

/** 树图连线：正交折线（父 → 子），比贝塞尔更清晰地表达层级 */
export function treeLinkPath(
  parent: TreeLayoutNode,
  child: TreeLayoutNode,
  nodeWidth: number,
): string {
  const x1 = parent.x + nodeWidth;
  const y1 = parent.y;
  const x2 = child.x;
  const y2 = child.y;
  const midX = x1 + (x2 - x1) / 2;
  return `M${x1},${y1}H${midX}V${y2}H${x2}`;
}
