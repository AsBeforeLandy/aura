/** Network3D 的节点定义。 */
export interface Network3DNode {
  id: string;
  label?: string;
  category?: string;
  value?: number;
  position?: [number, number, number];
}
/** Network3D 的连线定义。 */
export interface Network3DLink {
  source: string;
  target: string;
  value?: number;
}
export type Network3DLayout = 'force' | 'sphere' | 'grid';
export interface Network3DModelOptions {
  /** 节点基础半径。 @default 5 */
  nodeSize?: number;
  /** 布局方式。 @default 'force' */
  layout?: Network3DLayout;
  /** 布局半径。 @default 140 */
  layoutRadius?: number;
  /** 力布局迭代次数，内部限制为 20～240。 @default 120 */
  iterations?: number;
  /** 力布局随机种子。 @default 7 */
  seed?: number;
}
export interface Network3DModelNode {
  index: number;
  node: Network3DNode;
  id: string;
  label: string;
  category: string;
  value?: number;
  position: [number, number, number];
  radius: number;
  degree: number;
  categoryIndex: number;
  fixed: boolean;
}
export interface Network3DModelLink {
  index: number;
  source: string;
  target: string;
  sourceIndex: number;
  targetIndex: number;
  value?: number;
}
/** buildNetworkModel 的返回结构。 */
export interface Network3DModel {
  nodes: Network3DModelNode[];
  links: Network3DModelLink[];
  categories: string[];
  layout: Network3DLayout;
  layoutRadius: number;
  iterations: number;
}
const DEFAULT_CATEGORY = '未分类';
const DEFAULT_RADIUS = 140;
const DEFAULT_NODE_SIZE = 5;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_SEED = 7;
const MIN_ITERATIONS = 20;
const MAX_ITERATIONS = 240;
const MAX_FORCE_NODES = 600;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const EPSILON = 1e-6;
function isFinitePosition(
  position: [number, number, number] | undefined,
): position is [number, number, number] {
  return (
    Array.isArray(position) &&
    position.length === 3 &&
    Number.isFinite(position[0]) &&
    Number.isFinite(position[1]) &&
    Number.isFinite(position[2])
  );
}
function positiveOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}
function normalizeIterations(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return DEFAULT_ITERATIONS;
  return Math.min(MAX_ITERATIONS, Math.max(MIN_ITERATIONS, Math.trunc(value)));
}
function normalizeSeed(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value)
    ? Math.trunc(value)
    : DEFAULT_SEED;
}
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
function layoutSphere(nodes: Network3DModelNode[], radius: number): void {
  const count = nodes.length;
  nodes.forEach((node, index) => {
    if (node.fixed) return;
    const y = 1 - (2 * (index + 0.5)) / count;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = GOLDEN_ANGLE * index;
    node.position = [
      Math.cos(angle) * ring * radius,
      y * radius,
      Math.sin(angle) * ring * radius,
    ];
  });
}
function layoutGrid(nodes: Network3DModelNode[], radius: number): void {
  const count = nodes.length;
  const side = Math.max(1, Math.ceil(Math.cbrt(count)));
  const spacing = count > 1 ? (radius / side) * 2 : 0;
  const center = (side - 1) / 2;
  nodes.forEach((node, index) => {
    if (node.fixed) return;
    node.position = [
      ((index % side) - center) * spacing,
      ((Math.floor(index / side) % side) - center) * spacing,
      (Math.floor(index / (side * side)) - center) * spacing,
    ];
  });
}
function layoutForce(
  nodes: Network3DModelNode[],
  links: Network3DModelLink[],
  radius: number,
  iterations: number,
  seed: number,
): void {
  const count = nodes.length;
  if (count === 0 || nodes.every((node) => node.fixed)) return;
  const random = createRandom(seed);
  const coordinates = new Float64Array(count * 3);
  nodes.forEach((node, index) => {
    const offset = index * 3;
    if (node.fixed) {
      coordinates[offset] = node.position[0];
      coordinates[offset + 1] = node.position[1];
      coordinates[offset + 2] = node.position[2];
      return;
    }
    const y = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const distance = radius * 0.7 * Math.cbrt(random());
    coordinates[offset] = Math.cos(angle) * ring * distance;
    coordinates[offset + 1] = y * distance;
    coordinates[offset + 2] = Math.sin(angle) * ring * distance;
  });
  const forces = new Float64Array(count * 3);
  const seedBits = seed >>> 0;
  const repulsion = radius * radius * 0.06;
  const desiredLength = radius * 0.26;
  const maxSpeed = Math.max(radius * 0.08, EPSILON);
  const limit = Math.max(radius * 4, EPSILON);
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    forces.fill(0);
    const step = 0.18 * (1 - iteration / iterations);
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const fixedI = nodes[i].fixed;
      for (let j = i + 1; j < count; j += 1) {
        if (fixedI && nodes[j].fixed) continue;
        const j3 = j * 3;
        let dx = coordinates[j3] - coordinates[i3];
        let dy = coordinates[j3 + 1] - coordinates[i3 + 1];
        let dz = coordinates[j3 + 2] - coordinates[i3 + 2];
        let distanceSquared = dx * dx + dy * dy + dz * dz;
        if (distanceSquared < EPSILON) {
          const angle =
            (seedBits + i * 0.754877666 + j * 0.569840296) * Math.PI * 2;
          dx = Math.cos(angle) * 0.01;
          dy = Math.sin(angle) * 0.01;
          dz = Math.cos(angle * 0.5) * 0.01;
          distanceSquared = dx * dx + dy * dy + dz * dz;
        }
        if (!Number.isFinite(distanceSquared)) continue;
        const scale =
          repulsion / (distanceSquared + 1) / Math.sqrt(distanceSquared);
        const fx = dx * scale;
        const fy = dy * scale;
        const fz = dz * scale;
        if (!fixedI) {
          forces[i3] -= fx;
          forces[i3 + 1] -= fy;
          forces[i3 + 2] -= fz;
        }
        if (!nodes[j].fixed) {
          forces[j3] += fx;
          forces[j3 + 1] += fy;
          forces[j3 + 2] += fz;
        }
      }
    }
    for (const link of links) {
      const sourceFixed = nodes[link.sourceIndex].fixed;
      const targetFixed = nodes[link.targetIndex].fixed;
      if (sourceFixed && targetFixed) continue;
      const source = link.sourceIndex * 3;
      const target = link.targetIndex * 3;
      const dx = coordinates[target] - coordinates[source];
      const dy = coordinates[target + 1] - coordinates[source + 1];
      const dz = coordinates[target + 2] - coordinates[source + 2];
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      let distance: number;
      let nx: number;
      let ny: number;
      let nz: number;
      if (distanceSquared <= EPSILON || !Number.isFinite(distanceSquared)) {
        const angle = (seedBits + link.index * 0.618033988) * Math.PI * 2;
        distance = 0;
        nx = Math.cos(angle);
        ny = Math.sin(angle);
        nz = 0;
      } else {
        distance = Math.sqrt(distanceSquared);
        nx = dx / distance;
        ny = dy / distance;
        nz = dz / distance;
      }
      const magnitude = (distance - desiredLength) * 0.025;
      const fx = nx * magnitude;
      const fy = ny * magnitude;
      const fz = nz * magnitude;
      if (!sourceFixed) {
        forces[source] += fx;
        forces[source + 1] += fy;
        forces[source + 2] += fz;
      }
      if (!targetFixed) {
        forces[target] -= fx;
        forces[target + 1] -= fy;
        forces[target + 2] -= fz;
      }
    }
    for (let index = 0; index < count; index += 1) {
      const node = nodes[index];
      if (node.fixed) continue;
      const offset = index * 3;
      let vx = (forces[offset] - coordinates[offset] * 0.004) * step;
      let vy = (forces[offset + 1] - coordinates[offset + 1] * 0.004) * step;
      let vz = (forces[offset + 2] - coordinates[offset + 2] * 0.004) * step;
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const damping = speed > maxSpeed ? maxSpeed / speed : 1;
      vx *= damping;
      vy *= damping;
      vz *= damping;
      for (let axis = 0; axis < 3; axis += 1) {
        const movement = axis === 0 ? vx : axis === 1 ? vy : vz;
        const next = coordinates[offset + axis] + movement;
        coordinates[offset + axis] = Number.isFinite(next)
          ? Math.max(-limit, Math.min(limit, next))
          : 0;
      }
    }
  }
  nodes.forEach((node, index) => {
    if (node.fixed) return;
    const offset = index * 3;
    node.position = [
      coordinates[offset],
      coordinates[offset + 1],
      coordinates[offset + 2],
    ];
  });
}
/** 清洗网络数据并生成确定性布局；force 超过 600 节点时退化为 sphere。 */
export function buildNetworkModel(
  nodes: readonly Network3DNode[] = [],
  links: readonly Network3DLink[] = [],
  options: Network3DModelOptions = {},
): Network3DModel {
  const categories: string[] = [];
  const categoryIndexes = new Map<string, number>();
  const seenIds = new Set<string>();
  const modelNodes: Network3DModelNode[] = [];
  const sourceNodes = Array.isArray(nodes) ? nodes : [];
  for (const node of sourceNodes) {
    if (
      !node ||
      typeof node.id !== 'string' ||
      node.id.trim().length === 0 ||
      seenIds.has(node.id)
    ) {
      continue;
    }
    if (node.value !== undefined && !Number.isFinite(node.value)) continue;
    seenIds.add(node.id);
    const category =
      typeof node.category === 'string' && node.category.trim()
        ? node.category.trim()
        : DEFAULT_CATEGORY;
    let categoryIndex = categoryIndexes.get(category);
    if (categoryIndex === undefined) {
      categoryIndex = categories.length;
      categories.push(category);
      categoryIndexes.set(category, categoryIndex);
    }
    const fixedPosition = isFinitePosition(node.position)
      ? node.position
      : undefined;
    modelNodes.push({
      index: modelNodes.length,
      node,
      id: node.id,
      label:
        typeof node.label === 'string' && node.label.trim()
          ? node.label.trim()
          : node.id,
      category,
      value: node.value,
      position: fixedPosition
        ? [fixedPosition[0], fixedPosition[1], fixedPosition[2]]
        : [0, 0, 0],
      radius: 0,
      degree: 0,
      categoryIndex,
      fixed: fixedPosition !== undefined,
    });
  }
  const indexes = new Map(
    modelNodes.map((node) => [node.id, node.index] as const),
  );
  const modelLinks: Network3DModelLink[] = [];
  const sourceLinks = Array.isArray(links) ? links : [];
  for (const link of sourceLinks) {
    if (
      !link ||
      typeof link.source !== 'string' ||
      typeof link.target !== 'string'
    ) {
      continue;
    }
    const sourceIndex = indexes.get(link.source);
    const targetIndex = indexes.get(link.target);
    if (
      sourceIndex === undefined ||
      targetIndex === undefined ||
      sourceIndex === targetIndex ||
      (link.value !== undefined && !Number.isFinite(link.value))
    ) {
      continue;
    }
    modelLinks.push({
      index: modelLinks.length,
      source: link.source,
      target: link.target,
      sourceIndex,
      targetIndex,
      value: link.value,
    });
    modelNodes[sourceIndex].degree += 1;
    modelNodes[targetIndex].degree += 1;
  }
  let minValue = Number.POSITIVE_INFINITY;
  let maxValue = Number.NEGATIVE_INFINITY;
  for (const node of modelNodes) {
    if (node.value === undefined) continue;
    minValue = Math.min(minValue, node.value);
    maxValue = Math.max(maxValue, node.value);
  }
  const span = maxValue - minValue;
  const nodeSize = positiveOr(options.nodeSize, DEFAULT_NODE_SIZE);
  for (const node of modelNodes) {
    const ratio =
      node.value === undefined || !Number.isFinite(span) || span === 0
        ? 0.5
        : Math.max(0, Math.min(1, (node.value - minValue) / span));
    const radius = nodeSize * (0.8 + ratio * 0.4);
    node.radius = Number.isFinite(radius) ? Math.max(0.001, radius) : nodeSize;
  }
  const requestedLayout: Network3DLayout =
    options.layout === 'sphere' || options.layout === 'grid'
      ? options.layout
      : 'force';
  const layout =
    requestedLayout === 'force' && modelNodes.length > MAX_FORCE_NODES
      ? 'sphere'
      : requestedLayout;
  const layoutRadius = positiveOr(options.layoutRadius, DEFAULT_RADIUS);
  const iterations = normalizeIterations(options.iterations);
  const seed = normalizeSeed(options.seed);
  if (layout === 'sphere') layoutSphere(modelNodes, layoutRadius);
  else if (layout === 'grid') layoutGrid(modelNodes, layoutRadius);
  else layoutForce(modelNodes, modelLinks, layoutRadius, iterations, seed);
  return {
    nodes: modelNodes,
    links: modelLinks,
    categories,
    layout,
    layoutRadius,
    iterations,
  };
}
