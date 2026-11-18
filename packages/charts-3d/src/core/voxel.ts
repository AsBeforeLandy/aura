import * as THREE from 'three';

/**
 * Voxel3D 的纯函数层（jsdom 可测）。
 *
 * 体素热力是「第三个分类维度」的数据组件：x / z 平面网格 + y 层向堆叠，
 * 值 → 色带颜色。与 Bar3D 互补——Bar 用高度编码，Voxel 用颜色编码，
 * 适合三维交叉分析（机房温度场、区域 × 品类 × 季度）。
 */

export interface VoxelDatum {
  /** 列分类（X 轴） */
  x: string;
  /** 层分类（Y 轴，向上堆叠） */
  y: string;
  /** 行分类（Z 轴） */
  z: string;
  value: number;
}

export interface VoxelInstance {
  index: number;
  /** 体素中心世界坐标 */
  position: [number, number, number];
  /** 归一化色带位置（0~1，已 clamp） */
  ratio: number;
  datum: VoxelDatum;
}

export interface VoxelModel {
  instances: VoxelInstance[];
  xLabels: string[];
  yLabels: string[];
  zLabels: string[];
  /** 体素中心间距 */
  spacing: number;
  halfW: number;
  halfH: number;
  halfD: number;
  min: number;
  max: number;
}

/**
 * 数据 → 体素模型：标签收集、居中坐标、色带比值。
 *
 * 标签按数据出现顺序去重；坐标以原点为中心（三轴各自居中）；
 * ratio 已经 clamp —— 差值类数据不会外插出色带。
 */
export function buildVoxelModel(
  data: VoxelDatum[],
  voxelSize: number,
): VoxelModel {
  const xLabels: string[] = [];
  const yLabels: string[] = [];
  const zLabels: string[] = [];
  for (const item of data) {
    if (!xLabels.includes(item.x)) xLabels.push(item.x);
    if (!yLabels.includes(item.y)) yLabels.push(item.y);
    if (!zLabels.includes(item.z)) zLabels.push(item.z);
  }

  const xIndex = new Map(xLabels.map((label, index) => [label, index]));
  const yIndex = new Map(yLabels.map((label, index) => [label, index]));
  const zIndex = new Map(zLabels.map((label, index) => [label, index]));

  const values = data.map((item) =>
    Number.isFinite(item.value) ? item.value : 0,
  );
  const numeric = values.filter((value) => value !== 0 || data.length);
  const min = numeric.length ? Math.min(...numeric) : 0;
  const max = numeric.length ? Math.max(...numeric) : 1;

  const spacing = voxelSize * 1.18;
  const center = (index: number, length: number) =>
    (index - (length - 1) / 2) * spacing;

  const instances: VoxelInstance[] = data.map((datum, index) => {
    const ratio =
      max === min
        ? 0.6
        : Math.min(1, Math.max(0, (values[index] - min) / (max - min)));
    return {
      index,
      position: [
        center(xIndex.get(datum.x) ?? 0, xLabels.length),
        center(yIndex.get(datum.y) ?? 0, yLabels.length),
        center(zIndex.get(datum.z) ?? 0, zLabels.length),
      ],
      ratio,
      datum,
    };
  });

  return {
    instances,
    xLabels,
    yLabels,
    zLabels,
    spacing,
    halfW: (xLabels.length * spacing) / 2,
    halfH: (yLabels.length * spacing) / 2,
    halfD: (zLabels.length * spacing) / 2,
    min,
    max,
  };
}

/**
 * 由入场进度构造体素矩阵：整体从 0.001 缩放到 1（三轴均匀），
 * 按 index 错峰 —— 与 Bar3D 的生长语义一致（扫过，不弹起）。
 */
export function buildVoxelTransforms(
  instances: readonly VoxelInstance[],
  voxelSize: number,
  progress: number,
  stagger: number,
): THREE.Matrix4[] {
  const dummy = new THREE.Object3D();
  const matrices: THREE.Matrix4[] = [];
  const count = instances.length;

  for (let index = 0; index < count; index += 1) {
    const instance = instances[index];
    const local =
      stagger > 0
        ? Math.min(
            1,
            Math.max(
              0,
              progress * (1 + stagger) -
                (stagger * index) / Math.max(1, count - 1),
            ),
          )
        : Math.min(1, Math.max(0, progress));
    const eased = 1 - (1 - local) ** 5; // easeOutQuint
    const scale = Math.max(eased, 0.001);

    dummy.position.set(...instance.position);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    matrices.push(dummy.matrix.clone());
  }

  return matrices;
}
