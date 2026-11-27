/** Ribbon3D 单条趋势系列。 */
export interface Ribbon3DSeries {
  /** 系列名称。 */
  name: string;
  /** 与 categories 对应的数值序列；非有限值按 0 处理。 */
  values: number[];
  /** 可选自定义颜色。 */
  color?: string;
}

export interface Ribbon3DPoint {
  seriesIndex: number;
  pointIndex: number;
  seriesName: string;
  category: string;
  value: number;
  ratio: number;
  position: [number, number, number];
}

export interface Ribbon3DGeometryData {
  positions: number[];
  normals: number[];
  /** 顶点垂向高度比例（0 = 底面，1 = 顶部脊线），用于着色渐变。 */
  heightRatios: number[];
  indices: number[];
  /** 顶部高光脊线坐标（按连续折线排列）。 */
  ridgePositions: number[];
}

export interface Ribbon3DModelSeries {
  index: number;
  name: string;
  color?: string;
  z: number;
  points: Ribbon3DPoint[];
  geometry: Ribbon3DGeometryData;
}

export interface Ribbon3DModelOptions {
  width?: number;
  depth?: number;
  maxHeight?: number;
  thickness?: number;
  smooth?: boolean;
}

export interface Ribbon3DModel {
  categories: string[];
  series: Ribbon3DModelSeries[];
  allPoints: Ribbon3DPoint[];
  min: number;
  max: number;
  width: number;
  depth: number;
  maxHeight: number;
  xPositions: number[];
}

const DEFAULT_WIDTH = 280;
const DEFAULT_DEPTH = 180;
const DEFAULT_MAX_HEIGHT = 125;
const DEFAULT_THICKNESS = 8;

function positiveOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

/** Catmull-Rom 1D 样条插值，在控制点间生成平滑曲线且严格穿过原始节点。 */
function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** 构造单条带厚度封闭立体丝带墙几何数据（前/后/顶/底/两端面）。 */
function buildRibbonMesh(
  samples: readonly [number, number][],
  z: number,
  thickness: number,
  maxHeight: number,
): Ribbon3DGeometryData {
  const positions: number[] = [];
  const normals: number[] = [];
  const heightRatios: number[] = [];
  const indices: number[] = [];
  const ridgePositions: number[] = [];

  if (samples.length < 2) {
    return { positions, normals, heightRatios, indices, ridgePositions };
  }

  const halfT = thickness / 2;
  const zFront = z + halfT;
  const zBack = z - halfT;
  const count = samples.length;

  const pushVertex = (
    x: number,
    y: number,
    vz: number,
    nx: number,
    ny: number,
    nz: number,
    hr: number,
  ): number => {
    const idx = positions.length / 3;
    positions.push(x, y, vz);
    normals.push(nx, ny, nz);
    heightRatios.push(hr);
    return idx;
  };

  const pushQuad = (a: number, b: number, c: number, d: number) => {
    indices.push(a, b, c, a, c, d);
  };

  for (let i = 0; i < count; i += 1) {
    const [x, y] = samples[i];
    ridgePositions.push(x, y + 0.6, z);
  }

  // 1) 前面 (+Z)
  const frontStart = positions.length / 3;
  for (let i = 0; i < count; i += 1) {
    const [x, y] = samples[i];
    const hr = maxHeight > 0 ? Math.min(1, Math.max(0, y / maxHeight)) : 0;
    pushVertex(x, 0, zFront, 0, 0, 1, 0);
    pushVertex(x, y, zFront, 0, 0, 1, hr);
  }
  for (let i = 0; i < count - 1; i += 1) {
    const b0 = frontStart + i * 2;
    const t0 = b0 + 1;
    const b1 = b0 + 2;
    const t1 = b0 + 3;
    pushQuad(b0, b1, t1, t0);
  }

  // 2) 背面 (-Z)
  const backStart = positions.length / 3;
  for (let i = 0; i < count; i += 1) {
    const [x, y] = samples[i];
    const hr = maxHeight > 0 ? Math.min(1, Math.max(0, y / maxHeight)) : 0;
    pushVertex(x, 0, zBack, 0, 0, -1, 0);
    pushVertex(x, y, zBack, 0, 0, -1, hr);
  }
  for (let i = 0; i < count - 1; i += 1) {
    const b0 = backStart + i * 2;
    const t0 = b0 + 1;
    const b1 = b0 + 2;
    const t1 = b0 + 3;
    pushQuad(b0, t0, t1, b1);
  }

  // 3) 顶面（平滑波浪顶脊，法线按切线正交计算）
  const topStart = positions.length / 3;
  for (let i = 0; i < count; i += 1) {
    const [x, y] = samples[i];
    const prev = samples[Math.max(0, i - 1)];
    const next = samples[Math.min(count - 1, i + 1)];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const hr = maxHeight > 0 ? Math.min(1, Math.max(0, y / maxHeight)) : 0;
    pushVertex(x, y, zFront, nx, ny, 0, hr);
    pushVertex(x, y, zBack, nx, ny, 0, hr);
  }
  for (let i = 0; i < count - 1; i += 1) {
    const f0 = topStart + i * 2;
    const k0 = f0 + 1;
    const f1 = f0 + 2;
    const k1 = f0 + 3;
    pushQuad(f0, f1, k1, k0);
  }

  // 4) 左/右端盖
  const [x0, y0] = samples[0];
  const hr0 = maxHeight > 0 ? Math.min(1, Math.max(0, y0 / maxHeight)) : 0;
  const lb = pushVertex(x0, 0, zBack, -1, 0, 0, 0);
  const lf = pushVertex(x0, 0, zFront, -1, 0, 0, 0);
  const ltf = pushVertex(x0, y0, zFront, -1, 0, 0, hr0);
  const ltb = pushVertex(x0, y0, zBack, -1, 0, 0, hr0);
  pushQuad(lb, lf, ltf, ltb);

  const [xn, yn] = samples[count - 1];
  const hrn = maxHeight > 0 ? Math.min(1, Math.max(0, yn / maxHeight)) : 0;
  const rf = pushVertex(xn, 0, zFront, 1, 0, 0, 0);
  const rb = pushVertex(xn, 0, zBack, 1, 0, 0, 0);
  const rtb = pushVertex(xn, yn, zBack, 1, 0, 0, hrn);
  const rtf = pushVertex(xn, yn, zFront, 1, 0, 0, hrn);
  pushQuad(rf, rb, rtb, rtf);

  return { positions, normals, heightRatios, indices, ridgePositions };
}

