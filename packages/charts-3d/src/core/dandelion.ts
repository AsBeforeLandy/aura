/** 蒲公英风散场景的 3D 空间边界。 */
export interface DandelionBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

/** 蒲公英风场与物理推进参数。 */
export interface DandelionWindOptions {
  /** 主风力强度（0 = 静止轻晃，1 = 柔和微风，2+ = 强风吹散）。@default 1 */
  windStrength?: number;
  /** 归一化风向 [x, y, z]，默认向右上方吹拂。@default [1, 0.28, 0.08] */
  windDirection?: [number, number, number];
  /** 湍流扰动系数（控制飘散路径的柔美波浪感）。@default 1 */
  turbulence?: number;
  /** 是否在飘出画布后无缝在花托上重新生长循环。@default true */
  loop?: boolean;
  /** 可选实时阵风冲量（鼠标划过或点击时注入）。 */
  gust?: number;
}

/** 单个蒲公英小伞的运行时粒子状态（TypedArray 结构避免 GC）。 */
export interface DandelionSimulation {
  count: number;
  headCenter: [number, number, number];
  headRadius: number;
  bounds: DandelionBounds;
  /** 每颗种子在花托表面的初始单位法向（count * 3）。 */
  anchorNormals: Float32Array;
  /** 当前世界坐标（count * 3）。 */
  positions: Float32Array;
  /** 当前速度向量（count * 3）。 */
  velocities: Float32Array;
  /** 当前朝向欧拉角（count * 3）。 */
  rotations: Float32Array;
  /** 空中自转角速度（count * 3）。 */
  spins: Float32Array;
  /** 状态标记：0 = 附着花托，1 = 随风飘散。 */
  detached: Uint8Array;
  /** 脱离倒计时（秒），由迎风度与确定性随机决定。 */
  releaseTimers: Float32Array;
  /** 不透明度 / 生长缩放因子（0~1），用于边缘淡出与花托柔缓重生。 */
  opacities: Float32Array;
  /** 个体相位种子，用于错峰摇曳与湍流差异。 */
  phases: Float32Array;
  /** 累计运行时间（秒）。 */
  elapsed: number;
  /** 花托顶端当前悬臂弹性微弯偏移（根部严格固定为 0，仅中上段随风压柔弯）。 */
  stemOffset: [number, number, number];
  /** 花托顶端当前绕 Z 轴顺风微倾角（弧度），与花茎顶端切线自然衔接。 */
  stemTiltZ: number;
}

