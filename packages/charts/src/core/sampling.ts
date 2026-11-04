/**
 * 降采样。
 *
 * 为什么需要：数据点超过几百个后，屏幕像素已经不够区分相邻点了，
 * 继续逐点渲染只会拖慢滚动而不会增加信息量。
 * 但「每隔 N 个取一个」会丢掉尖峰——那些恰恰是读者最关心的。
 */

export interface SamplePoint {
  x: number;
  y: number | null;
}

/**
 * Largest-Triangle-Three-Buckets（LTTB）。
 *
 * 把数据切成 threshold 个桶，每个桶里选一个点，使得它与前后选中点
 * 构成的三角形面积最大——面积大意味着这个点「离直线最远」，
 * 也就是最能代表该段形状特征的极值点。
 *
 * 复杂度 O(n)，且能保住尖峰，是目前综合表现最好的保形降采样之一。
 *
 * @returns 选中点的原始下标（升序），首尾必选
 */
export function lttbIndices(
  points: readonly SamplePoint[],
  threshold: number,
): number[] {
  const length = points.length;
  if (length <= 2) return points.map((_, index) => index);
  if (threshold >= length) {
    // 不需要降采样，直接全取
    return points.map((_, index) => index);
  }
  if (threshold <= 2) {
    // 只保留首尾，至少能看出整体范围
    return [0, length - 1];
  }

  const indices: number[] = [0];
  // 每桶的跨度；最后一个点单独处理，所以是 (n-2)/(threshold-2)
  const bucketSize = (length - 2) / (threshold - 2);

  let previous = 0;

  for (let bucket = 0; bucket < threshold - 2; bucket += 1) {
    // 下一桶的平均点，用来算三角形面积
    const nextStart = Math.floor((bucket + 1) * bucketSize) + 1;
    const nextEnd = Math.min(Math.floor((bucket + 2) * bucketSize) + 1, length);
    let averageX = 0;
    let averageY = 0;
    let averageCount = 0;

    for (let index = nextStart; index < nextEnd; index += 1) {
      const point = points[index];
      if (point.y === null || !Number.isFinite(point.y)) continue;
      averageX += point.x;
      averageY += point.y;
      averageCount += 1;
    }

    if (averageCount === 0) {
      // 下一桶全是缺失值，就退化为取桶中点
      const fallback = Math.min(Math.floor(nextStart), length - 1);
      averageX = points[fallback].x;
      averageY = 0;
      averageCount = 1;
    }
    averageX /= averageCount;
    averageY /= averageCount;

    const rangeStart = Math.floor(bucket * bucketSize) + 1;
    const rangeEnd = Math.min(
      Math.floor((bucket + 1) * bucketSize) + 1,
      length - 1,
    );

    const anchor = points[previous];
    let maxArea = -1;
    let chosen = -1;

    // 锚点本身缺失时无法算面积，退化为取桶内第一个有效点
    if (anchor.y === null || !Number.isFinite(anchor.y)) {
      for (let index = rangeStart; index < rangeEnd; index += 1) {
        if (points[index].y !== null) {
          chosen = index;
          break;
        }
      }
      if (chosen < 0) chosen = rangeStart;
    } else {
      const anchorY = anchor.y;
      for (let index = rangeStart; index < rangeEnd; index += 1) {
        const point = points[index];
        if (point.y === null || !Number.isFinite(point.y)) continue;
        // 三角形面积的两倍（省掉除以 2）
        const area = Math.abs(
          (anchor.x - averageX) * (point.y - anchorY) -
            (anchor.x - point.x) * (averageY - anchorY),
        );
        if (area > maxArea) {
          maxArea = area;
          chosen = index;
        }
      }
      if (chosen < 0) chosen = rangeStart;
    }

    indices.push(chosen);
    previous = chosen;
  }

  indices.push(length - 1);
  return indices;
}

/**
 * 对「多系列共享 x」的数据做采样。
 *
 * 关键点：**必须按 x 下标采样一次，再让所有系列共用这套下标**。
 * 每个系列各自采样会得到不同的下标集合，折线之间就会错位，
 * 看起来像两列数据在互相穿插。
 */
export function sampleSeriesIndices(
  values: readonly (number | null)[][],
  threshold: number,
): number[] {
  const pointCount = values[0]?.length ?? 0;
  if (pointCount === 0) return [];

  // 用各系列的绝对值之和作为「形状强度」，避免只看第一条系列导致别的系列丢峰
  const combined: SamplePoint[] = [];
  for (let index = 0; index < pointCount; index += 1) {
    let sum = 0;
    let hasValue = false;
    for (const row of values) {
      const value = row[index];
      if (value !== null && Number.isFinite(value)) {
        sum += Math.abs(value);
        hasValue = true;
      }
    }
    combined.push({ x: index, y: hasValue ? sum : null });
  }

  return lttbIndices(combined, threshold);
}
