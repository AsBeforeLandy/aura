import * as THREE from 'three';

/** 地球上的业务点位。 */
export interface Globe3DPoint {
  /** 点位唯一标识；重复 id 仅保留首个有效点位。 */
  id: string;
  /** 展示名称，用于标签与提示框。 */
  name: string;
  /** 纬度，取值范围 [-90, 90]，越界时收敛到边界。 */
  latitude: number;
  /** 经度，会归一化到 [-180, 180)。 */
  longitude: number;
  /** 可选数值，用于点位大小、颜色与图例；非有限值按 0。 */
  value?: number;
}

/** 两个业务点位之间的球面弧线。 */
export interface Globe3DArc {
  /** 起点点位 id。 */
  from: string;
  /** 终点点位 id。 */
  to: string;
  /** 可选数值，用于弧线着色；非有限值按 0。 */
  value?: number;
}

/** 净化并映射后的业务点位。 */
export interface Globe3DModelPoint {
  /** 原始点位数据，点击回调原样返回。 */
  point: Globe3DPoint;
  /** 收敛到 [-90, 90] 后的纬度。 */
  latitude: number;
  /** 归一化到 [-180, 180) 后的经度。 */
  longitude: number;
  /** 球面世界坐标。 */
  position: THREE.Vector3;
  /** 非有限值替换为 0 后的数值。 */
  value: number;
  /** 数值在点位值域中的归一化位置，范围 0~1。 */
  ratio: number;
}

/** 合法弧线的采样路径。 */
export interface Globe3DModelArc {
  from: string;
  to: string;
  value: number;
  /** 数值在点位值域中的归一化位置，范围 0~1。 */
  ratio: number;
  /** 含精确端点的路径采样点，首尾严格等于对应点位坐标。 */
  path: THREE.Vector3[];
}

/** 合并后的立体弧线管道几何数据（纯数值数组，便于单测与一次 draw call 渲染）。 */
export interface Globe3DArcTubeData {
  positions: number[];
  normals: number[];
  /** 每个顶点沿对应弧线的归一化进度 u ∈ [0, 1]。 */
  progress: number[];
  /** 每个顶点所属弧线的数值比 ratio ∈ [0, 1]。 */
  ratios: number[];
  indices: number[];
}

/** 可直接交给 Three.js 渲染的纯数据模型。 */
export interface Globe3DModel {
  points: Globe3DModelPoint[];
  arcs: Globe3DModelArc[];
  /** 球体半径。 */
  radius: number;
  /** 点位数值下界。 */
  min: number;
  /** 点位数值上界。 */
  max: number;
  /** 经纬网的 lineSegments 坐标，按每两个顶点一条线段排列。 */
  grid: number[];
  /** 斐波那契球面点阵坐标（每 3 个数为一点），用于数字地球表层纹理。 */
  dots: number[];
}

const DEG_TO_RAD = Math.PI / 180;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const DEFAULT_RADIUS = 120;
const DEFAULT_ARC_HEIGHT = 0.35;
const DEFAULT_DOT_COUNT = 1200;
const GRID_SEGMENTS = 72;
const MERIDIAN_SEGMENTS = 24;
const ARC_SEGMENTS = 48;
const VECTOR_EPSILON = 1e-10;
const MAX_FLOAT32 = 3.402_823_466_385_288_6e38;

