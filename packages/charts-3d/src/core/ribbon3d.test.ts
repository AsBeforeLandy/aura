import { describe, expect, it } from 'vitest';
import { buildRibbon3DModel, type Ribbon3DSeries } from './ribbon3d';

const CATEGORIES = ['Q1', 'Q2', 'Q3', 'Q4'];
const SERIES: Ribbon3DSeries[] = [
  { name: '华东', values: [100, 150, 120, 200] },
  { name: '华北', values: [80, 110, 140, 160] },
];

describe('buildRibbon3DModel', () => {
  it('生成多条错落排布的平滑丝带墙与封闭几何数据', () => {
    const model = buildRibbon3DModel(CATEGORIES, SERIES, {
      width: 240,
      depth: 120,
      maxHeight: 100,
      smooth: true,
    });

    expect(model.series).toHaveLength(2);
    expect(model.allPoints).toHaveLength(8);
    expect(model.min).toBe(0);
    expect(model.max).toBe(200);
    // 沿 Z 轴对称错落排布
    expect(model.series[0].z).toBeCloseTo(-60, 6);
    expect(model.series[1].z).toBeCloseTo(60, 6);

    model.series.forEach((s) => {
      expect(s.geometry.positions.length).toBeGreaterThan(0);
      expect(s.geometry.normals.length).toBe(s.geometry.positions.length);
      expect(s.geometry.indices.length % 3).toBe(0);
      expect(s.geometry.positions.every(Number.isFinite)).toBe(true);
      expect(s.geometry.ridgePositions.length).toBeGreaterThan(12);
    });
  });

  it('关闭 smooth 时按原始采样点直连构造几何', () => {
    const linear = buildRibbon3DModel(CATEGORIES, SERIES, { smooth: false });
    // 4 个原始采样点 -> 脊线 4 * 3 = 12 个坐标
    expect(linear.series[0].geometry.ridgePositions).toHaveLength(12);
  });

  it('空数据返回空模型；缺省 categories 自动生成序号刻度', () => {
    const empty = buildRibbon3DModel([], []);
    expect(empty.series).toEqual([]);
    expect(empty.allPoints).toEqual([]);

    const autoCat = buildRibbon3DModel([], [{ name: 'A', values: [10, 20] }]);
    expect(autoCat.categories).toEqual(['1', '2']);
    expect(autoCat.series[0].z).toBe(0);
  });

  it('安全清洗非有限值、空名称系列、单点序列与非法选项', () => {
    const model = buildRibbon3DModel(
      ['T1'],
      [
        { name: '   ', values: [10] },
        { name: '空值', values: [] },
        { name: '异常值', values: [Number.NaN, Number.POSITIVE_INFINITY] },
      ],
      { width: -1, depth: 0, maxHeight: Number.NaN, thickness: 999 },
    );

    expect(model.series).toHaveLength(1);
    expect(model.series[0].points[0].value).toBe(0);
    expect(model.width).toBe(280);
    expect(model.depth).toBe(180);
    expect(model.maxHeight).toBe(125);
    // 单点无法形成面，安全返回空几何
    expect(model.series[0].geometry.positions).toEqual([]);
  });
});
