/** Pie3D 单项数据。 */
export interface Pie3DDatum {
  /** 分类名称。 */
  name: string;
  /** 数值；<= 0 或非有限值会被过滤。 */
  value: number;
  /** 可选自定义颜色，覆盖默认色板。 */
  color?: string;
}

/** 归一化后的单个 3D 扇区模型。 */
export interface Pie3DSlice {
  index: number;
  datum: Pie3DDatum;
  name: string;
  value: number;
  /** 占比（0~1）。 */
  ratio: number;
  /** 起始角（弧度）。 */
  startAngle: number;
  /** 终止角（弧度）。 */
  endAngle: number;
  /** 角平分线方向（弧度），用于径向弹出与标签定位。 */
  midAngle: number;
  /** 实际挤压厚度（世界单位）。 */
  depth: number;
  /** 沿径向弹出的单位方向向量 [x, z]。 */
  explodeDir: [number, number];
  /** 标签悬浮世界坐标 [x, y, z]。 */
  labelPosition: [number, number, number];
}

export interface Pie3DModelOptions {
  radius?: number;
  innerRadius?: number;
  depth?: number;
  heightScale?: boolean;
  padAngle?: number;
}

export interface Pie3DModel {
  slices: Pie3DSlice[];
  total: number;
  radius: number;
  innerRadius: number;
  depth: number;
}

const DEFAULT_RADIUS = 115;
const DEFAULT_INNER_RADIUS = 48;
const DEFAULT_DEPTH = 28;
const DEFAULT_PAD_ANGLE = 0.03;
const TWO_PI = Math.PI * 2;

function positiveOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function nonNegativeOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

/**
 * 业务占比数据 → 3D 饼图/环图纯模型。
 *
 * 自动过滤非正/非有限项；角度按顺时针从 +X 起步，支持可选高度阶梯（高占比更厚）。
 */
export function buildPie3DModel(
  data: readonly Pie3DDatum[] = [],
  options: Pie3DModelOptions = {},
): Pie3DModel {
  const radius = positiveOr(options.radius, DEFAULT_RADIUS);
  const rawInner = nonNegativeOr(options.innerRadius, DEFAULT_INNER_RADIUS);
  const innerRadius = Math.min(rawInner, radius * 0.85);
  const depth = positiveOr(options.depth, DEFAULT_DEPTH);
  const heightScale = options.heightScale ?? true;
  const padAngle = Math.min(
    0.2,
    nonNegativeOr(options.padAngle, DEFAULT_PAD_ANGLE),
  );

  const valid = (Array.isArray(data) ? data : []).filter(
    (item) =>
      Boolean(item) &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
      typeof item.value === 'number' &&
      Number.isFinite(item.value) &&
      item.value > 0,
  );

  if (valid.length === 0) {
    return { slices: [], total: 0, radius, innerRadius, depth };
  }

  const total = valid.reduce((sum, item) => sum + item.value, 0);
  const maxRatio = Math.max(...valid.map((item) => item.value / total));
  const minRatio = Math.min(...valid.map((item) => item.value / total));
  const ratioSpan = maxRatio - minRatio;
  // 只有单个切片时无需缝隙，避免出现缺口
  const effectivePad =
    valid.length > 1 ? Math.min(padAngle, (TWO_PI / valid.length) * 0.35) : 0;

  const slices: Pie3DSlice[] = [];
  let cursor = 0;

  valid.forEach((datum, index) => {
    const ratio = datum.value / total;
    const sweep = ratio * TWO_PI;
    const pad = Math.min(effectivePad, sweep * 0.4);
    const startAngle = cursor + pad / 2;
    const endAngle = cursor + sweep - pad / 2;
    const midAngle = (startAngle + endAngle) / 2;
    cursor += sweep;

    const normalized = ratioSpan > 0 ? (ratio - minRatio) / ratioSpan : 0.5;
    const sliceDepth = heightScale ? depth * (0.65 + normalized * 0.95) : depth;

    // 形状经 rotateX(-Math.PI/2) 平躺后，原 2D (cos, sin) 映射到 3D (cos, 0, -sin)
    const dirX = Math.cos(midAngle);
    const dirZ = -Math.sin(midAngle);
    const labelRadius =
      innerRadius > 0 ? (radius + innerRadius) * 0.52 : radius * 0.65;

    slices.push({
      index,
      datum,
      name: datum.name.trim(),
      value: datum.value,
      ratio,
      startAngle,
      endAngle,
      midAngle,
      depth: sliceDepth,
      explodeDir: [dirX, dirZ],
      labelPosition: [dirX * labelRadius, sliceDepth + 14, dirZ * labelRadius],
    });
  });

  return { slices, total, radius, innerRadius, depth };
}
