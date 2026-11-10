import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { projectToScreen, scaleBarHeights, normalizeRatio } from './projection';

/** 正交相机：投影结果可手算，不受透视除法干扰 */
const camera = {
  projectionMatrix: {
    elements: [2 / 400, 0, 0, 0, 0, 2 / 300, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1],
  },
  matrixWorldInverse: {
    elements: new Array(16).fill(0).map((_, i) => (i % 5 === 0 ? 1 : 0)),
  },
} as unknown as import('three').Camera;

describe('projectToScreen', () => {
  it('原点投影到画布中心', () => {
    const point = projectToScreen(new Vector3(0, 0, 0), camera, 400, 300);
    expect(point.x).toBeCloseTo(200, 5);
    expect(point.y).toBeCloseTo(150, 5);
  });

  // 手算：ndc.x = (2/400)*x；ndc.y = (2/300)*y；屏幕 y 翻转
  it('右上方世界点投影到画布右上区域', () => {
    const point = projectToScreen(new Vector3(100, 75, 0), camera, 400, 300);
    expect(point.x).toBeCloseTo(300, 5);
    expect(point.y).toBeCloseTo(75, 5);
  });

  it('左下方世界点投影到画布左下区域', () => {
    const point = projectToScreen(new Vector3(-100, -75, 0), camera, 400, 300);
    expect(point.x).toBeCloseTo(100, 5);
    expect(point.y).toBeCloseTo(225, 5);
  });

  // 边界：容器尺寸为 0 时不产生 NaN
  it('容器尺寸为 0 时结果有限', () => {
    const point = projectToScreen(new Vector3(10, 10, 10), camera, 0, 0);
    expect(Number.isFinite(point.x)).toBe(true);
    expect(Number.isFinite(point.y)).toBe(true);
  });
});

describe('scaleBarHeights', () => {
  it('最大值映射到 maxHeight，其余按比例', () => {
    expect(scaleBarHeights([10, 5, 2], 100)).toEqual([100, 50, 20]);
  });

  it('负值按 0 处理', () => {
    expect(scaleBarHeights([-5, 10], 100)).toEqual([0, 100]);
  });

  // 边界：全零与空数组不能除零
  it('全零数据返回全 0', () => {
    expect(scaleBarHeights([0, 0], 100)).toEqual([0, 0]);
  });

  it('空数组返回空数组', () => {
    expect(scaleBarHeights([], 100)).toEqual([]);
  });
});

describe('normalizeRatio', () => {
  it('两端与中点的比值正确', () => {
    expect(normalizeRatio(0, 0, 100)).toBe(0);
    expect(normalizeRatio(100, 0, 100)).toBe(1);
    expect(normalizeRatio(50, 0, 100)).toBe(0.5);
  });

  // 边界：全等值给 0.6，避免整片同色时格子边界消失
  it('全等值返回 0.6', () => {
    expect(normalizeRatio(7, 7, 7)).toBe(0.6);
  });

  it('负比值被输出（调用方自行 clamp 或用于负向色带）', () => {
    expect(normalizeRatio(-10, 0, 100)).toBe(-0.1);
  });
});
