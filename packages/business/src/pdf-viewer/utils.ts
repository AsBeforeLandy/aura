/**
 * PdfViewer 的纯函数工具层：缩放、旋转、页码的数值约束与步进计算。
 *
 * 与 React 渲染完全解耦，便于独立单测；组件本体只负责加载、渲染与交互。
 */

/** 缩放步长（每次点击放大 / 缩小的变化量） */
export const SCALE_STEP = 0.2;

/** 默认缩放范围 */
export const DEFAULT_SCALE_RANGE: readonly [number, number] = [0.5, 3];

/** 旋转步进（度） */
export const ROTATION_STEP = 90;

/** 将数值钳制在 [min, max]；非数值输入返回 min */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** 将旋转角归一化到 0 / 90 / 180 / 270（负角与多圈输入同样收敛） */
export function normalizeRotation(deg: number): number {
  const stepped = Math.round(deg / ROTATION_STEP) * ROTATION_STEP;
  return (((stepped % 360) + 360) % 360);
}

/**
 * 步进缩放：按方向加减一个步长并钳制在范围内。
 * 结果保留两位小数，避免 0.30000000000000004 这类浮点尾巴进入 UI。
 */
export function stepScale(
  current: number,
  direction: 1 | -1,
  range: readonly [number, number] = DEFAULT_SCALE_RANGE,
  step: number = SCALE_STEP,
): number {
  const [min, max] = range;
  const next = Number((current + direction * step).toFixed(2));
  return clamp(next, min, max);
}

/** 页码钳制到有效范围 [1, total]；total 无效（0 / NaN）时返回 1 */
export function clampPage(page: number, total: number): number {
  if (!Number.isFinite(total) || total < 1) return 1;
  return clamp(Math.round(page), 1, Math.round(total));
}

/**
 * 判断一个错误是否为「渲染被取消」。
 * 快速翻页 / 缩放时会主动取消上一次渲染任务，这类中断不算失败。
 */
export function isRenderCancelled(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as { name?: string }).name === 'RenderingCancelledException'
  );
}
