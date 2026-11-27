import { describe, expect, it } from 'vitest';
import {
  buildInstanceColors,
  buildInstanceTransforms,
  type InstanceDatum,
} from './instancing';

const SAMPLES: InstanceDatum[] = [
  { index: 0, x: -20, z: 0, height: 40, ratio: 0 },
  { index: 1, x: 0, z: 0, height: 80, ratio: 0.5 },
  { index: 2, x: 20, z: 0, height: 120, ratio: 1 },
];

describe('buildInstanceTransforms', () => {
  it('progress=0 时全部实例贴地且保留正数高度，progress=1 时完全到位', () => {
    const start = buildInstanceTransforms(SAMPLES, 20, 0, 0.5);
    expect(start.scales).toEqual([0.001, 0.001, 0.001]);

    const end = buildInstanceTransforms(SAMPLES, 20, 1, 0.5);
    expect(end.scales).toEqual([40, 80, 120]);
    expect(end.matrices).toHaveLength(3);
  });

  it('stagger > 0 时靠前的实例早于靠后的实例生长', () => {
    const mid = buildInstanceTransforms(SAMPLES, 20, 0.3, 0.6);
    const firstRatio = mid.scales[0] / SAMPLES[0].height;
    const lastRatio = mid.scales[2] / SAMPLES[2].height;
    expect(firstRatio).toBeGreaterThan(lastRatio);
  });

  it('空数组返回空矩阵与空缩放', () => {
    expect(buildInstanceTransforms([], 20, 1, 0.5)).toEqual({
      matrices: [],
      scales: [],
    });
  });
});

describe('buildInstanceColors', () => {
  it('支持三段语义色带，中点准确命中中间色且两端分别命中首尾色', () => {
    const colors = buildInstanceColors(SAMPLES, [
      '#16a34a',
      '#94a3b8',
      '#db2777',
    ]);
    // #16a34a -> (22, 163, 74)
    expect(colors[0].r).toBeCloseTo(22 / 255, 2);
    expect(colors[0].g).toBeCloseTo(163 / 255, 2);
    expect(colors[0].b).toBeCloseTo(74 / 255, 2);
    // #94a3b8 -> (148, 163, 184)
    expect(colors[1].r).toBeCloseTo(148 / 255, 2);
    expect(colors[1].g).toBeCloseTo(163 / 255, 2);
    expect(colors[1].b).toBeCloseTo(184 / 255, 2);
    // #db2777 -> (219, 39, 119)
    expect(colors[2].r).toBeCloseTo(219 / 255, 2);
    expect(colors[2].g).toBeCloseTo(39 / 255, 2);
    expect(colors[2].b).toBeCloseTo(119 / 255, 2);
  });

  it('空色带或单色色带安全回退不抛错', () => {
    const fallback = buildInstanceColors([SAMPLES[0]], []);
    expect(fallback).toHaveLength(1);
    expect(Number.isFinite(fallback[0].r)).toBe(true);

    const single = buildInstanceColors(SAMPLES, ['#ff0000']);
    single.forEach((color) => {
      expect(color.r).toBeCloseTo(1, 2);
      expect(color.g).toBeCloseTo(0, 2);
      expect(color.b).toBeCloseTo(0, 2);
    });
  });
});