function normalizeLongitude(longitude: number): number {
  if (!Number.isFinite(longitude)) return longitude;
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function normalizeValue(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function valueRatio(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  const span = max - min;
  if (!Number.isFinite(span)) {
    const scale = Math.max(Math.abs(min), Math.abs(max));
    return Math.min(
      1,
      Math.max(0, (value / scale - min / scale) / (max / scale - min / scale)),
    );
  }
  return Math.min(1, Math.max(0, (value - min) / span));
}

/**
 * 经纬度 → 球面向量。
 *
 * 纬度收敛到 [-90, 90]，经度归一化到 [-180, 180)。非有限坐标不会被
 * 净化，调用方应先过滤；buildGlobeModel 已完整处理该边界。
 */
export function latLngToVector3(
  latitude: number,
  longitude: number,
  radius: number,
): THREE.Vector3 {
  const lat = Math.min(90, Math.max(-90, latitude)) * DEG_TO_RAD;
  const lng = normalizeLongitude(longitude) * DEG_TO_RAD;
  const cosLat = Math.cos(lat);
  return new THREE.Vector3(
    radius * cosLat * Math.cos(lng),
    radius * Math.sin(lat),
    -radius * cosLat * Math.sin(lng),
  );
}

function appendSegment(
  target: number[],
  start: THREE.Vector3,
  end: THREE.Vector3,
): void {
  target.push(start.x, start.y, start.z, end.x, end.y, end.z);
}

/** 每 30° 一条纬线 / 经线；极点只作为经线端点，不生成退化纬线。 */
function buildGrid(radius: number): number[] {
  const positions: number[] = [];

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    for (let step = 0; step < GRID_SEGMENTS; step += 1) {
      const startLng = -180 + (step * 360) / GRID_SEGMENTS;
      const endLng = -180 + ((step + 1) * 360) / GRID_SEGMENTS;
      appendSegment(
        positions,
        latLngToVector3(latitude, startLng, radius),
        latLngToVector3(latitude, endLng, radius),
      );
    }
  }

  for (let longitude = -180; longitude < 180; longitude += 30) {
    for (let step = 0; step < MERIDIAN_SEGMENTS; step += 1) {
      const startLat = -90 + (step * 180) / MERIDIAN_SEGMENTS;
      const endLat = -90 + ((step + 1) * 180) / MERIDIAN_SEGMENTS;
      appendSegment(
        positions,
        latLngToVector3(startLat, longitude, radius),
        latLngToVector3(endLat, longitude, radius),
      );
    }
  }

  return positions;
}

/**
 * 斐波那契球面点阵：用黄金角在球面生成均匀分布的纯装饰坐标。
 * 不依赖任何地理边界数据，保证零合规风险且每次构建结果确定。
 */
export function buildSphereDots(
  radius: number,
  count = DEFAULT_DOT_COUNT,
): number[] {
  const safeRadius =
    Number.isFinite(radius) && radius > 0 && radius <= MAX_FLOAT32 / 2
      ? radius
      : DEFAULT_RADIUS;
  const safeCount =
    Number.isFinite(count) && count > 0 ? Math.min(4000, Math.trunc(count)) : 0;
  const positions: number[] = [];
  for (let index = 0; index < safeCount; index += 1) {
    const y = 1 - (2 * (index + 0.5)) / safeCount;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = GOLDEN_ANGLE * index;
    positions.push(
      Math.cos(angle) * ring * safeRadius,
      y * safeRadius,
      Math.sin(angle) * ring * safeRadius,
    );
  }
  return positions;
}

/** 按进度 t ∈ [0, 1] 在弧线折线上线性插值，供飞线流光粒子定位使用。 */
export function sampleArcPosition(
  path: readonly THREE.Vector3[],
  t: number,
  target = new THREE.Vector3(),
): THREE.Vector3 {
  if (path.length === 0) return target.set(0, 0, 0);
  if (path.length === 1) return target.copy(path[0]);
  const clamped = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
  const scaled = clamped * (path.length - 1);
  const index = Math.min(Math.floor(scaled), path.length - 2);
  const localT = scaled - index;
  return target.lerpVectors(path[index], path[index + 1], localT);
}

/**
 * 将多条球面弧线合并为单个平滑管道网格数据（突破 WebGL 1px lineWidth 限制）。
 *
 * 沿球面径向向量构造稳定的局部标架（T / N / B），在首尾微收尖以呈现流线型弧光。
 */
export function buildArcTubes(
  arcs: readonly Globe3DModelArc[],
  tubeRadius: number,
  radialSegments = 5,
): Globe3DArcTubeData {
  const positions: number[] = [];
  const normals: number[] = [];
  const progress: number[] = [];
  const ratios: number[] = [];
  const indices: number[] = [];

  const safeTubeRadius =
    Number.isFinite(tubeRadius) && tubeRadius > 0 ? tubeRadius : 1;
  const segments = Math.max(3, Math.trunc(radialSegments));
  const tangent = new THREE.Vector3();
  const radial = new THREE.Vector3();
  const side = new THREE.Vector3();
  const up = new THREE.Vector3();
  const ringNormal = new THREE.Vector3();
  const fallbackAxis = new THREE.Vector3(0, 1, 0);
  const altAxis = new THREE.Vector3(1, 0, 0);
  let vertexOffset = 0;

  for (const arc of arcs) {
    const { path } = arc;
    if (path.length < 2) continue;
    const count = path.length;

    for (let i = 0; i < count; i += 1) {
      const point = path[i];
      const u = i / (count - 1);
      if (i === 0) {
        tangent.subVectors(path[1], point);
      } else if (i === count - 1) {
        tangent.subVectors(point, path[count - 2]);
      } else {
        tangent.subVectors(path[i + 1], path[i - 1]);
      }
      if (tangent.lengthSq() <= VECTOR_EPSILON) {
        tangent.set(1, 0, 0);
      } else {
        tangent.normalize();
      }

      radial.copy(point);
      if (radial.lengthSq() <= VECTOR_EPSILON) {
        radial.copy(fallbackAxis);
      } else {
        radial.normalize();
      }

      side.crossVectors(tangent, radial);
      if (side.lengthSq() <= VECTOR_EPSILON) {
        const ref = Math.abs(tangent.y) > 0.9 ? altAxis : fallbackAxis;
        side.crossVectors(tangent, ref);
      }
      side.normalize();
      up.crossVectors(side, tangent).normalize();

      // 端点轻度收细（0.55 → 1.0 → 0.55），起落更贴合节点底座
      const profile = 0.55 + 0.45 * Math.sin(Math.PI * u);
      const r = safeTubeRadius * profile;

      for (let s = 0; s < segments; s += 1) {
        const theta = (s / segments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        ringNormal
          .set(0, 0, 0)
          .addScaledVector(side, cos)
          .addScaledVector(up, sin)
          .normalize();
        positions.push(
          point.x + ringNormal.x * r,
          point.y + ringNormal.y * r,
          point.z + ringNormal.z * r,
        );
        normals.push(ringNormal.x, ringNormal.y, ringNormal.z);
        progress.push(u);
        ratios.push(arc.ratio);
      }
    }

    for (let i = 0; i < count - 1; i += 1) {
      const rowA = vertexOffset + i * segments;
      const rowB = rowA + segments;
      for (let s = 0; s < segments; s += 1) {
        const next = (s + 1) % segments;
        const a = rowA + s;
        const b = rowB + s;
        const c = rowB + next;
        const d = rowA + next;
        indices.push(a, b, d, b, c, d);
      }
    }

    vertexOffset += count * segments;
  }

  return { positions, normals, progress, ratios, indices };
}

/** 球面线性插值 + 径向正弦抬升；同位置返回 null，对跖点选确定性平面。 */
function buildArcPath(
  from: THREE.Vector3,
  to: THREE.Vector3,
  radius: number,
  arcHeight: number,
): THREE.Vector3[] | null {
  const start = from.clone().normalize();
  const end = to.clone().normalize();
  const dot = Math.min(1, Math.max(-1, start.dot(end)));
  if (dot > 1 - VECTOR_EPSILON) return null;

  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);
  const isAntipodal = dot < -1 + VECTOR_EPSILON;
  const reference =
    Math.abs(start.x) > 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0);
  const tangent = new THREE.Vector3()
    .crossVectors(start, reference)
    .normalize();
  const path: THREE.Vector3[] = [];

  for (let step = 0; step <= ARC_SEGMENTS; step += 1) {
    const t = step / ARC_SEGMENTS;
    let direction: THREE.Vector3;
    if (isAntipodal) {
      direction = start
        .clone()
        .multiplyScalar(Math.cos(Math.PI * t))
        .addScaledVector(tangent, Math.sin(Math.PI * t));
    } else {
      direction = start
        .clone()
        .multiplyScalar(Math.sin((1 - t) * omega) / sinOmega)
        .addScaledVector(end, Math.sin(t * omega) / sinOmega);
    }
    const lift = Math.sin(Math.PI * t) * radius * arcHeight;
    path.push(direction.normalize().multiplyScalar(radius + lift));
  }

  path[0] = from.clone();
  path[path.length - 1] = to.clone();
  return path;
}

