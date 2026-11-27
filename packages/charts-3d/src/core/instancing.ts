import * as THREE from 'three';
import { parseColor } from '@aura-react-comp/charts';
import { sampleGradient } from './projection';

/**
 * InstancedMesh 的实例数据构造（纯函数，jsdom 可测）。
 *
 * 柱体规模超过阈值（300）时，Bar3D 会从「每柱一个 mesh」切换到
 * InstancedMesh——所有柱体共用一个 BoxGeometry，每实例一份矩阵与颜色，
 * 整屏一次 draw call。切换逻辑在组件层，这里只负责算出每实例的数据。
 */

export interface InstanceDatum {
  /** 实例索引（与数据数组下标一一对应，拾取时用 instanceId 反查） */
  index: number;
  /** 柱体中心 x / z 与高度 */
  x: number;
  z: number;
  height: number;
  /** 归一化色带位置（0~1，已 clamp） */
  ratio: number;
}

/**
 * 由生长进度构造全部实例的矩阵。
 *
 * progress ∈ [0, 1]：0 = 全部贴地，1 = 全部到位。
 * 每实例的高度按 (progress * (1 + stagger) - index * stagger) 的局部进度
 * 插值 —— 与 2D 图表的错峰语义一致：扫过，而不是弹起。
 */
export function buildInstanceTransforms(
  instances: readonly InstanceDatum[],
  cellSize: number,
  progress: number,
  stagger: number,
): { matrices: THREE.Matrix4[]; scales: number[] } {
  const dummy = new THREE.Object3D();
  const matrices: THREE.Matrix4[] = [];
  const scales: number[] = [];
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

    const height = Math.max(instance.height * eased, 0.001);
    scales.push(height);

    dummy.position.set(instance.x, height / 2, instance.z);
    dummy.scale.set(1, height, 1);
    dummy.updateMatrix();
    matrices.push(dummy.matrix.clone());
  }

  return { matrices, scales };
}

/** 生成实例颜色数组（多段色带插值 → parseColor 转 0~1 分量），供 THREE.Color 使用 */
export function buildInstanceColors(
  instances: readonly InstanceDatum[],
  colorRange: readonly string[],
): { r: number; g: number; b: number }[] {
  return instances.map((instance): { r: number; g: number; b: number } => {
    const mixed = sampleGradient(colorRange, instance.ratio);
    const parsed = parseColor(mixed) ?? [255, 255, 255];
    return {
      r: parsed[0] / 255,
      g: parsed[1] / 255,
      b: parsed[2] / 255,
    };
  });
}
