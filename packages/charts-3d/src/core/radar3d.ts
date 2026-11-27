/** Radar3D 评估维度定义。 */
export interface Radar3DIndicator {
  /** 维度名称。 */
  name: string;
  /** 该维度满分上限；缺省按全系列该维度最大值自动推导。 */
  max?: number;
}

/** Radar3D 单条多维对比系列。 */
export interface Radar3DSeries {
  /** 系列名称（如模型名、方案名）。 */
  name: string;
  /** 与 indicators 顺序一一对应的分值；非有限值按 0。 */
  values: number[];
  /** 可选自定义颜色。 */
  color?: string;
}

export interface Radar3DPoint {
  seriesIndex: number;
  indicatorIndex: number;
  seriesName: string;
  indicatorName: string;
  value: number;
  max: number;
  ratio: number;
  position: [number, number, number];
}

export interface Radar3DModelSeries {
  index: number;
  name: string;
  color?: string;
  elevation: number;
  points: Radar3DPoint[];
  /** 填充多边形三角面顶点坐标（每 3 个顶点一个三角形）。 */
  fillPositions: number[];
  /** 闭合高亮边框线段坐标（lineSegments）。 */
  outlinePositions: number[];
}

export interface Radar3DModelIndicator {
  index: number;
  name: string;
  max: number;
  angle: number;
  outerPosition: [number, number, number];
  labelPosition: [number, number, number];
}

export interface Radar3DModelOptions {
  radius?: number;
  layerHeight?: number;
  rings?: number;
}

export interface Radar3DModel {
  indicators: Radar3DModelIndicator[];
  series: Radar3DModelSeries[];
  allPoints: Radar3DPoint[];
  /** 底层同心蛛网环 + 放射轴线坐标（lineSegments）。 */
  webLines: number[];
  /** 外圈垂直标尺细柱线段坐标（lineSegments）。 */
  pillarLines: number[];
  radius: number;
  layerHeight: number;
  topElevation: number;
}

const DEFAULT_RADIUS = 115;
const DEFAULT_LAYER_HEIGHT = 28;
const DEFAULT_RINGS = 4;

function positiveOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

/**
 * 多维评估数据 → 3D 分层立体雷达纯模型。
 *
 * 至少需要 3 个维度才构成封闭雷达多边形；多系列沿 Y 轴等距分层悬浮，
 * 避免 2D 雷达重叠遮挡。
 */
export function buildRadar3DModel(
  indicators: readonly Radar3DIndicator[] = [],
  series: readonly Radar3DSeries[] = [],
  options: Radar3DModelOptions = {},
): Radar3DModel {
  const radius = positiveOr(options.radius, DEFAULT_RADIUS);
  const layerHeight = positiveOr(options.layerHeight, DEFAULT_LAYER_HEIGHT);
  const rings = Math.max(
    1,
    Math.min(8, Math.trunc(positiveOr(options.rings, DEFAULT_RINGS))),
  );

  const validIndicators = (Array.isArray(indicators) ? indicators : []).filter(
    (item) =>
      Boolean(item) &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0,
  );
  const validSeries = (Array.isArray(series) ? series : []).filter(
    (item) =>
      Boolean(item) &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
      Array.isArray(item.values),
  );

  if (validIndicators.length < 3) {
    return {
      indicators: [],
      series: [],
      allPoints: [],
      webLines: [],
      pillarLines: [],
      radius,
      layerHeight,
      topElevation: 0,
    };
  }

  const dimCount = validIndicators.length;
  const resolvedMax: number[] = validIndicators.map((ind, idx) => {
    if (
      typeof ind.max === 'number' &&
      Number.isFinite(ind.max) &&
      ind.max > 0
    ) {
      return ind.max;
    }
    let derived = 0;
    for (const s of validSeries) {
      const v = s.values[idx];
      if (typeof v === 'number' && Number.isFinite(v) && v > derived) {
        derived = v;
      }
    }
    return derived > 0 ? derived : 100;
  });

  const modelIndicators: Radar3DModelIndicator[] = validIndicators.map(
    (ind, idx) => {
      // 从 -Z（正前方偏北）顺时针分布各维度轴
      const angle = (idx / dimCount) * Math.PI * 2 - Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        index: idx,
        name: ind.name.trim(),
        max: resolvedMax[idx],
        angle,
        outerPosition: [cos * radius, 0, sin * radius],
        labelPosition: [cos * (radius + 24), 4, sin * (radius + 24)],
      };
    },
  );

  // 底层蛛网：同心多边形环 + 放射轴线
  const webLines: number[] = [];
  for (let ring = 1; ring <= rings; ring += 1) {
    const r = (ring / rings) * radius;
    for (let i = 0; i < dimCount; i += 1) {
      const a0 = modelIndicators[i].angle;
      const a1 = modelIndicators[(i + 1) % dimCount].angle;
      webLines.push(
        Math.cos(a0) * r,
        0,
        Math.sin(a0) * r,
        Math.cos(a1) * r,
        0,
        Math.sin(a1) * r,
      );
    }
  }
  for (const ind of modelIndicators) {
    webLines.push(0, 0, 0, ind.outerPosition[0], 0, ind.outerPosition[2]);
  }

  const topElevation = Math.max(
    layerHeight,
    validSeries.length * layerHeight + 10,
  );
  const pillarLines: number[] = [];
  for (const ind of modelIndicators) {
    pillarLines.push(
      ind.outerPosition[0],
      0,
      ind.outerPosition[2],
      ind.outerPosition[0],
      topElevation,
      ind.outerPosition[2],
    );
  }

  const allPoints: Radar3DPoint[] = [];
  const modelSeries: Radar3DModelSeries[] = validSeries.map((s, sIdx) => {
    const elevation = (sIdx + 1) * layerHeight;
    const points: Radar3DPoint[] = modelIndicators.map((ind, iIdx) => {
      const raw = s.values[iIdx];
      const value =
        typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, raw) : 0;
      const ratio = Math.min(1, value / ind.max);
      const r = Math.max(4, ratio * radius);
      const point: Radar3DPoint = {
        seriesIndex: sIdx,
        indicatorIndex: iIdx,
        seriesName: s.name.trim(),
        indicatorName: ind.name,
        value,
        max: ind.max,
        ratio,
        position: [Math.cos(ind.angle) * r, elevation, Math.sin(ind.angle) * r],
      };
      allPoints.push(point);
      return point;
    });

    // 从该层中心扇形剖分为 dimCount 个三角面
    const fillPositions: number[] = [];
    const outlinePositions: number[] = [];
    for (let i = 0; i < dimCount; i += 1) {
      const a = points[i].position;
      const b = points[(i + 1) % dimCount].position;
      fillPositions.push(0, elevation, 0, a[0], a[1], a[2], b[0], b[1], b[2]);
      outlinePositions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }

    return {
      index: sIdx,
      name: s.name.trim(),
      color: s.color,
      elevation,
      points,
      fillPositions,
      outlinePositions,
    };
  });

  return {
    indicators: modelIndicators,
    series: modelSeries,
    allPoints,
    webLines,
    pillarLines,
    radius,
    layerHeight,
    topElevation,
  };
}
