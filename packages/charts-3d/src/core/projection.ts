import { Vector3, type Camera } from 'three';

/**
 * 3D → 2D 投影与数据缩放的纯函数。
 *
 * 放在这里而不是组件里，是为了让它们可以在 jsdom 里直接单测——
 * WebGL 渲染层无法在 Node 环境验证，纯函数层是 3D 库测试的主阵地。
 */

export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * 世界坐标 → 容器屏幕坐标。
 *
 * 投影结果 x/y ∈ [-1, 1]（NDC），映射到容器宽高：
 *   x = (ndc.x + 1) / 2 * width
 *   y = (1 - ndc.y) / 2 * height（屏幕 y 轴向下）
 */
export function projectToScreen(
  worldPosition: Vector3,
  camera: Camera,
  width: number,
  height: number,
): ScreenPoint {
  const projected = worldPosition.clone().project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * width,
    y: (1 - (projected.y * 0.5 + 0.5)) * height,
  };
}

/** 数值 → 归一化柱体高度，最大值映射到 maxHeight；负值按 0 处理 */
export function scaleBarHeights(
  values: readonly number[],
  maxHeight: number,
): number[] {
  const max = Math.max(...values, 0);
  if (max <= 0) return values.map(() => 0);
  return values.map((value) => (Math.max(0, value) / max) * maxHeight);
}

/**
 * 值 → 色带位置（0~1）。
 *
 * 全等值时统一给 0.6：整片同色会让格子边界消失，
 * 0.6 处于色带中上部，颜色可辨识。
 */
export function normalizeRatio(
  value: number,
  min: number,
  max: number,
): number {
  if (max === min) return 0.6;
  return (value - min) / (max - min);
}
