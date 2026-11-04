export interface SankeyNode {
  name: string;
  color?: string;
}

export interface SankeyLinkInput {
  source: string;
  target: string;
  value: number;
}

export interface SankeyNodeBox {
  name: string;
  layer: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 该节点的流量（取流入与流出的较大者） */
  value: number;
  color: string;
}

export interface SankeyLinkPath {
  source: SankeyNodeBox;
  target: SankeyNodeBox;
  value: number;
  color: string;
  /** 带状路径，直接用于 path 节点 */
  d: string;
  /** 源端带口的上沿与厚度 */
  sourceY: number;
  sourceThickness: number;
  /** 目标端带口的上沿与厚度 */
  targetY: number;
  targetThickness: number;
}

export interface SankeyLayoutOptions {
  /** 节点矩形宽度 */
  nodeWidth?: number;
  /** 同层节点之间的竖向间隙 */
  nodeGap?: number;
  /** 节点默认颜色（按层取色） */
  colorOf: (layer: number, index: number) => string;
}

export interface SankeyLayoutResult {
  nodes: SankeyNodeBox[];
  links: SankeyLinkPath[];
  layers: number;
}

/**
 * 桑基图布局。
 *
 * 三步：
 *   1. 拓扑分层 —— 用最长路径（每层取所有前驱的最大层 + 1），
 *      保证一条链路从左到右不回头；
 *   2. 层内堆叠 —— 每层总流量归一化到可用高度，节点按流量占比占高；
 *   3. 端口分配 —— 同一节点上的多条链路按顺序切分它的一条边，
 *      这样带宽之和恰好等于节点高度。
 *
 * 含环的数据无法拓扑排序，这里用「松弛 n 轮后停止」兜底，
 * 而不是抛错 —— 展示型图表遇到脏数据应该画出来，而不是白屏。
 */
export function layoutSankey(
  nodes: SankeyNode[],
  links: SankeyLinkInput[],
  rect: { x: number; y: number; width: number; height: number },
  options: SankeyLayoutOptions,
): SankeyLayoutResult {
  const { nodeWidth = 12, nodeGap = 10, colorOf } = options;
  if (!nodes.length || !links.length)
    return { nodes: [], links: [], layers: 0 };

  const names = nodes.map((node) => node.name);
  const exists = new Set(names);
  const validLinks = links.filter(
    (link) =>
      exists.has(link.source) &&
      exists.has(link.target) &&
      link.source !== link.target &&
      Number.isFinite(link.value) &&
      link.value > 0,
  );
  if (!validLinks.length) return { nodes: [], links: [], layers: 0 };

  // ---- 1. 拓扑分层 ----
  const layer = new Map<string, number>();
  names.forEach((name) => layer.set(name, 0));

  for (let round = 0; round < names.length; round += 1) {
    let changed = false;
    for (const link of validLinks) {
      const next = (layer.get(link.source) ?? 0) + 1;
      if (next > (layer.get(link.target) ?? 0) && next < names.length) {
        layer.set(link.target, next);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const maxLayer = Math.max(...Array.from(layer.values()));
  const layers = maxLayer + 1;

  // ---- 2. 节点流量与层内堆叠 ----
  const inflow = new Map<string, number>();
  const outflow = new Map<string, number>();
  for (const link of validLinks) {
    outflow.set(link.source, (outflow.get(link.source) ?? 0) + link.value);
    inflow.set(link.target, (inflow.get(link.target) ?? 0) + link.value);
  }

  const valueOf = (name: string) =>
    Math.max(inflow.get(name) ?? 0, outflow.get(name) ?? 0);

  const columnGap = (rect.width - nodeWidth * layers) / Math.max(1, layers - 1);
  const boxes = new Map<string, SankeyNodeBox>();

  for (let current = 0; current < layers; current += 1) {
    const column = names.filter((name) => (layer.get(name) ?? 0) === current);
    if (!column.length) continue;

    const totalFlow = column.reduce((sum, name) => sum + valueOf(name), 0) || 1;
    const available = rect.height - nodeGap * (column.length - 1);
    const scale = available / totalFlow;

    let cursor = rect.y;
    column.forEach((name, index) => {
      const value = valueOf(name);
      const height = Math.max(2, value * scale);
      const node = nodes.find((item) => item.name === name);
      boxes.set(name, {
        name,
        layer: current,
        x: rect.x + current * (nodeWidth + columnGap),
        y: cursor,
        width: nodeWidth,
        height,
        value,
        color: node?.color ?? colorOf(current, index),
      });
      cursor += height + nodeGap;
    });
  }

  // ---- 3. 端口分配 ----
  // 源节点按目标层序排列、目标节点按源层序排列，避免带状交叉成一团
  const sourceCursor = new Map<string, number>();
  const targetCursor = new Map<string, number>();
  names.forEach((name) => {
    const box = boxes.get(name);
    if (box) {
      sourceCursor.set(name, box.y);
      targetCursor.set(name, box.y);
    }
  });

  const sortedLinks = [...validLinks].sort((a, b) => {
    const layerDiff = (layer.get(a.target) ?? 0) - (layer.get(b.target) ?? 0);
    if (layerDiff !== 0) return layerDiff;
    return (layer.get(a.source) ?? 0) - (layer.get(b.source) ?? 0);
  });

  const paths: SankeyLinkPath[] = [];
  for (const link of sortedLinks) {
    const source = boxes.get(link.source);
    const target = boxes.get(link.target);
    if (!source || !target) continue;

    const sourceTotal = Math.max(1, valueOf(source.name));
    const targetTotal = Math.max(1, valueOf(target.name));
    const sourceThickness = (link.value / sourceTotal) * source.height;
    const targetThickness = (link.value / targetTotal) * target.height;

    const y0 = sourceCursor.get(source.name) ?? source.y;
    const y1 = targetCursor.get(target.name) ?? target.y;
    sourceCursor.set(source.name, y0 + sourceThickness);
    targetCursor.set(target.name, y1 + targetThickness);

    const x0 = source.x + source.width;
    const x1 = target.x;
    const midX = x0 + (x1 - x0) / 2;

    paths.push({
      source,
      target,
      value: link.value,
      color: source.color,
      d: `M${x0},${y0}C${midX},${y0} ${midX},${y1} ${x1},${y1}L${x1},${y1 + targetThickness}C${midX},${y1 + targetThickness} ${midX},${y0 + sourceThickness} ${x0},${y0 + sourceThickness}Z`,
      sourceY: y0,
      sourceThickness,
      targetY: y1,
      targetThickness,
    });
  }

  return {
    nodes: Array.from(boxes.values()),
    links: paths,
    layers,
  };
}
