import { describe, it, expect } from 'vitest';
import { buildVoxelModel, buildVoxelTransforms } from './voxel';

const DATA = [
  { x: 'A', y: 'L1', z: 'S1', value: 10 },
  { x: 'B', y: 'L1', z: 'S2', value: 90 },
  { x: 'A', y: 'L2', z: 'S1', value: 50 },
];

describe('buildVoxelModel', () => {
  it('三轴标签按出现顺序去重收集', () => {
    const model = buildVoxelModel(DATA, 18);
    expect(model.xLabels).toEqual(['A', 'B']);
    expect(model.yLabels).toEqual(['L1', 'L2']);
    expect(model.zLabels).toEqual(['S1', 'S2']);
    expect(model.instances).toHaveLength(3);
  });

  it('体素坐标以原点居中', () => {
    const model = buildVoxelModel(DATA, 18);
    // 两列：x 应为 ±spacing/2（spacing = voxelSize * 1.18 = 21.24）
    const xs = model.instances.map((instance) => instance.position[0]);
    expect(xs).toContain(-10.62);
    expect(xs).toContain(10.62);
  });

  it('值映射到色带两端（min=0 端、max=1 端）', () => {
    const model = buildVoxelModel(DATA, 18);
    const ratios = model.instances.map((instance) => instance.ratio);
    expect(Math.min(...ratios)).toBe(0);
    expect(Math.max(...ratios)).toBe(1);
  });

  // 边界：全等值给 0.6，差值数据负 ratio 被 clamp
  it('全等值返回 0.6', () => {
    const model = buildVoxelModel(
      [
        { x: 'A', y: 'L1', z: 'S1', value: 7 },
        { x: 'B', y: 'L1', z: 'S1', value: 7 },
      ],
      18,
    );
    model.instances.forEach((instance) => expect(instance.ratio).toBe(0.6));
  });

  it('NaN 值按 0 参与且 ratio 被 clamp', () => {
    const model = buildVoxelModel(
      [
        { x: 'A', y: 'L1', z: 'S1', value: Number.NaN },
        { x: 'B', y: 'L1', z: 'S1', value: -30 },
        { x: 'A', y: 'L2', z: 'S2', value: 100 },
      ],
      18,
    );
    // min = -30 → NaN(0) 的 ratio 为负 → clamp 到 0
    model.instances.forEach((instance) => {
      expect(instance.ratio).toBeGreaterThanOrEqual(0);
      expect(instance.ratio).toBeLessThanOrEqual(1);
    });
  });

  it('空数据返回空模型', () => {
    const model = buildVoxelModel([], 18);
    expect(model.instances).toHaveLength(0);
    expect(model.xLabels).toEqual([]);
  });
});

describe('buildVoxelTransforms', () => {
  const model = buildVoxelModel(DATA, 18);

  it('progress=1 时体素满尺寸缩放', () => {
    const matrices = buildVoxelTransforms(model.instances, 18, 1, 0.5);
    // 用元素断言：缩放分量接近 1
    matrices.forEach((matrix) => {
      const elements = matrix.elements;
      expect(elements[0]).toBeCloseTo(1, 3); // scale.x
      expect(elements[5]).toBeCloseTo(1, 3); // scale.y
      expect(elements[10]).toBeCloseTo(1, 3); // scale.z
    });
  });

  it('progress=0 时体素贴地（缩放 ~0.001）', () => {
    const matrices = buildVoxelTransforms(model.instances, 18, 0, 0.5);
    matrices.forEach((matrix) => {
      expect(matrix.elements[0]).toBeCloseTo(0.001, 2);
    });
  });

  it('错峰：后半的体素在前半仍为 0 时保持 0 缩放', () => {
    const matrices = buildVoxelTransforms(model.instances, 18, 0.1, 0.5);
    // progress=0.1 时最后一个体素（错峰最晚）应尚未开始
    const last = matrices[matrices.length - 1];
    expect(last.elements[0]).toBeCloseTo(0.001, 2);
  });

  it('空数据返回空矩阵数组', () => {
    expect(buildVoxelTransforms([], 18, 1, 0.5)).toHaveLength(0);
  });
});
