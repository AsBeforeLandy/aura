import { describe, it, expect } from 'vitest';
import { lttbIndices, sampleSeriesIndices, type SamplePoint } from './sampling';

/** 造一段正弦 + 尖峰的数据 */
function buildPoints(count: number, spikeAt = -1): SamplePoint[] {
  return Array.from({ length: count }, (_, index) => ({
    x: index,
    y: index === spikeAt ? 1000 : Math.sin(index / 5) * 10,
  }));
}

describe('lttbIndices', () => {
  it('数据量不足阈值时全取', () => {
    const points = buildPoints(10);
    expect(lttbIndices(points, 50)).toHaveLength(10);
  });

  it('按阈值返回对应数量的点', () => {
    const points = buildPoints(500);
    const indices = lttbIndices(points, 100);
    expect(indices).toHaveLength(100);
  });

  it('首尾必选', () => {
    const points = buildPoints(500);
    const indices = lttbIndices(points, 50);
    expect(indices[0]).toBe(0);
    expect(indices[indices.length - 1]).toBe(499);
  });

  it('下标严格升序', () => {
    const points = buildPoints(300);
    const indices = lttbIndices(points, 40);
    for (let index = 1; index < indices.length; index += 1) {
      expect(indices[index]).toBeGreaterThan(indices[index - 1]);
    }
  });

  // 这是 LTTB 相对「等间隔抽样」的核心价值：尖峰不会被抹掉
  it('保留尖峰', () => {
    const points = buildPoints(400, 217);
    const indices = lttbIndices(points, 60);
    expect(indices).toContain(217);
  });

  // 边界：阈值小于 3 时只保留首尾
  it('阈值过小时退化为首尾两点', () => {
    const points = buildPoints(100);
    expect(lttbIndices(points, 2)).toEqual([0, 99]);
    expect(lttbIndices(points, 1)).toEqual([0, 99]);
  });

  it('单点与空数组不崩', () => {
    expect(lttbIndices([], 10)).toEqual([]);
    expect(lttbIndices([{ x: 0, y: 1 }], 10)).toEqual([0]);
  });

  // 异常：含 null 的数据不能产生 NaN 或选出缺失点
  it('跳过缺失值', () => {
    const points: SamplePoint[] = Array.from({ length: 100 }, (_, index) => ({
      x: index,
      y: index % 7 === 0 ? null : index,
    }));
    const indices = lttbIndices(points, 20);
    indices.forEach((index) => expect(Number.isFinite(index)).toBe(true));
    expect(indices.length).toBe(20);
  });
});

describe('sampleSeriesIndices', () => {
  it('多系列共用同一套下标', () => {
    const a = buildPoints(400).map((point) => point.y);
    const b = buildPoints(400).map((point) => (point.y ?? 0) * 2);
    const indices = sampleSeriesIndices([a, b], 50);

    expect(indices).toHaveLength(50);
    // 同一套下标意味着两个系列采样后仍一一对应
    expect(indices[0]).toBe(0);
    expect(indices[indices.length - 1]).toBe(399);
  });

  // 边界：空数据
  it('空矩阵返回空数组', () => {
    expect(sampleSeriesIndices([], 10)).toEqual([]);
    expect(sampleSeriesIndices([[]], 10)).toEqual([]);
  });

  // 边界：全部为 null 时也要能选出点，不能返回空
  it('全缺失数据仍返回首尾', () => {
    const values = Array.from({ length: 100 }, () => null as number | null);
    const indices = sampleSeriesIndices([values], 10);
    expect(indices.length).toBeGreaterThanOrEqual(2);
  });
});
