import { describe, expect, it } from 'vitest';
import { buildPie3DModel, type Pie3DDatum } from './pie3d';

const SAMPLE: Pie3DDatum[] = [
  { name: '算力', value: 50 },
  { name: '存储', value: 30 },
  { name: '安全', value: 20 },
];

describe('buildPie3DModel', () => {
  it('按比例划分扇区角度、占比与立体高度阶梯', () => {
    const model = buildPie3DModel(SAMPLE, {
      radius: 100,
      innerRadius: 40,
      depth: 20,
      heightScale: true,
    });

    expect(model.total).toBe(100);
    expect(model.slices).toHaveLength(3);
    expect(model.slices.map((s) => s.ratio)).toEqual([0.5, 0.3, 0.2]);
    // 占比越大厚度越高
    expect(model.slices[0].depth).toBeGreaterThan(model.slices[1].depth);
    expect(model.slices[1].depth).toBeGreaterThan(model.slices[2].depth);
    model.slices.forEach((s) => {
      expect(s.endAngle).toBeGreaterThan(s.startAngle);
      expect(Math.hypot(s.explodeDir[0], s.explodeDir[1])).toBeCloseTo(1, 6);
      expect(s.labelPosition.every(Number.isFinite)).toBe(true);
    });
  });

  it('关闭 heightScale 时所有切片等厚，innerRadius=0 为实心饼图', () => {
    const model = buildPie3DModel(SAMPLE, {
      innerRadius: 0,
      depth: 24,
      heightScale: false,
    });
    expect(model.innerRadius).toBe(0);
    expect(new Set(model.slices.map((s) => s.depth))).toEqual(new Set([24]));
  });

  it('单切片无缺口，空数组返回空模型', () => {
    const single = buildPie3DModel([{ name: '唯一', value: 10 }]);
    expect(single.slices).toHaveLength(1);
    expect(single.slices[0].startAngle).toBe(0);
    expect(single.slices[0].endAngle).toBeCloseTo(Math.PI * 2, 10);

    const empty = buildPie3DModel([]);
    expect(empty.slices).toEqual([]);
    expect(empty.total).toBe(0);
  });

  it('过滤非正值、非有限值、空名称，并收敛非法尺寸参数', () => {
    const model = buildPie3DModel(
      [
        { name: '', value: 10 },
        { name: 'zero', value: 0 },
        { name: 'neg', value: -5 },
        { name: 'nan', value: Number.NaN },
        { name: 'inf', value: Number.POSITIVE_INFINITY },
        { name: '  有效  ', value: 25 },
      ],
      {
        radius: Number.NaN,
        innerRadius: 999,
        depth: -10,
        padAngle: 5,
      },
    );

    expect(model.slices).toHaveLength(1);
    expect(model.slices[0].name).toBe('有效');
    expect(model.radius).toBe(115);
    expect(model.innerRadius).toBeCloseTo(115 * 0.85, 6);
    expect(model.depth).toBe(28);
  });
});