/**
 * 业务数据 → 地球模型。
 *
 * 先过滤非有限坐标，再按 id 去重；非法、自环、同位置或端点不存在的弧线
 * 会被忽略。半径与抬升比例的非法输入回退到公开默认值。
 */
export function buildGlobeModel(
  points: readonly Globe3DPoint[] = [],
  arcs: readonly Globe3DArc[] = [],
  radius = DEFAULT_RADIUS,
  arcHeight = DEFAULT_ARC_HEIGHT,
): Globe3DModel {
  const safeRadius =
    Number.isFinite(radius) && radius > 0 && radius <= MAX_FLOAT32 / 2
      ? radius
      : DEFAULT_RADIUS;
  const safeArcHeight =
    Number.isFinite(arcHeight) &&
    arcHeight >= 0 &&
    safeRadius * (1 + arcHeight) <= MAX_FLOAT32
      ? arcHeight
      : DEFAULT_ARC_HEIGHT;
  const seen = new Set<string>();
  const candidates: Omit<Globe3DModelPoint, 'ratio'>[] = [];

  for (const point of points) {
    if (
      !Number.isFinite(point.latitude) ||
      !Number.isFinite(point.longitude) ||
      seen.has(point.id)
    ) {
      continue;
    }
    seen.add(point.id);
    const latitude = Math.min(90, Math.max(-90, point.latitude));
    const longitude = normalizeLongitude(point.longitude);
    candidates.push({
      point,
      latitude,
      longitude,
      position: latLngToVector3(latitude, longitude, safeRadius),
      value: normalizeValue(point.value),
    });
  }

  let min = candidates.length ? candidates[0].value : 0;
  let max = min;
  candidates.forEach((item, index) => {
    if (index > 0) {
      min = Math.min(min, item.value);
      max = Math.max(max, item.value);
    }
  });

  const modelPoints = candidates.map((item) => ({
    ...item,
    ratio: valueRatio(item.value, min, max),
  }));
  const pointById = new Map(modelPoints.map((item) => [item.point.id, item]));
  const modelArcs: Globe3DModelArc[] = [];

  for (const arc of arcs) {
    if (arc.from === arc.to) continue;
    const from = pointById.get(arc.from);
    const to = pointById.get(arc.to);
    if (!from || !to) continue;
    const path = buildArcPath(
      from.position,
      to.position,
      safeRadius,
      safeArcHeight,
    );
    if (!path) continue;
    const value = normalizeValue(arc.value);
    modelArcs.push({
      from: arc.from,
      to: arc.to,
      value,
      ratio: valueRatio(value, min, max),
      path,
    });
  }

  return {
    points: modelPoints,
    arcs: modelArcs,
    radius: safeRadius,
    min,
    max,
    grid: buildGrid(safeRadius),
    dots: buildSphereDots(safeRadius),
  };
}
