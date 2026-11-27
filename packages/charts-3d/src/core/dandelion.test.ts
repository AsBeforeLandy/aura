import { describe, expect, it } from 'vitest';
import {
  advanceDandelion,
  buildBractsGeometryData,
  buildPappusLinePositions,
  buildStemCurvePoints,
  buildStemMeshData,
  computeStemFlex,
  initDandelion,
  normalizeWindDirection,
  regatherDandelion,
  triggerWindGust,
} from './dandelion';

describe('dandelion core', () => {
  it('normalizeWindDirection 归一化合法方向并回退非法/零向量', () => {
    const dir = normalizeWindDirection([3, 4, 0]);
    expect(dir[0]).toBeCloseTo(0.6, 6);
    expect(dir[1]).toBeCloseTo(0.8, 6);
    expect(dir[2]).toBe(0);

    const fallbackZero = normalizeWindDirection([0, 0, 0]);
    expect(Math.hypot(...fallbackZero)).toBeCloseTo(1, 6);

    const fallbackNaN = normalizeWindDirection([Number.NaN, 1, 0]);
    expect(Math.hypot(...fallbackNaN)).toBeCloseTo(1, 6);
  });

  it('initDandelion 确定性生成绒球，且首屏即有部分迎风绒毛处于飘散态', () => {
    const a = initDandelion(160, [-80, -10, 0], 40, 17);
    const b = initDandelion(160, [-80, -10, 0], 40, 17);
    expect(a.count).toBe(160);
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
    expect(Array.from(a.positions).every(Number.isFinite)).toBe(true);

    const detachedCount = Array.from(a.detached).filter((d) => d === 1).length;
    expect(detachedCount).toBeGreaterThan(0);
    expect(detachedCount).toBeLessThan(a.count);
  });

  it('advanceDandelion 推进风场后空中粒子位移且所有坐标保持有限', () => {
    const sim = initDandelion(80, [-80, -10, 0], 40, 7);
    const before = new Float32Array(sim.positions);
    for (let step = 0; step < 60; step += 1) {
      advanceDandelion(sim, 0.03, {
        windStrength: 1.4,
        turbulence: 1,
        loop: true,
      });
    }
    expect(sim.elapsed).toBeCloseTo(1.8, 4);
    expect(Array.from(sim.positions).every(Number.isFinite)).toBe(true);
    let moved = 0;
    for (let i = 0; i < sim.positions.length; i += 1) {
      if (Math.abs(sim.positions[i] - before[i]) > 1e-3) moved += 1;
    }
    expect(moved).toBeGreaterThan(0);

    // 附着绒毛应紧随悬臂微弯的花托表面锚定（距当前花托中心严格等于 headRadius，不脱节滑移）
    const headX = sim.headCenter[0] + sim.stemOffset[0];
    const headY = sim.headCenter[1] + sim.stemOffset[1];
    const headZ = sim.headCenter[2] + sim.stemOffset[2];
    for (let i = 0; i < sim.count; i += 1) {
      if (sim.detached[i] === 0) {
        const i3 = i * 3;
        const dist = Math.hypot(
          sim.positions[i3] - headX,
          sim.positions[i3 + 1] - headY,
          sim.positions[i3 + 2] - headZ,
        );
        expect(dist).toBeCloseTo(sim.headRadius, 4);
      }
    }
  });

  it('computeStemFlex 静风为零偏移，有风时始终顺风克制柔弯而不逆向来回摆动', () => {
    const calm = computeStemFlex(3.2, 0, 0, [1, 0, 0]);
    expect(calm.offset).toEqual([0, 0, 0]);
    expect(calm.tiltZ).toBe(0);

    // 多个时间点采样均保持顺风侧小幅柔弯（dx >= 0 且有上界），倾角与弯折方向一致
    for (let step = 0; step < 20; step += 1) {
      const flex = computeStemFlex(step * 0.4, 1, 0, [1, 0.2, 0]);
      expect(flex.offset[0]).toBeGreaterThanOrEqual(0);
      expect(flex.offset[0]).toBeLessThan(3.5);
      expect(flex.tiltZ).toBeLessThanOrEqual(0);
    }

    const gustFlex = computeStemFlex(1.0, 1, 2, [1, 0, 0]);
    expect(gustFlex.offset[0]).toBeGreaterThan(1.5);
    expect(gustFlex.offset[1]).toBeLessThan(0);
  });

  it('loop=false 时飞出边界的粒子透明度归零而不重生', () => {
    const sim = initDandelion(20, [0, 0, 0], 20, 3, {
      minX: -50,
      maxX: 50,
      minY: -50,
      maxY: 50,
      minZ: -50,
      maxZ: 50,
    });
    triggerWindGust(sim, 4, [1, 0, 0]);
    for (let step = 0; step < 120; step += 1) {
      advanceDandelion(sim, 0.05, { windStrength: 3, loop: false });
    }
    const faded = Array.from(sim.opacities).filter((o) => o === 0).length;
    expect(faded).toBeGreaterThan(0);
  });

  it('triggerWindGust 批量吹落绒毛，regatherDandelion 重新凝聚全部绒毛', () => {
    const sim = initDandelion(100, [-80, -10, 0], 40, 11);
    regatherDandelion(sim);
    expect(Array.from(sim.detached).every((d) => d === 0)).toBe(true);

    const blown = triggerWindGust(sim, 2.2);
    expect(blown).toBeGreaterThan(0);
    expect(Array.from(sim.detached).some((d) => d === 1)).toBe(true);

    regatherDandelion(sim);
    expect(Array.from(sim.detached).every((d) => d === 0)).toBe(true);
  });

  it('buildStemCurvePoints 与 buildPappusLinePositions 生成有限几何且安全处理异常入参', () => {
    const stem = buildStemCurvePoints(
      [-120, -160, 0],
      [-80, -10, 0],
      [3, 1],
      12,
    );
    expect(stem).toHaveLength(13);
    expect(stem[0]).toEqual([-120, -160, 0]);
    expect(stem[12]).toEqual([-77, -9, 0]);

    const pappus = buildPappusLinePositions(31, 7.4, 8);
    // 1 根主柄 + 8 根两段微弯羽丝 (16 段) = 17 条线段 * 6 坐标
    expect(pappus).toHaveLength(17 * 6);
    expect(pappus.every(Number.isFinite)).toBe(true);

    const stemMesh = buildStemMeshData([-146, -196, -8], [-92, -12, 0], 12, 6);
    expect(stemMesh.positions.length).toBe(13 * 6 * 3);
    expect(stemMesh.normals.length).toBe(stemMesh.positions.length);
    expect(stemMesh.indices.length).toBe(12 * 6 * 6);
    expect(stemMesh.positions.every(Number.isFinite)).toBe(true);

    const bracts = buildBractsGeometryData(12, 5.2, 15);
    expect(bracts.positions.length).toBeGreaterThan(0);
    expect(bracts.indices.length % 3).toBe(0);
    expect(bracts.positions.every(Number.isFinite)).toBe(true);

    const safeEmpty = initDandelion(0, [Number.NaN, 0, 0], -5);
    expect(safeEmpty.count).toBe(0);
    advanceDandelion(safeEmpty, 0.016);
    expect(buildPappusLinePositions(-1, Number.NaN, 1)).toHaveLength(9 * 6);
  });
});
