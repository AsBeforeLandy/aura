export interface ForceNode {
  id: string;
  name?: string;
  /** 分组名，用于配色 */
  group?: string;
  /** 节点权重，影响半径（缺省按连接数） */
  size?: number;
}

export interface ForceLink {
  source: string;
  target: string;
  value?: number;
}

export interface ForceLayoutOptions {
  /** 迭代次数，越多越稳定但越慢 */
  iterations?: number;
  /** 节点半径，用于把节点约束在画布内 */
  radius?: number;
}

export interface ForceNodePosition {
  id: string;
  x: number;
  y: number;
  /** 连接数，可用于决定半径 */
  degree: number;
}

/** 确定性伪随机：同一个 seed 恒定，保证 SSR 与截图一致 */
function pseudo(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * 力导向布局（Fruchterman–Reingold）。
 *
 * 把图当成物理系统：节点两两相斥、有连边的相互吸引，
 * 每轮按「温度」限制最大位移，温度线性冷却到 0 后收敛。
 *
 * 初始位置用「圆环 + 确定性扰动」而不是随机散布：
 * 随机数会让同一份数据在每次刷新时长得不一样，也不利于截图对比；
 * 圆环本身已经足够均匀，能让迭代更快收敛。
 */
export function layoutForce(
  nodes: ForceNode[],
  links: ForceLink[],
  rect: { x: number; y: number; width: number; height: number },
  options: ForceLayoutOptions = {},
): ForceNodePosition[] {
  const count = nodes.length;
  if (count === 0) return [];

  const { iterations = 220, radius = 8 } = options;
  const indexOf = new Map(nodes.map((node, index) => [node.id, index]));

  const xs = new Array<number>(count);
  const ys = new Array<number>(count);
  const degrees = new Array<number>(count).fill(0);

  const valid: { a: number; b: number }[] = [];
  for (const link of links) {
    const a = indexOf.get(link.source);
    const b = indexOf.get(link.target);
    if (a === undefined || b === undefined || a === b) continue;
    valid.push({ a, b });
    degrees[a] += 1;
    degrees[b] += 1;
  }

  // 初始：圆环 + 轻微扰动（单节点时居中）
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const ringRadius = Math.min(rect.width, rect.height) * 0.34;
  for (let index = 0; index < count; index += 1) {
    if (count === 1) {
      xs[index] = cx;
      ys[index] = cy;
      continue;
    }
    const angle = (index / count) * Math.PI * 2;
    const jitter = (pseudo(index + 1) - 0.5) * ringRadius * 0.35;
    xs[index] = cx + Math.cos(angle) * (ringRadius + jitter);
    ys[index] = cy + Math.sin(angle) * (ringRadius + jitter);
  }

  if (count === 1) {
    return [{ id: nodes[0].id, x: cx, y: cy, degree: 0 }];
  }

  const area = Math.max(1, rect.width * rect.height);
  const k = Math.sqrt(area / count);
  const margin = radius + 2;

  let temperature = Math.min(rect.width, rect.height) / 8;

  for (let step = 0; step < iterations; step += 1) {
    const dx = new Array<number>(count).fill(0);
    const dy = new Array<number>(count).fill(0);

    // 斥力：所有节点两两排斥
    for (let i = 0; i < count; i += 1) {
      for (let j = i + 1; j < count; j += 1) {
        let deltaX = xs[i] - xs[j];
        let deltaY = ys[i] - ys[j];
        let distance = Math.hypot(deltaX, deltaY);
        if (distance < 0.01) {
          // 完全重合时给一个确定性的偏移方向，避免除零
          deltaX = (pseudo(i + j + 1) - 0.5) * 0.1;
          deltaY = (pseudo(i + j + 2) - 0.5) * 0.1;
          distance = 0.01;
        }
        const force = (k * k) / distance;
        const ux = deltaX / distance;
        const uy = deltaY / distance;
        dx[i] += ux * force;
        dy[i] += uy * force;
        dx[j] -= ux * force;
        dy[j] -= uy * force;
      }
    }

    // 引力：有连边的相互吸引
    for (const { a, b } of valid) {
      let deltaX = xs[a] - xs[b];
      let deltaY = ys[a] - ys[b];
      let distance = Math.hypot(deltaX, deltaY);
      if (distance < 0.01) {
        deltaX = 0.01;
        deltaY = 0;
        distance = 0.01;
      }
      const force = (distance * distance) / k;
      const ux = deltaX / distance;
      const uy = deltaY / distance;
      dx[a] -= ux * force;
      dy[a] -= uy * force;
      dx[b] += ux * force;
      dy[b] += uy * force;
    }

    // 按温度限制位移，并夹在画布内
    for (let index = 0; index < count; index += 1) {
      const length = Math.hypot(dx[index], dy[index]) || 1;
      const limited = Math.min(length, temperature);
      xs[index] += (dx[index] / length) * limited;
      ys[index] += (dy[index] / length) * limited;

      xs[index] = Math.min(
        rect.x + rect.width - margin,
        Math.max(rect.x + margin, xs[index]),
      );
      ys[index] = Math.min(
        rect.y + rect.height - margin,
        Math.max(rect.y + margin, ys[index]),
      );
    }

    temperature = Math.max(0.5, temperature * 0.975);
  }

  return nodes.map((node, index) => ({
    id: node.id,
    x: xs[index],
    y: ys[index],
    degree: degrees[index],
  }));
}
