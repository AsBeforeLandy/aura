import { describe, it, expect } from 'vitest';
import {
  createBandScale,
  createLinearScale,
  createPointScale,
  extentOf,
  extentWithZero,
  linearTicks,
  niceStep,
} from './scale';

describe('niceStep', () => {
  it('把任意步长收敛到 1/2/2.5/5 × 10^n', () => {
    expect(niceStep(0.7)).toBe(1);
    expect(niceStep(1.6)).toBe(2);
    expect(niceStep(2.3)).toBe(2.5);
    expect(niceStep(4)).toBe(5);
    expect(niceStep(7)).toBe(10);
    expect(niceStep(120)).toBe(200);
  });

  // 边界：非法输入不能产生 NaN 污染整条坐标轴
  it('对 0 / 负数 / NaN 返回安全默认值 1', () => {
    expect(niceStep(0)).toBe(1);
    expect(niceStep(-5)).toBe(1);
    expect(niceStep(Number.NaN)).toBe(1);
    expect(niceStep(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe('linearTicks', () => {
  it('生成落在区间内且步长整齐的刻度', () => {
    const ticks = linearTicks(0, 100, 5);
    expect(ticks).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('不产生浮点尾巴', () => {
    const ticks = linearTicks(0, 1, 5);
    expect(ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    ticks.forEach((tick) => expect(String(tick).length).toBeLessThan(5));
  });

  // 边界：min === max 时不能让循环无限执行
  it('区间退化时返回单点', () => {
    expect(linearTicks(5, 5)).toEqual([5]);
  });

  // 异常：非数值输入返回空数组而不是抛错
  it('非法区间返回空数组', () => {
    expect(linearTicks(Number.NaN, 10)).toEqual([]);
    expect(linearTicks(0, Number.POSITIVE_INFINITY)).toEqual([]);
  });

  it('支持负数区间', () => {
    const ticks = linearTicks(-100, 0, 5);
    expect(ticks[0]).toBe(-100);
    expect(ticks[ticks.length - 1]).toBe(0);
  });
});

describe('createLinearScale', () => {
  it('数据域与像素域双向映射', () => {
    const scale = createLinearScale({ domain: [0, 100], range: [0, 200] });
    expect(scale.scale(0)).toBe(0);
    expect(scale.scale(50)).toBe(100);
    expect(scale.scale(100)).toBe(200);
    expect(scale.invert(100)).toBe(50);
  });

  it('y 轴反向 range 时仍正确', () => {
    const scale = createLinearScale({ domain: [0, 100], range: [200, 0] });
    expect(scale.scale(0)).toBe(200);
    expect(scale.scale(100)).toBe(0);
  });

  // 边界：domain 两端相等不能让映射除零
  it('domain 退化为单点时返回有限值', () => {
    const scale = createLinearScale({ domain: [5, 5], range: [0, 100] });
    expect(Number.isFinite(scale.scale(5))).toBe(true);
    expect(Number.isFinite(scale.invert(50))).toBe(true);
  });

  it('nice() 把值域扩展到刻度边界', () => {
    const scale = createLinearScale({
      domain: [3, 97],
      range: [0, 100],
      nice: true,
    });
    expect(scale.domain[0]).toBeLessThanOrEqual(3);
    expect(scale.domain[1]).toBeGreaterThanOrEqual(97);
  });

  it('tickStep 可强制指定步长', () => {
    const scale = createLinearScale({
      domain: [0, 100],
      range: [0, 10],
      tickStep: 25,
    });
    expect(scale.ticks()).toEqual([0, 25, 50, 75, 100]);
  });
});

describe('createBandScale', () => {
  it('分类均匀分布，band 不重叠', () => {
    const scale = createBandScale({
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      paddingInner: 0.2,
      paddingOuter: 0.1,
    });

    const a = scale.scale('A')!;
    const b = scale.scale('B')!;
    const c = scale.scale('C')!;

    expect(b - a).toBeCloseTo(scale.step, 5);
    expect(c - b).toBeCloseTo(scale.step, 5);
    expect(scale.bandWidth).toBeLessThan(scale.step);
    expect(a + scale.bandWidth).toBeLessThanOrEqual(b);
  });

  // 异常：未知分类必须返回 undefined，让调用方能跳过而不是画到 0 位置
  it('未知分类返回 undefined', () => {
    const scale = createBandScale({ domain: ['A'], range: [0, 100] });
    expect(scale.scale('Z')).toBeUndefined();
    expect(scale.center('Z')).toBeUndefined();
  });

  // 边界：空域名不产生 NaN
  it('空域名时 step 与 bandWidth 为 0', () => {
    const scale = createBandScale({ domain: [], range: [0, 100] });
    expect(scale.step).toBe(0);
    expect(scale.bandWidth).toBe(0);
  });
});

describe('createPointScale', () => {
  it('分类落在刻度线上', () => {
    const scale = createPointScale({
      domain: ['A', 'B'],
      range: [0, 100],
      paddingOuter: 0,
    });
    expect(scale.scale('A')).toBe(0);
    expect(scale.scale('B')).toBe(100);
  });

  // 边界：单分类居中而不是贴边
  it('单分类居中', () => {
    const scale = createPointScale({ domain: ['A'], range: [0, 100] });
    expect(scale.scale('A')).toBe(50);
  });
});

describe('extentOf / extentWithZero', () => {
  it('忽略 null 与 NaN', () => {
    expect(extentOf([null, 3, Number.NaN, 9, undefined])).toEqual([3, 9]);
  });

  // 异常：全部缺失时返回安全值域
  it('全为 null 时返回 [0, 1]', () => {
    expect(extentOf([null, null])).toEqual([0, 1]);
  });

  it('extentWithZero 保证包含 0 基线', () => {
    expect(extentWithZero([10, 20])).toEqual([0, 20]);
    expect(extentWithZero([-5, -1])).toEqual([-5, 0]);
  });
});