/**
 * 多系列时序数据 → 三维面积丝带纯模型。
 *
 * 沿 Z 轴等距错落排布各条序列，避免 2D 多折线重叠缠绕；支持样条平滑采样。
 */
export function buildRibbon3DModel(
  categories: readonly string[] = [],
  series: readonly Ribbon3DSeries[] = [],
  options: Ribbon3DModelOptions = {},
): Ribbon3DModel {
  const width = positiveOr(options.width, DEFAULT_WIDTH);
  const depth = positiveOr(options.depth, DEFAULT_DEPTH);
  const maxHeight = positiveOr(options.maxHeight, DEFAULT_MAX_HEIGHT);
  const thickness = Math.min(
    depth * 0.4,
    positiveOr(options.thickness, DEFAULT_THICKNESS),
  );
  const smooth = options.smooth ?? true;

  const validSeries = (Array.isArray(series) ? series : []).filter(
    (item) =>
      Boolean(item) &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
      Array.isArray(item.values) &&
      item.values.length > 0,
  );

  const maxLen = validSeries.reduce(
    (acc, item) => Math.max(acc, item.values.length),
    0,
  );
  const resolvedCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories.slice(0, Math.max(categories.length, maxLen))
      : Array.from({ length: maxLen }, (_, idx) => `${idx + 1}`);
  const pointCount = Math.min(
    resolvedCategories.length,
    Math.max(maxLen, resolvedCategories.length),
  );

  if (validSeries.length === 0 || pointCount === 0) {
    return {
      categories: [],
      series: [],
      allPoints: [],
      min: 0,
      max: 0,
      width,
      depth,
      maxHeight,
      xPositions: [],
    };
  }

  // 计算全局值域（基线从 0 起步，若存在负值则自动扩展下界）
  let min = 0;
  let max = Number.NEGATIVE_INFINITY;
  validSeries.forEach((item) => {
    for (let i = 0; i < pointCount; i += 1) {
      const raw = item.values[i];
      const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  });
  if (!Number.isFinite(max)) max = 0;
  const span = max - min;

  const xPositions = Array.from({ length: pointCount }, (_, idx) =>
    pointCount > 1 ? (idx / (pointCount - 1) - 0.5) * width : 0,
  );

  const allPoints: Ribbon3DPoint[] = [];
  const modelSeries: Ribbon3DModelSeries[] = validSeries.map((item, sIdx) => {
    const z =
      validSeries.length > 1
        ? (sIdx / (validSeries.length - 1) - 0.5) * depth
        : 0;
    const rawXY: [number, number][] = [];
    const points: Ribbon3DPoint[] = [];

    for (let pIdx = 0; pIdx < pointCount; pIdx += 1) {
      const raw = item.values[pIdx];
      const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
      const ratio =
        span > 0 ? Math.max(0, Math.min(1, (value - min) / span)) : 0.5;
      const y = Math.max(2, ratio * maxHeight);
      const x = xPositions[pIdx];
      rawXY.push([x, y]);
      const point: Ribbon3DPoint = {
        seriesIndex: sIdx,
        pointIndex: pIdx,
        seriesName: item.name.trim(),
        category: resolvedCategories[pIdx] ?? `${pIdx + 1}`,
        value,
        ratio,
        position: [x, y, z],
      };
      points.push(point);
      allPoints.push(point);
    }

    // 样条加密：每段细分为 8 步并夹紧 y >= 2 防止过冲穿透底面
    const samples: [number, number][] = [];
    if (smooth && rawXY.length >= 2) {
      const steps = 8;
      for (let i = 0; i < rawXY.length - 1; i += 1) {
        const p0 = rawXY[Math.max(0, i - 1)];
        const p1 = rawXY[i];
        const p2 = rawXY[i + 1];
        const p3 = rawXY[Math.min(rawXY.length - 1, i + 2)];
        for (let step = 0; step < steps; step += 1) {
          const t = step / steps;
          const sx = p1[0] + (p2[0] - p1[0]) * t;
          const sy = Math.max(
            2,
            Math.min(
              maxHeight * 1.04,
              catmullRom(p0[1], p1[1], p2[1], p3[1], t),
            ),
          );
          samples.push([sx, sy]);
        }
      }
      samples.push(rawXY[rawXY.length - 1]);
    } else {
      samples.push(...rawXY);
    }

    return {
      index: sIdx,
      name: item.name.trim(),
      color: item.color,
      z,
      points,
      geometry: buildRibbonMesh(samples, z, thickness, maxHeight),
    };
  });

  return {
    categories: resolvedCategories.slice(0, pointCount),
    series: modelSeries,
    allPoints,
    min,
    max,
    width,
    depth,
    maxHeight,
    xPositions,
  };
}
