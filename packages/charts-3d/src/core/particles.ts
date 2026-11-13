/**
 * 粒子背景的纯函数层（jsdom 可直接单测）。
 *
 * 装饰组件的原则：确定性 > 随机性。同一份 seed 每次渲染完全一致，
 * 才能保证录屏、截图对比与 SSR 水合的可预期。
 */

export interface ParticleBounds {
  /** 世界坐标半宽（x ∈ [-w/2, w/2]） */
  width: number;
  /** 世界坐标半高（y ∈ [-h/2, h/2]） */
  height: number;
  /** 世界坐标半深（z ∈ [-d/2, d/2]） */
  depth: number;
}

/** 确定性伪随机：同一个 seed 恒定返回同一值（与库内其它包惯例一致） */
function seeded(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * 初始化粒子的位置与速度。
 *
 * 位置均匀撒在 bounds 内，速度是每轴 ±0.4 的慢速漂移——
 * 背景装饰的粒子应该「几乎静止地活着」，快速乱窜会抢内容的视觉焦点。
 */
export function initParticles(
  count: number,
  bounds: ParticleBounds,
  seed = 1,
): { positions: Float32Array; velocities: Float32Array } {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const base = index * 3;
    positions[base] = (seeded(seed + index * 3) - 0.5) * bounds.width;
    positions[base + 1] = (seeded(seed + index * 3 + 1) - 0.5) * bounds.height;
    positions[base + 2] = (seeded(seed + index * 3 + 2) - 0.5) * bounds.depth;

    velocities[base] = (seeded(seed + count + index * 3) - 0.5) * 0.8;
    velocities[base + 1] = (seeded(seed + count + index * 3 + 1) - 0.5) * 0.8;
    velocities[base + 2] = (seeded(seed + count + index * 3 + 2) - 0.5) * 0.4;
  }

  return { positions, velocities };
}

/**
 * 推进粒子：按速度漂移，越界后从对侧环绕（无缝循环的星野）。
 *
 * 就地修改 positions —— 每帧调用，避免大数组的重复分配；
 * delta 归一到 60fps 步长，速度系数 speed 再整体缩放。
 */
export function advanceParticles(
  positions: Float32Array,
  velocities: Float32Array,
  delta: number,
  speed: number,
  bounds: ParticleBounds,
): void {
  const step = Math.min(delta, 0.1) * 60 * speed;
  const halfW = bounds.width / 2;
  const halfH = bounds.height / 2;
  const halfD = bounds.depth / 2;

  for (let index = 0; index < positions.length; index += 3) {
    positions[index] += velocities[index] * step;
    positions[index + 1] += velocities[index + 1] * step;
    positions[index + 2] += velocities[index + 2] * step;

    if (positions[index] > halfW) positions[index] -= bounds.width;
    else if (positions[index] < -halfW) positions[index] += bounds.width;

    if (positions[index + 1] > halfH) positions[index + 1] -= bounds.height;
    else if (positions[index + 1] < -halfH)
      positions[index + 1] += bounds.height;

    if (positions[index + 2] > halfD) positions[index + 2] -= bounds.depth;
    else if (positions[index + 2] < -halfD)
      positions[index + 2] += bounds.depth;
  }
}

/**
 * 收集距离阈值内的连线端点（展开的坐标数组，供 LineSegments 使用）。
 *
 * 返回连线两端的**原始坐标**（不居中、不缩放）——连线跟着粒子走。
 * maxSegments 截断是防御性的：粒子数大 + 阈值大时 O(n²) 的配对数
 * 会爆炸，截断保证每帧成本有上界。
 */
export function collectLinks(
  positions: Float32Array,
  linkDistance: number,
  maxSegments = 400,
): Float32Array {
  const count = positions.length / 3;
  const segments: number[] = [];
  const maxDistSq = linkDistance * linkDistance;
  let links = 0;

  for (let i = 0; i < count && links < maxSegments; i += 1) {
    for (let j = i + 1; j < count && links < maxSegments; j += 1) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < maxDistSq) {
        segments.push(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2],
          positions[j * 3],
          positions[j * 3 + 1],
          positions[j * 3 + 2],
        );
        links += 1;
      }
    }
  }

  return new Float32Array(segments);
}