/** 变径花茎在风压下的悬臂弹性微弯状态。 */
export interface StemFlexState {
  /** 花托顶端的悬臂弹性偏移（花茎根部严格不动，沿茎身按 progress³ 弹性传导）。 */
  offset: [number, number, number];
  /** 花托绕 Z 轴的顺风微倾角（弧度）。 */
  tiltZ: number;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const DEFAULT_BOUNDS: DandelionBounds = {
  minX: -260,
  maxX: 320,
  minY: -180,
  maxY: 220,
  minZ: -210,
  maxZ: 65,
};

function createRng(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let v = state;
    v = Math.imul(v ^ (v >>> 15), v | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return ((v ^ (v >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function clampFinite(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

/** 归一化风向向量；零向量或非法输入回退到向右上微远方斜吹的 3D 微风。 */
export function normalizeWindDirection(
  dir?: [number, number, number],
): [number, number, number] {
  const defaultLen = Math.hypot(0.88, 0.28, -0.38);
  if (
    !dir ||
    dir.length !== 3 ||
    !Number.isFinite(dir[0]) ||
    !Number.isFinite(dir[1]) ||
    !Number.isFinite(dir[2])
  ) {
    return [0.88 / defaultLen, 0.28 / defaultLen, -0.38 / defaultLen];
  }
  const len = Math.hypot(dir[0], dir[1], dir[2]);
  if (len <= 1e-6) {
    return [0.88 / defaultLen, 0.28 / defaultLen, -0.38 / defaultLen];
  }
  return [dir[0] / len, dir[1] / len, dir[2] / len];
}

/** 将单颗种子复位于花托表面并重新赋予迎风脱离倒计时。 */
function resetSeedToHead(
  sim: DandelionSimulation,
  index: number,
  initialScatter: boolean,
  rand: () => number,
  windDir: [number, number, number],
): void {
  const i3 = index * 3;
  const nx = sim.anchorNormals[i3];
  const ny = sim.anchorNormals[i3 + 1];
  const nz = sim.anchorNormals[i3 + 2];
  const [cx, cy, cz] = sim.headCenter;
  const r = sim.headRadius;

  // 迎风面（点积为正的一侧）更早被风掀落，模拟真实蒲公英从风尾剥离的效果
  const windExposure = nx * windDir[0] + ny * windDir[1] + nz * windDir[2];
  const bias = Math.max(0, 1 - (windExposure + 1) * 0.45);

  sim.positions[i3] = cx + nx * r;
  sim.positions[i3 + 1] = cy + ny * r;
  sim.positions[i3 + 2] = cz + nz * r;
  sim.velocities[i3] = 0;
  sim.velocities[i3 + 1] = 0;
  sim.velocities[i3 + 2] = 0;
  // 附着态朝向沿球面法线向外（用极角与方位角存储）
  sim.rotations[i3] = Math.atan2(Math.hypot(nx, nz), ny);
  sim.rotations[i3 + 1] = Math.atan2(nx, nz);
  sim.rotations[i3 + 2] = 0;
  sim.detached[index] = 0;
  sim.releaseTimers[index] = 0.6 + bias * 9.5 + rand() * 5.2;
  sim.opacities[index] = initialScatter ? 1 : 0.05;
}

/**
 * 确定性初始化整株蒲公英绒球粒子场。
 *
 * 默认让约 28% 的迎风侧绒毛处于「正在随风飘散」的唯美中间态，
 * 避免首屏进入时像静止圆球、等待几秒才开始吹散。
 */
export function initDandelion(
  count = 200,
  headCenter: [number, number, number] = [-92, -12, 0],
  headRadius = 9.5,
  seed = 17,
  bounds: DandelionBounds = DEFAULT_BOUNDS,
): DandelionSimulation {
  const safeCount =
    Number.isFinite(count) && count > 0 ? Math.min(600, Math.trunc(count)) : 0;
  const safeRadius =
    Number.isFinite(headRadius) && headRadius > 2 ? headRadius : 9.5;
  const rng = createRng(Number.isFinite(seed) ? Math.trunc(seed) : 17);
  const windDir = normalizeWindDirection();

  const sim: DandelionSimulation = {
    count: safeCount,
    headCenter: [
      clampFinite(headCenter[0], -88),
      clampFinite(headCenter[1], -14),
      clampFinite(headCenter[2], 0),
    ],
    headRadius: safeRadius,
    bounds,
    anchorNormals: new Float32Array(safeCount * 3),
    positions: new Float32Array(safeCount * 3),
    velocities: new Float32Array(safeCount * 3),
    rotations: new Float32Array(safeCount * 3),
    spins: new Float32Array(safeCount * 3),
    detached: new Uint8Array(safeCount),
    releaseTimers: new Float32Array(safeCount),
    opacities: new Float32Array(safeCount),
    phases: new Float32Array(safeCount),
    elapsed: 0,
    stemOffset: [0, 0, 0],
    stemTiltZ: 0,
  };

  for (let i = 0; i < safeCount; i += 1) {
    const i3 = i * 3;
    // 斐波那契球面均匀排布 + 极轻微自然抖动
    const y = 1 - (2 * (i + 0.5)) / Math.max(1, safeCount);
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = GOLDEN_ANGLE * i + (rng() - 0.5) * 0.08;
    const nx = Math.cos(angle) * ring;
    const nz = Math.sin(angle) * ring;
    const len = Math.hypot(nx, y, nz) || 1;

    sim.anchorNormals[i3] = nx / len;
    sim.anchorNormals[i3 + 1] = y / len;
    sim.anchorNormals[i3 + 2] = nz / len;
    sim.phases[i] = rng() * Math.PI * 2;
    sim.spins[i3] = (rng() - 0.5) * 1.4;
    sim.spins[i3 + 1] = (rng() - 0.5) * 1.8;
    sim.spins[i3 + 2] = (rng() - 0.5) * 1.5;

    resetSeedToHead(sim, i, true, rng, windDir);

    // 让约 32% 迎风侧绒毛开场即分布在中远景三维气流中（自然渐远变小，不扑脸放大）
    const exposure =
      sim.anchorNormals[i3] * windDir[0] +
      sim.anchorNormals[i3 + 1] * windDir[1] +
      sim.anchorNormals[i3 + 2] * windDir[2];
    if (exposure > 0.05 && rng() < 0.6) {
      const flight = rng();
      const travel = 30 + flight * 260;
      const helix = flight * Math.PI * 2.2 + sim.phases[i];
      const spreadY = (rng() - 0.34) * 105 * flight + Math.sin(helix) * 20;
      const spreadZ = (-rng() * 115 + Math.cos(helix) * 28) * flight;
      sim.detached[i] = 1;
      sim.positions[i3] += windDir[0] * travel;
      sim.positions[i3 + 1] += windDir[1] * travel + spreadY;
      sim.positions[i3 + 2] = Math.min(
        bounds.maxZ - 12,
        sim.positions[i3 + 2] + windDir[2] * travel * 0.8 + spreadZ,
      );
      sim.velocities[i3] = windDir[0] * (32 + rng() * 26);
      sim.velocities[i3 + 1] = windDir[1] * 24 + (rng() - 0.4) * 12;
      sim.velocities[i3 + 2] = windDir[2] * 26 + (rng() - 0.6) * 14;
      sim.opacities[i] = Math.max(0.18, 1 - flight * 0.68);
    }
  }

  return sim;
}

/** 立即掀起一阵强风脉冲，批量吹散附着中的迎风绒毛并加速空中绒毛。 */
export function triggerWindGust(
  sim: DandelionSimulation,
  strength = 1.6,
  windDirection?: [number, number, number],
): number {
  const safeStrength = Math.max(0.2, Math.min(5, clampFinite(strength, 1.6)));
  const windDir = normalizeWindDirection(windDirection);
  let newlyDetached = 0;

  for (let i = 0; i < sim.count; i += 1) {
    const i3 = i * 3;
    const phase = sim.phases[i];
    if (sim.detached[i] === 0) {
      const nx = sim.anchorNormals[i3];
      const ny = sim.anchorNormals[i3 + 1];
      const exposure = nx * windDir[0] + ny * windDir[1];
      // 按迎风度与确定性相位掀落一批绒毛，保留部分绒球骨架维持蒲公英形态
      const threshold = 0.62 - safeStrength * 0.22;
      const wave = (Math.sin(phase * 3.1 + sim.elapsed * 2.3) + 1) * 0.5;
      if (exposure * 0.45 + wave * 0.55 > threshold) {
        sim.detached[i] = 1;
        sim.velocities[i3] = windDir[0] * (36 + wave * 42) * safeStrength;
        sim.velocities[i3 + 1] =
          (windDir[1] * 28 + (wave - 0.35) * 24) * safeStrength;
        sim.velocities[i3 + 2] = Math.cos(phase * 5) * 18 * safeStrength;
        newlyDetached += 1;
      }
    } else {
      sim.velocities[i3] += windDir[0] * 28 * safeStrength;
      sim.velocities[i3 + 1] +=
        (windDir[1] * 20 + Math.sin(phase + sim.elapsed) * 12) * safeStrength;
    }
  }
  return newlyDetached;
}

/**
 * 计算变径草本花茎在风压下的悬臂弹性微弯：
 * - 花茎底部牢牢扎根（位移严格为 0），仅中上段按变径悬臂梁规律顺风微弯；
 * - 以顺风定常柔倾为主，叠加极克制的多频非周期空气微呼吸，杜绝机械钟摆式左右摆动。
 */
export function computeStemFlex(
  elapsed: number,
  windStrength = 1,
  gust = 0,
  windDirection?: [number, number, number],
): StemFlexState {
  const t = clampFinite(elapsed, 0);
  const w = Math.max(0, clampFinite(windStrength, 1));
  const g = Math.max(0, clampFinite(gust, 0));
  const effective = Math.min(3.5, w + g);
  if (effective <= 0.005) {
    return { offset: [0, 0, 0], tiltZ: 0 };
  }

  const dir = normalizeWindDirection(windDirection);
  // 顺风定常轻压弯（始终顺风，不向逆风侧来回摆动）
  const steady = Math.min(3.2, effective * 1.15);
  // 不可公度三频叠加的柔和有机呼吸（正常清风仅约 ±0.6 单位，拒绝节拍器感）
  const wave =
    Math.sin(t * 0.78) * 0.52 +
    Math.sin(t * 1.87 + 1.1) * 0.31 +
    Math.cos(t * 3.13 + 2.4) * 0.17;
  const flutter = wave * Math.min(1.35, 0.22 + effective * 0.4);
  const flexMag = Math.max(0, steady + flutter);

  const dx = dir[0] * flexMag;
  // 悬臂梁弧长守恒：顺风微弯时花托顶端自然伴随极轻微下沉
  const dy = -flexMag * flexMag * 0.045 + dir[1] * flutter * 0.2;
  const dz = dir[2] * flexMag * 0.48;
  // 与 progress³ 变径曲线顶端切线自然吻合的极轻柔顺风颔首倾角
  const tiltZ = -dx * 0.011;

  return { offset: [dx, dy, dz], tiltZ };
}

/** 推进蒲公英风散物理模拟一帧（原地更新 TypedArray，零 GC 分配）。 */
export function advanceDandelion(
  sim: DandelionSimulation,
  delta: number,
  options: DandelionWindOptions = {},
): void {
  const dt = Math.min(0.05, Math.max(0, clampFinite(delta, 0)));
  if (dt === 0 || sim.count === 0) return;

  const windStrength = Math.max(0, clampFinite(options.windStrength, 1));
  const turbulence = Math.max(0, clampFinite(options.turbulence, 1));
  const loop = options.loop ?? true;
  const gust = Math.max(0, clampFinite(options.gust, 0));
  const windDir = normalizeWindDirection(options.windDirection);

  sim.elapsed += dt;
  const t = sim.elapsed;
  const effectiveWind = windStrength + gust;

  // 花茎底部固定不动，仅顶端花托随风压产生极克制的悬臂顺风弹性微倾
  const flex = computeStemFlex(t, windStrength, gust, windDir);
  sim.stemOffset[0] = flex.offset[0];
  sim.stemOffset[1] = flex.offset[1];
  sim.stemOffset[2] = flex.offset[2];
  sim.stemTiltZ = flex.tiltZ;

  const cosTilt = Math.cos(flex.tiltZ);
  const sinTilt = Math.sin(flex.tiltZ);
  const headX = sim.headCenter[0] + flex.offset[0];
  const headY = sim.headCenter[1] + flex.offset[1];
  const headZ = sim.headCenter[2] + flex.offset[2];
  const [cx] = sim.headCenter;
  const r = sim.headRadius;
  const { minX, maxX, minY, maxY, minZ, maxZ } = sim.bounds;

  for (let i = 0; i < sim.count; i += 1) {
    const i3 = i * 3;
    const phase = sim.phases[i];

    if (sim.detached[i] === 0) {
      // 附着花托：紧随花托微倾锚定在表面（不滑移、不来回甩动），等待风力吹离
      const nx = sim.anchorNormals[i3];
      const ny = sim.anchorNormals[i3 + 1];
      const nz = sim.anchorNormals[i3 + 2];
      const rx = nx * cosTilt - ny * sinTilt;
      const ry = nx * sinTilt + ny * cosTilt;
      sim.positions[i3] = headX + rx * r;
      sim.positions[i3 + 1] = headY + ry * r;
      sim.positions[i3 + 2] = headZ + nz * r;
      if (sim.opacities[i] < 1) {
        sim.opacities[i] = Math.min(1, sim.opacities[i] + dt * 0.9);
      }

      if (effectiveWind > 0.02) {
        sim.releaseTimers[i] -= dt * (0.45 + effectiveWind * 0.85);
        if (sim.releaseTimers[i] <= 0 && sim.opacities[i] >= 0.85) {
          sim.detached[i] = 1;
          const boost = 24 + (Math.sin(phase * 7.3) + 1) * 0.5 * 26;
          sim.velocities[i3] =
            (windDir[0] * boost + nx * 10) * Math.max(0.5, effectiveWind);
          sim.velocities[i3 + 1] =
            (windDir[1] * boost + ny * 8 + 6) * Math.max(0.5, effectiveWind);
          sim.velocities[i3 + 2] =
            (windDir[2] * boost + nz * 10) * Math.max(0.5, effectiveWind);
        }
      }
      continue;
    }

    // 随风飘散态：主风力 + 3D 螺旋涡旋湍流（X/Y/Z 立体起伏）+ 温和阻尼 + 三轴翻滚
    const px = sim.positions[i3];
    const py = sim.positions[i3 + 1];
    const pz = sim.positions[i3 + 2];

    const swirlAngle = t * 1.3 + phase + px * 0.014;
    const curlX = Math.cos(py * 0.02 + t * 1.15 + phase) * 14 * turbulence;
    const curlY = Math.sin(swirlAngle) * 20 * turbulence + 4.5;
    // Z 轴向中远景柔和展开，避免粒子贴脸放大
    const curlZ = Math.cos(swirlAngle * 0.9 + pz * 0.012) * 22 * turbulence;
    const zSpread = (Math.sin(phase * 3.7) * 0.45 - 0.25) * 24;

    const targetVx = windDir[0] * (40 * Math.max(0.25, effectiveWind)) + curlX;
    const targetVy = windDir[1] * (30 * Math.max(0.25, effectiveWind)) + curlY;
    const targetVz =
      (windDir[2] * 34 + zSpread) * Math.max(0.25, effectiveWind) + curlZ;

    const drag = Math.min(1, dt * 1.75);
    sim.velocities[i3] += (targetVx - sim.velocities[i3]) * drag;
    sim.velocities[i3 + 1] += (targetVy - sim.velocities[i3 + 1]) * drag;
    sim.velocities[i3 + 2] += (targetVz - sim.velocities[i3 + 2]) * drag;

    sim.positions[i3] = px + sim.velocities[i3] * dt;
    sim.positions[i3 + 1] = py + sim.velocities[i3 + 1] * dt;
    sim.positions[i3 + 2] = pz + sim.velocities[i3 + 2] * dt;

    sim.rotations[i3] += sim.spins[i3] * dt * 1.25;
    sim.rotations[i3 + 1] += sim.spins[i3 + 1] * dt * 1.35;
    sim.rotations[i3 + 2] += sim.spins[i3 + 2] * dt * 1.2;

    // 横向边缘与贴近镜头前缘均柔和渐隐，营造电影擦镜景深效果
    const progressX =
      maxX > cx ? Math.max(0, (sim.positions[i3] - cx) / (maxX - cx)) : 0;
    const fadeX =
      progressX > 0.65 ? Math.max(0, 1 - (progressX - 0.65) / 0.35) : 1;
    const fadeNearZ =
      sim.positions[i3 + 2] > maxZ - 55
        ? Math.max(0, (maxZ - sim.positions[i3 + 2]) / 55)
        : 1;
    const fadeFarZ =
      sim.positions[i3 + 2] < minZ + 55
        ? Math.max(0, (sim.positions[i3 + 2] - minZ) / 55)
        : 1;
    sim.opacities[i] = fadeX * fadeNearZ * fadeFarZ;

    const outOfBounds =
      sim.positions[i3] > maxX ||
      sim.positions[i3] < minX ||
      sim.positions[i3 + 1] > maxY ||
      sim.positions[i3 + 1] < minY ||
      sim.positions[i3 + 2] > maxZ ||
      sim.positions[i3 + 2] < minZ;

    if (outOfBounds) {
      if (loop) {
        const deterministic = () => {
          const s = Math.sin(i * 19.19 + t * 7.13) * 43758.5453;
          return s - Math.floor(s);
        };
        resetSeedToHead(sim, i, false, deterministic, windDir);
      } else {
        sim.opacities[i] = 0;
      }
    }
  }
}

/** 重新凝聚所有飘散绒毛回蒲公英花托。 */
export function regatherDandelion(sim: DandelionSimulation): void {
  const windDir = normalizeWindDirection();
  for (let i = 0; i < sim.count; i += 1) {
    const deterministic = () => {
      const s = Math.sin(i * 31.7 + sim.phases[i] * 13.3) * 43758.5453;
      return s - Math.floor(s);
    };
    resetSeedToHead(sim, i, true, deterministic, windDir);
  }
}

/**
 * 构造柔韧微弯花茎的 3D 样条采样点（从画布左下方自然弯向花托底部）。
 */
export function buildStemCurvePoints(
  base: [number, number, number],
  headCenter: [number, number, number],
  swayOffset: [number, number] = [0, 0],
  segments = 24,
): [number, number, number][] {
  const count = Math.max(2, Math.trunc(segments));
  const [bx, by, bz] = base;
  const hx = headCenter[0] + swayOffset[0];
  const hy = headCenter[1] + swayOffset[1];
  const hz = headCenter[2];
  // 二次贝塞尔控制点：向左侧微弓出柔和植物弧度
  const ctrlX = (bx + hx) * 0.5 - 24 + swayOffset[0] * 0.4;
  const ctrlY = (by + hy) * 0.5 + 14 + swayOffset[1] * 0.4;
  const ctrlZ = (bz + hz) * 0.5;

  const points: [number, number, number][] = [];
  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    const inv = 1 - t;
    points.push([
      inv * inv * bx + 2 * inv * t * ctrlX + t * t * hx,
      inv * inv * by + 2 * inv * t * ctrlY + t * t * hy,
      inv * inv * bz + 2 * inv * t * ctrlZ + t * t * hz,
    ]);
  }
  return points;
}

/**
 * 构造单颗蒲公英小伞的局部 3D 线段几何数据（修长果喙细柄 + 微弯放射状冠毛羽丝伞）。
 * 返回扁平 lineSegments 坐标数组（每 6 个数一条线段），局部基准为原点 (0,0,0) 沿 +Y 生长。
 */
export function buildPappusLinePositions(
  stalkLength = 31,
  crownRadius = 7.4,
  rayCount = 12,
): number[] {
  const safeStalk =
    Number.isFinite(stalkLength) && stalkLength > 0 ? stalkLength : 31;
  const safeCrown =
    Number.isFinite(crownRadius) && crownRadius > 0 ? crownRadius : 7.4;
  const rays = Math.max(4, Math.min(20, Math.trunc(rayCount)));

  const lines: number[] = [];
  // 主细柄：直接从花托瘦果处修长放射至冠毛伞心
  lines.push(0, 0, 0, 0, safeStalk, 0);

  // 两段折线拟合微向上拱的自然放射羽丝，呈现蓬松绒毛质感
  for (let i = 0; i < rays; i += 1) {
    const angle = (i / rays) * Math.PI * 2;
    const even = i % 2 === 0;
    const r = safeCrown * (even ? 1 : 0.76);
    const midR = r * 0.52;
    const midY = safeStalk + safeCrown * (even ? 0.16 : 0.34);
    const endY = safeStalk + safeCrown * (even ? 0.44 : 0.68);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    lines.push(0, safeStalk, 0, cos * midR, midY, sin * midR);
    lines.push(cos * midR, midY, sin * midR, cos * r, endY, sin * r);
  }

  return lines;
}

/** 变径有机花茎或总苞片网格数据（用于渐变着色与底部渐隐）。 */
export interface DandelionMeshData {
  positions: number[];
  normals: number[];
  /** 归一化长度进度 t ∈ [0, 1]。 */
  progress: number[];
  indices: number[];
}

/** 沿样条曲线构造变径有机植物花茎网格（底部粗、中段纤细、顶部微膨承托花托）。 */
export function buildStemMeshData(
  base: [number, number, number],
  headCenter: [number, number, number],
  segments = 28,
  radialSegments = 10,
): DandelionMeshData {
  const pts = buildStemCurvePoints(base, headCenter, [0, 0], segments);
  const count = pts.length;
  const radial = Math.max(5, Math.trunc(radialSegments));
  const positions: number[] = [];
  const normals: number[] = [];
  const progress: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const p = pts[i];
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(count - 1, i + 1)];
    let tx = next[0] - prev[0];
    let ty = next[1] - prev[1];
    let tz = next[2] - prev[2];
    const tLen = Math.hypot(tx, ty, tz) || 1;
    tx /= tLen;
    ty /= tLen;
    tz /= tLen;

    let sx = -ty;
    let sy = tx;
    let sz = 0;
    const sLen = Math.hypot(sx, sy, sz) || 1;
    sx /= sLen;
    sy /= sLen;
    sz /= sLen;
    const bx = ty * sz - tz * sy;
    const by = tz * sx - tx * sz;
    const bz = tx * sy - ty * sx;

    // 根部 3.3 → 中上段纤细 1.65 → 顶端衔接花托处自然膨大至 4.2
    const taper = 3.3 - t * 1.65;
    const collar = t > 0.88 ? Math.pow((t - 0.88) / 0.12, 2) * 2.6 : 0;
    const r = taper + collar;

    for (let s = 0; s < radial; s += 1) {
      const a = (s / radial) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const nx = sx * cos + bx * sin;
      const ny = sy * cos + by * sin;
      const nz = sz * cos + bz * sin;
      positions.push(p[0] + nx * r, p[1] + ny * r, p[2] + nz * r);
      normals.push(nx, ny, nz);
      progress.push(t);
    }
  }

  for (let i = 0; i < count - 1; i += 1) {
    const rowA = i * radial;
    const rowB = rowA + radial;
    for (let s = 0; s < radial; s += 1) {
      const next = (s + 1) % radial;
      const a = rowA + s;
      const b = rowB + s;
      const c = rowB + next;
      const d = rowA + next;
      indices.push(a, b, d, b, c, d);
    }
  }

  return { positions, normals, progress, indices };
}

/** 构造花托下方自然向下反卷的细尖总苞片（萼片）网格，真实衔接花茎与花托。 */
export function buildBractsGeometryData(
  bractCount = 14,
  baseRadius = 5.2,
  length = 15,
): DandelionMeshData {
  const count = Math.max(4, Math.min(24, Math.trunc(bractCount)));
  const positions: number[] = [];
  const normals: number[] = [];
  const progress: number[] = [];
  const indices: number[] = [];
  const steps = 5;
  let offset = 0;

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.12;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tx = -sin;
    const tz = cos;
    const bractLen = length * (i % 2 === 0 ? 1 : 0.82);
    const baseHalfW = i % 2 === 0 ? 1.85 : 1.45;
    const startY = i % 2 === 0 ? -4.2 : -5.4;

    for (let s = 0; s <= steps; s += 1) {
      const u = s / steps;
      const radial =
        baseRadius + Math.sin(u * Math.PI * 0.72) * bractLen * 0.68;
      const y = startY - Math.pow(u, 1.35) * bractLen * 0.86;
      const halfW = baseHalfW * (1 - Math.pow(u, 1.25));
      const cx = cos * radial;
      const cz = sin * radial;
      const nx = cos * 0.82;
      const ny = 0.57;
      const nz = sin * 0.82;

      positions.push(cx - tx * halfW, y, cz - tz * halfW);
      normals.push(nx, ny, nz);
      progress.push(u);

      positions.push(cx + tx * halfW, y, cz + tz * halfW);
      normals.push(nx, ny, nz);
      progress.push(u);
    }

    for (let s = 0; s < steps; s += 1) {
      const a = offset + s * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
    offset += (steps + 1) * 2;
  }

  return { positions, normals, progress, indices };
}
