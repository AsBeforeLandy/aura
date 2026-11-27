/** Funnel3D 单层阶段数据。 */
export interface Funnel3DStage {
  /** 阶段名称。 */
  name: string;
  /** 阶段数值；<= 0 或非有限值会被过滤。 */
  value: number;
  /** 可选自定义颜色。 */
  color?: string;
}

export type Funnel3DVariant = 'funnel' | 'pyramid';
export type Funnel3DShape = 'round' | 'hex' | 'square';

/** 归一化后的单个 3D 圆台/棱台层模型。 */
export interface Funnel3DModelStage {
  index: number;
  stage: Funnel3DStage;
  name: string;
  value: number;
  /** 相对于最大值的宽度比例（0~1）。 */
  ratio: number;
  /** 相对首层的累计转化率（0~1）。 */
  overallRate: number;
  /** 相对上一层的单步转化率（0~1）。 */
  stepRate: number;
  /** 顶部半径（世界单位）。 */
  topRadius: number;
  /** 底部半径（世界单位）。 */
  bottomRadius: number;
  /** 本层高度（世界单位）。 */
  height: number;
  /** 本层中心 Y 坐标（世界单位，整体以 Y=0 居中）。 */
  centerY: number;
}

export interface Funnel3DModelOptions {
  variant?: Funnel3DVariant;
  height?: number;
  maxRadius?: number;
  gap?: number;
}

export interface Funnel3DModel {
  stages: Funnel3DModelStage[];
  variant: Funnel3DVariant;
  totalHeight: number;
  maxRadius: number;
  maxValue: number;
}

const DEFAULT_HEIGHT = 210;
const DEFAULT_MAX_RADIUS = 105;
const DEFAULT_GAP = 7;

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
 * 漏斗/金字塔阶段数据 → 3D 悬浮分层几何纯模型。
 *
 * - funnel：从上到下递减（宽口在上、窄口在下），相邻层上下半径平顺衔接；
 * - pyramid：正置层级金字塔（尖顶在上、宽基座在下），适合展示层级结构。
 */
export function buildFunnel3DModel(
  data: readonly Funnel3DStage[] = [],
  options: Funnel3DModelOptions = {},
): Funnel3DModel {
  const variant: Funnel3DVariant =
    options.variant === 'pyramid' ? 'pyramid' : 'funnel';
  const totalHeight = positiveOr(options.height, DEFAULT_HEIGHT);
  const maxRadius = positiveOr(options.maxRadius, DEFAULT_MAX_RADIUS);
  const rawGap = nonNegativeOr(options.gap, DEFAULT_GAP);

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
    return {
      stages: [],
      variant,
      totalHeight,
      maxRadius,
      maxValue: 0,
    };
  }

  const count = valid.length;
  const maxValue = Math.max(...valid.map((item) => item.value));
  const firstValue = valid[0].value;
  // 留出安全缝隙上限，防止层高被压缩成负值
  const gap = count > 1 ? Math.min(rawGap, (totalHeight / count) * 0.35) : 0;
  const stageHeight = (totalHeight - gap * (count - 1)) / count;
  const minRadius = maxRadius * 0.18;

  const radiusOf = (value: number): number => {
    const ratio = maxValue > 0 ? Math.min(1, Math.max(0, value / maxValue)) : 1;
    // 用轻微开方映射保留小转化层的立体可读性，避免底层细成一条针
    return minRadius + Math.pow(ratio, 0.72) * (maxRadius - minRadius);
  };

  const stages: Funnel3DModelStage[] = valid.map((stage, index) => {
    const ratio = maxValue > 0 ? stage.value / maxValue : 1;
    const overallRate = firstValue > 0 ? stage.value / firstValue : 1;
    const prevValue = index > 0 ? valid[index - 1].value : stage.value;
    const stepRate = prevValue > 0 ? stage.value / prevValue : 1;

    let topRadius: number;
    let bottomRadius: number;
    if (variant === 'funnel') {
      topRadius = radiusOf(stage.value);
      bottomRadius =
        index < count - 1
          ? radiusOf(valid[index + 1].value)
          : Math.max(minRadius * 0.65, topRadius * 0.68);
    } else {
      // pyramid：顶端收尖、底部承托下一层宽度
      bottomRadius = radiusOf(stage.value);
      topRadius =
        index > 0
          ? radiusOf(valid[index - 1].value)
          : Math.max(4, bottomRadius * 0.14);
    }

    // 自上而下排布，整体围绕 Y = 0 对称居中
    const topEdge = totalHeight / 2 - index * (stageHeight + gap);
    const centerY = topEdge - stageHeight / 2;

    return {
      index,
      stage,
      name: stage.name.trim(),
      value: stage.value,
      ratio,
      overallRate,
      stepRate,
      topRadius,
      bottomRadius,
      height: stageHeight,
      centerY,
    };
  });

  return {
    stages,
    variant,
    totalHeight,
    maxRadius,
    maxValue,
  };
}
