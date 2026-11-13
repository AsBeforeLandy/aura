import { describe, it, expect } from 'vitest';
import {
  initParticles,
  advanceParticles,
  collectLinks,
  type ParticleBounds,
} from './particles';

const BOUNDS: ParticleBounds = { width: 100, height: 60, depth: 40 };

describe('initParticles', () => {
  it('生成 count 组三元组，全部落在 bounds 内', () => {
    const { positions } = initParticles(50, BOUNDS, 7);
    expect(positions).toHaveLength(150);

    for (let index = 0; index < positions.length; index += 3) {
      expect(Math.abs(positions[index])).toBeLessThanOrEqual(BOUNDS.width / 2);
      expect(Math.abs(positions[index + 1])).toBeLessThanOrEqual(
        BOUNDS.height / 2,
      );
      expect(Math.abs(positions[index + 2])).toBeLessThanOrEqual(
        BOUNDS.depth / 2,
      );
    }
  });

  // 确定性：同一 seed 两次初始化完全一致（录屏 / 截图对比的前提）
  it('同一 seed 的结果可复现', () => {
    const first = initParticles(30, BOUNDS, 42);
    const second = initParticles(30, BOUNDS, 42);
    expect(Array.from(first.positions)).toEqual(Array.from(second.positions));
    expect(Array.from(first.velocities)).toEqual(Array.from(second.velocities));
  });

  it('不同 seed 的结果不同', () => {
    const first = initParticles(30, BOUNDS, 1);
    const second = initParticles(30, BOUNDS, 2);
    expect(Array.from(first.positions)).not.toEqual(
      Array.from(second.positions),
    );
  });

  it('速度是慢速漂移（每步不超过 0.5）', () => {
    const { velocities } = initParticles(50, BOUNDS, 3);
    for (let index = 0; index < velocities.length; index += 1) {
      expect(Math.abs(velocities[index])).toBeLessThanOrEqual(0.5);
    }
  });
});

describe('advanceParticles', () => {
  it('粒子按速度漂移', () => {
    const positions = new Float32Array([0, 0, 0]);
    const velocities = new Float32Array([1, 0, 0]);
    advanceParticles(positions, velocities, 1 / 60, 1, BOUNDS);
    // step = delta * 60 = 1，位置推进一个速度单位
    expect(positions[0]).toBeCloseTo(1, 5);
  });

  it('越界后从对侧环绕', () => {
    const positions = new Float32Array([BOUNDS.width / 2, 0, 0]);
    const velocities = new Float32Array([1, 0, 0]);
    advanceParticles(positions, velocities, 1 / 60, 1, BOUNDS);
    // 超出右边界后回绕到左边界附近
    expect(positions[0]).toBeLessThan(BOUNDS.width / 2);
    expect(positions[0]).toBeGreaterThan(-BOUNDS.width / 2 - 2);
  });

  it('speed 为 0 时静止', () => {
    const positions = new Float32Array([5, 5, 5]);
    const velocities = new Float32Array([10, 10, 10]);
    advanceParticles(positions, velocities, 1 / 60, 0, BOUNDS);
    expect(positions[0]).toBe(5);
    expect(positions[1]).toBe(5);
  });

  // 边界：异常大的 delta（切后台回来）被钳制，粒子不会瞬移
  it('超大 delta 被钳制', () => {
    const positions = new Float32Array([0, 0, 0]);
    const velocities = new Float32Array([10, 10, 10]);
    advanceParticles(positions, velocities, 30, 1, BOUNDS);
    // delta 钳到 0.1s → step 最大 6，单步位移有限
    expect(Math.abs(positions[0])).toBeLessThan(BOUNDS.width);
  });
});

describe('collectLinks', () => {
  const near = new Float32Array([0, 0, 0, 10, 0, 0]); // 距离 10
  const far = new Float32Array([0, 0, 0, 500, 0, 0]); // 距离 500

  it('距离阈值内的粒子对生成连线', () => {
    const links = collectLinks(near, 20, 100);
    expect(links).toHaveLength(6); // 一条线段 = 两端各 3 坐标
  });

  it('距离外的粒子对不连线', () => {
    const links = collectLinks(far, 20, 100);
    expect(links).toHaveLength(0);
  });

  it('maxSegments 截断配对数量', () => {
    // 4 个点两两相近：完整配对 6 条，截断到 2 条
    const cluster = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]);
    const links = collectLinks(cluster, 5, 2);
    expect(links).toHaveLength(12); // 2 条线段 × 两端各 3 坐标
  });

  it('空粒子返回空连线', () => {
    expect(collectLinks(new Float32Array([]), 10, 10)).toHaveLength(0);
  });
});
