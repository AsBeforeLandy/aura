import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { mixColor, useElementSize } from '@aura-react-comp/charts';
import { readTokenColor, useThemeVersion } from '../core/useThemeVersion';
import {
  advanceDandelion,
  buildBractsGeometryData,
  buildPappusLinePositions,
  buildStemMeshData,
  initDandelion,
  normalizeWindDirection,
  regatherDandelion,
  triggerWindGust,
} from '../core/dandelion';

export {
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
} from '../core/dandelion';
export type {
  DandelionBounds,
  DandelionMeshData,
  DandelionSimulation,
  DandelionWindOptions,
  StemFlexState,
} from '../core/dandelion';

/** DandelionField 组件属性（独立 3D 氛围背景，无需外包 Scene3D）。 */
export interface DandelionFieldProps {
  /** 蒲公英小伞数量（默认 180，建议 120~260）。@default 180 */
  count?: number;
  /** 主风力强度（0 = 静风停驻，1 = 柔和微风，2+ = 强风吹散）。@default 1 */
  windStrength?: number;
  /** 风向三维向量，默认向右上方微远景吹拂。@default [0.88, 0.28, -0.38] */
  windDirection?: [number, number, number];
  /** 气流湍流强度。@default 1 */
  turbulence?: number;
  /** 飘出画面后是否无缝循环再生。@default true */
  loop?: boolean;
  /** 冠毛羽丝与光尘主色。@default '#f8fafc' */
  seedColor?: string;
  /** 瘦果与柔和光晕点缀色；缺省读取主题主色。 */
  accentColor?: string;
  /** 花茎与花托颜色。@default '#4b6b5c' */
  stemColor?: string;
  /** 是否开启鼠标轻拂微风与点击阵风交互。@default true */
  interactive?: boolean;
  /** 声明式阵风触发信号：每次递增触发一阵强风吹散绒毛。 */
  gustSignal?: number;
  /** 声明式重聚信号：每次递增使全部绒毛重新凝聚于花托。 */
  regatherSignal?: number;
  /** 容器高度（px）。@default 420 */
  height?: number;
  /** 自定义类名。 */
  className?: string;
  /** 自定义样式（可自由设置深空、晨雾或自定义背景渐变）。 */
  style?: React.CSSProperties;
  /** 可选前景内容（如 Hero 标题、卡片等），自动叠置于 3D 背景之上。 */
  children?: React.ReactNode;
}

const HEAD_CENTER: [number, number, number] = [-92, -12, 0];
const STEM_BASE: [number, number, number] = [-152, -220, -8];
const HEAD_RADIUS = 9.5;
const UP_AXIS = new THREE.Vector3(0, 1, 0);

/** 植物花茎逆光着色器：底端牢牢扎根不动，中上段按 progress³ 悬臂柔弯 + 逆光微光。 */
const STEM_VERTEX = `
  attribute float aProgress;
  uniform vec3 uFlexOffset;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vProgress;
  void main() {
    vProgress = aProgress;
    float bend = aProgress * aProgress * aProgress;
    vec3 bentPos = position + uFlexOffset * bend;
    vec4 mvPos = modelViewMatrix * vec4(bentPos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const STEM_FRAGMENT = `
  uniform vec3 uBaseColor;
  uniform vec3 uTipColor;
  uniform vec3 uRimColor;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vProgress;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);
    vec3 lightDir = normalize(vec3(0.45, 0.72, 0.52));
    float diff = dot(n, lightDir) * 0.5 + 0.5;
    vec3 col = mix(uBaseColor, uTipColor, vProgress) * (0.58 + 0.42 * diff);
    float rim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.3);
    col = mix(col, uRimColor, rim * (0.28 + 0.34 * vProgress));
    float alpha = smoothstep(0.0, 0.08, vProgress);
    gl_FragColor = vec4(col, alpha);
  }
`;

/** 真实花托中心着色器：暖橄榄/茶褐柔光 + 细密蜂窝种子孔肌理 + 柔和边缘过渡。 */
const RECEPTACLE_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vPos;
  void main() {
    vPos = normalize(position);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const RECEPTACLE_FRAGMENT = `
  uniform vec3 uCoreColor;
  uniform vec3 uPitColor;
  uniform vec3 uRimColor;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vPos;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);
    vec3 lightDir = normalize(vec3(0.45, 0.7, 0.55));
    float diff = dot(n, lightDir) * 0.5 + 0.5;
    float pattern = sin(vPos.x * 26.0) * sin(vPos.y * 26.0) * sin(vPos.z * 26.0);
    float pit = smoothstep(0.12, 0.52, pattern);
    vec3 col = mix(uCoreColor, uPitColor, pit * 0.55) * (0.52 + 0.48 * diff);
    float rim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.2);
    col = mix(col, uRimColor, rim * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const SOFT_DOT_VERTEX = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    float dist = max(-mvPos.z, 180.0);
    gl_PointSize = aSize * (300.0 / dist);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const SOFT_DOT_FRAGMENT = `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = pow(1.0 - d * 2.0, 1.85);
    float alpha = glow * vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/** 深度感知 3D 羽丝着色器：按与相机真实纵深产生前后半球明暗分层与远景渐隐。 */
const PAPPUS_VERTEX = `
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vDepthFactor;
  void main() {
    vColor = aColor;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    float dist = -mvPos.z;
    vDepthFactor = clamp(1.22 - (dist - 245.0) / 240.0, 0.26, 1.15);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const PAPPUS_FRAGMENT = `
  varying vec3 vColor;
  varying float vDepthFactor;
  void main() {
    vec3 col = vColor * vDepthFactor;
    float alpha = clamp(0.28 + vDepthFactor * 0.58, 0.16, 0.9);
    gl_FragColor = vec4(col, alpha);
  }
`;

/** 静态 CSS 降级占位：WebGL 不可用时仍保留蒲公英飘散光尘氛围。 */
function StaticDandelionFallback({ color }: { color: string }) {
  const specks = useMemo(
    () =>
      Array.from({ length: 32 }, (_, idx) => {
        const t = idx / 32;
        return {
          left: `${16 + t * 76}%`,
          top: `${54 - Math.sin(idx * 2.1) * 28 - t * 24}%`,
          size: idx % 4 === 0 ? 5 : 3,
          opacity: 0.25 + (1 - t) * 0.55,
        };
      }),
    [],
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      {specks.map((item, idx) => (
        <span
          key={idx}
          style={{
            position: 'absolute',
            left: item.left,
            top: item.top,
            width: item.size,
            height: item.size,
            borderRadius: '50%',
            background: color,
            opacity: item.opacity,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

class FieldErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** 蒲公英核心 3D 场景：花茎 + 花托 + Instanced 瘦果 + 3D 羽丝小伞 + 柔光羽绒与散景光尘。 */
function DandelionScene({
  count,
  windStrength,
  windDirection,
  turbulence,
  loop,
  seedColor,
  accentColor,
  stemColor,
  gustSignal,
  regatherSignal,
  pointerRef,
}: {
  count: number;
  windStrength: number;
  windDirection?: [number, number, number];
  turbulence: number;
  loop: boolean;
  seedColor: string;
  accentColor: string;
  stemColor: string;
  gustSignal: number;
  regatherSignal: number;
  pointerRef: React.MutableRefObject<{ x: number; y: number; boost: number }>;
}) {
  const { camera, gl } = useThree();
  const sim = useMemo(
    () => initDandelion(count, HEAD_CENTER, HEAD_RADIUS, 17),
    [count],
  );

  const reducedMotion =
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const smoothWindRef = useRef(windStrength);

  // 响应外部声明式阵风与重聚触发信号
  const prevGust = useRef(gustSignal);
  useEffect(() => {
    if (gustSignal !== prevGust.current) {
      prevGust.current = gustSignal;
      triggerWindGust(sim, 1.85, windDirection);
      // 同步注入一阵柔风脉冲，让花茎中上段顺势优雅轻伏并弹性回弹
      pointerRef.current.boost = Math.min(
        2.2,
        Math.max(pointerRef.current.boost, 1.45),
      );
    }
  }, [gustSignal, pointerRef, sim, windDirection]);

  const prevRegather = useRef(regatherSignal);
  useEffect(() => {
    if (regatherSignal !== prevRegather.current) {
      prevRegather.current = regatherSignal;
      regatherDandelion(sim);
    }
  }, [regatherSignal, sim]);

  // 1) 变径有机花茎网格 + 逆光着色器
  const stemGeometry = useMemo(() => {
    const data = buildStemMeshData(STEM_BASE, HEAD_CENTER, 30, 12);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(data.positions), 3),
    );
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(data.normals), 3),
    );
    geometry.setAttribute(
      'aProgress',
      new THREE.BufferAttribute(new Float32Array(data.progress), 1),
    );
    geometry.setIndex(data.indices);
    geometry.computeBoundingSphere();
    return geometry;
  }, []);
  useEffect(() => () => stemGeometry.dispose(), [stemGeometry]);

  const stemMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uBaseColor: {
            value: new THREE.Color(mixColor(stemColor, '#0b1410', 0.45)),
          },
          uTipColor: {
            value: new THREE.Color(mixColor(stemColor, '#8fae7c', 0.38)),
          },
          uRimColor: {
            value: new THREE.Color(mixColor(seedColor, '#c7e3b0', 0.52)),
          },
          uFlexOffset: { value: new THREE.Vector3() },
        },
        vertexShader: STEM_VERTEX,
        fragmentShader: STEM_FRAGMENT,
        transparent: true,
      }),
    [seedColor, stemColor],
  );
  useEffect(() => () => stemMaterial.dispose(), [stemMaterial]);

  // 1b) 花托下方自然反卷的细尖总苞片（萼片）
  const bractsGeometry = useMemo(() => {
    const data = buildBractsGeometryData(14, 5.2, 16);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(data.positions), 3),
    );
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(data.normals), 3),
    );
    geometry.setIndex(data.indices);
    geometry.computeBoundingSphere();
    return geometry;
  }, []);
  useEffect(() => () => bractsGeometry.dispose(), [bractsGeometry]);

  // 1c) 真实微点蜂窝花托材质（彻底取代单调发紫大球）
  const receptacleMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uCoreColor: {
            value: new THREE.Color(mixColor(stemColor, '#9e8f68', 0.58)),
          },
          uPitColor: {
            value: new THREE.Color(mixColor(stemColor, '#2e291d', 0.65)),
          },
          uRimColor: {
            value: new THREE.Color(mixColor(seedColor, '#e7dec2', 0.55)),
          },
        },
        vertexShader: RECEPTACLE_VERTEX,
        fragmentShader: RECEPTACLE_FRAGMENT,
      }),
    [seedColor, stemColor],
  );
  useEffect(() => () => receptacleMaterial.dispose(), [receptacleMaterial]);

  // 2) 单颗小伞的局部 3D 修长细柄 + 12 根微弯蓬松羽丝模板
  const localPappus = useMemo(() => buildPappusLinePositions(31, 7.6, 12), []);
  const vertsPerSeed = localPappus.length / 3;
  const pappusGeometry = useMemo(() => {
    const totalVerts = sim.count * vertsPerSeed;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(totalVerts * 3), 3),
    );
    geometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(new Float32Array(totalVerts * 3), 3),
    );
    return geometry;
  }, [sim.count, vertsPerSeed]);
  useEffect(() => () => pappusGeometry.dispose(), [pappusGeometry]);

  const pappusMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PAPPUS_VERTEX,
        fragmentShader: PAPPUS_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => pappusMaterial.dispose(), [pappusMaterial]);

  // 3) 冠毛柔光羽绒微粒 + 72 颗背景散景光尘
  const ambientCount = 72;
  const glowGeometry = useMemo(() => {
    const total = sim.count + ambientCount;
    const pos = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const alphas = new Float32Array(total);
    for (let i = 0; i < ambientCount; i += 1) {
      const idx = sim.count + i;
      const s1 = Math.sin(i * 78.233 + 12.9898) * 43758.5453;
      const s2 = Math.sin(i * 45.164 + 93.989) * 43758.5453;
      const s3 = Math.sin(i * 19.37 + 61.123) * 43758.5453;
      pos[idx * 3] = (s1 - Math.floor(s1) - 0.45) * 520;
      pos[idx * 3 + 1] = (s2 - Math.floor(s2) - 0.48) * 320;
      pos[idx * 3 + 2] = (s3 - Math.floor(s3) - 0.5) * 180;
      sizes[idx] = 2.4 + (i % 5) * 1.1;
      alphas[idx] = 0.14 + (i % 4) * 0.08;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    return geometry;
  }, [sim.count]);
  useEffect(() => () => glowGeometry.dispose(), [glowGeometry]);

  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: {
            value: new THREE.Color(mixColor(seedColor, accentColor, 0.22)),
          },
        },
        vertexShader: SOFT_DOT_VERTEX,
        fragmentShader: SOFT_DOT_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    [accentColor, seedColor],
  );
  useEffect(() => () => glowMaterial.dispose(), [glowMaterial]);

  const acheneRef = useRef<THREE.InstancedMesh>(null);
  const stalkMeshRef = useRef<THREE.InstancedMesh>(null);
  const headGroupRef = useRef<THREE.Group>(null);

  // 相机固定在沉稳的 3D 微斜构图机位，不随鼠标移动晃动花球
  useEffect(() => {
    camera.position.set(42, -14, 305);
    camera.lookAt(-18, 2, -16);
  }, [camera]);

  const scratch = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      vec: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      crownColor: new THREE.Color(),
      stalkColor: new THREE.Color(),
      pixelScale: Math.min(2, gl.getPixelRatio()),
    }),
    [gl],
  );

  // 将当前模拟状态写入 GPU 缓冲（首帧 + 每帧驱动）
  const syncBuffers = useCallback(
    (
      effectiveWind = 0,
      wDir: [number, number, number] = [0.88, 0.28, -0.38],
    ) => {
      const posAttr = pappusGeometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      const colAttr = pappusGeometry.getAttribute(
        'aColor',
      ) as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      const glowPosAttr = glowGeometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      const glowSizeAttr = glowGeometry.getAttribute(
        'aSize',
      ) as THREE.BufferAttribute;
      const glowAlphaAttr = glowGeometry.getAttribute(
        'aAlpha',
      ) as THREE.BufferAttribute;
      const glowPos = glowPosAttr.array as Float32Array;
      const glowSizes = glowSizeAttr.array as Float32Array;
      const glowAlphas = glowAlphaAttr.array as Float32Array;

      // 同步花茎中上段悬臂柔弯（底端 progress=0 焊死不动）与花托自然微倾
      stemMaterial.uniforms.uFlexOffset.value.set(
        sim.stemOffset[0],
        sim.stemOffset[1],
        sim.stemOffset[2],
      );
      if (headGroupRef.current) {
        headGroupRef.current.position.set(
          HEAD_CENTER[0] + sim.stemOffset[0],
          HEAD_CENTER[1] + sim.stemOffset[1],
          HEAD_CENTER[2] + sim.stemOffset[2],
        );
        headGroupRef.current.rotation.z = sim.stemTiltZ;
      }

      const achene = acheneRef.current;
      const stalkMesh = stalkMeshRef.current;
      const {
        dummy,
        vec,
        dir,
        quat,
        euler,
        crownColor,
        stalkColor,
        pixelScale,
      } = scratch;
      crownColor.set(seedColor);
      stalkColor.set(mixColor(seedColor, accentColor, 0.32));

      const cosTilt = Math.cos(sim.stemTiltZ);
      const sinTilt = Math.sin(sim.stemTiltZ);
      const windFactor = Math.min(2.6, Math.max(0, effectiveWind));
      const animateTuft = !reducedMotion && windFactor > 0.02;

      for (let i = 0; i < sim.count; i += 1) {
        const i3 = i * 3;
        const px = sim.positions[i3];
        const py = sim.positions[i3 + 1];
        const pz = sim.positions[i3 + 2];
        const opacity = sim.opacities[i];

        if (sim.detached[i] === 0) {
          const nx = sim.anchorNormals[i3];
          const ny = sim.anchorNormals[i3 + 1];
          const nz = sim.anchorNormals[i3 + 2];
          dir.set(nx * cosTilt - ny * sinTilt, nx * sinTilt + ny * cosTilt, nz);
          if (animateTuft) {
            // 逐根羽绒的轻盈拂风涟漪：快起飞的小伞微微蓄势前倾颤动
            const preFlight =
              sim.releaseTimers[i] < 1.6
                ? 1 - Math.max(0, sim.releaseTimers[i]) / 1.6
                : 0;
            const flutterPhase =
              sim.elapsed * (2.6 + (i % 7) * 0.35) + sim.phases[i];
            const ripple =
              Math.sin(flutterPhase) * 0.65 +
              Math.sin(flutterPhase * 1.9 + 0.8) * 0.35;
            const lean =
              (0.032 + 0.042 * windFactor + preFlight * 0.14) *
              (0.75 + 0.45 * ripple);
            const crossFlutter =
              Math.cos(flutterPhase * 1.3) *
              (0.016 + preFlight * 0.05) *
              Math.min(1.6, windFactor);
            dir.x += wDir[0] * lean - wDir[1] * crossFlutter;
            dir.y += wDir[1] * lean + wDir[0] * crossFlutter;
            dir.z +=
              wDir[2] * lean + Math.sin(flutterPhase * 1.1) * crossFlutter;
            dir.normalize();
          }
          quat.setFromUnitVectors(UP_AXIS, dir);
        } else {
          euler.set(
            sim.rotations[i3] * 0.45 - 0.38,
            sim.rotations[i3 + 1] * 0.5,
            sim.rotations[i3 + 2] * 0.35 - 0.48,
          );
          quat.setFromEuler(euler);
        }

        const scale = opacity < 0.02 ? 0.001 : 0.65 + 0.35 * opacity;
        if (achene) {
          dummy.position.set(px, py, pz);
          dummy.quaternion.copy(quat);
          dummy.scale.set(0.75 * scale, 2.4 * scale, 0.75 * scale);
          dummy.updateMatrix();
          achene.setMatrixAt(i, dummy.matrix);
        }
        if (stalkMesh) {
          vec.set(0, 15.5 * scale, 0).applyQuaternion(quat);
          dummy.position.set(px + vec.x, py + vec.y, pz + vec.z);
          dummy.quaternion.copy(quat);
          dummy.scale.set(0.32 * scale, 31 * scale, 0.32 * scale);
          dummy.updateMatrix();
          stalkMesh.setMatrixAt(i, dummy.matrix);
        }

        // 变换该颗小伞的全部局部羽丝顶点
        const baseVertex = i * vertsPerSeed;
        for (let v = 0; v < vertsPerSeed; v += 1) {
          vec
            .set(
              localPappus[v * 3] * scale,
              localPappus[v * 3 + 1] * scale,
              localPappus[v * 3 + 2] * scale,
            )
            .applyQuaternion(quat);
          const out = (baseVertex + v) * 3;
          posArr[out] = px + vec.x;
          posArr[out + 1] = py + vec.y;
          posArr[out + 2] = pz + vec.z;

          const isStalk = v < 2;
          const c = isStalk ? stalkColor : crownColor;
          const lum = (isStalk ? 0.42 : 0.96) * opacity;
          colArr[out] = c.r * lum;
          colArr[out + 1] = c.g * lum;
          colArr[out + 2] = c.b * lum;
        }

        // 伞心柔和羽绒光晕位置（沿局部 +Y 33.5 单位，精准落在蓬松冠毛顶端）
        vec.set(0, 33.5 * scale, 0).applyQuaternion(quat);
        glowPos[i3] = px + vec.x;
        glowPos[i3 + 1] = py + vec.y;
        glowPos[i3 + 2] = pz + vec.z;
        glowSizes[i] = (sim.detached[i] === 1 ? 8.8 : 7.4) * pixelScale * scale;
        glowAlphas[i] = (sim.detached[i] === 1 ? 0.54 : 0.34) * opacity;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      glowPosAttr.needsUpdate = true;
      glowSizeAttr.needsUpdate = true;
      glowAlphaAttr.needsUpdate = true;
      if (achene) achene.instanceMatrix.needsUpdate = true;
      if (stalkMesh) stalkMesh.instanceMatrix.needsUpdate = true;
    },
    [
      accentColor,
      glowGeometry,
      localPappus,
      pappusGeometry,
      reducedMotion,
      scratch,
      seedColor,
      sim,
      stemMaterial,
      vertsPerSeed,
    ],
  );

  useEffect(() => {
    syncBuffers(0, normalizeWindDirection(windDirection));
  }, [syncBuffers, windDirection]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!reducedMotion) {
      pointerRef.current.boost *= Math.max(0, 1 - dt * 2.1);
      // 平滑风压阻尼：阵风与风力档位切换时花茎顺滑微伏并自然回弹，零阶跃突变
      const targetWind = windStrength + pointerRef.current.boost;
      smoothWindRef.current +=
        (targetWind - smoothWindRef.current) * Math.min(1, dt * 4.2);
      const eff = smoothWindRef.current;

      advanceDandelion(sim, dt, {
        windStrength: eff,
        windDirection,
        turbulence,
        loop,
        gust: 0,
      });

      // 远景散景光尘缓缓漂移
      const wDir = normalizeWindDirection(windDirection);
      const glowPosAttr = glowGeometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      const glowPos = glowPosAttr.array as Float32Array;
      for (let i = 0; i < ambientCount; i += 1) {
        const idx = (sim.count + i) * 3;
        glowPos[idx] += wDir[0] * (8 + (i % 4) * 3) * dt * Math.max(0.3, eff);
        glowPos[idx + 1] += (wDir[1] * 6 + Math.sin(sim.elapsed + i) * 4) * dt;
        if (glowPos[idx] > 280) glowPos[idx] = -260;
        if (glowPos[idx + 1] > 180) glowPos[idx + 1] = -160;
      }

      syncBuffers(eff, wDir);
    }
  });

  const acheneColor = useMemo(
    () => mixColor('#c4a47c', stemColor, 0.25),
    [stemColor],
  );
  const bractColor = useMemo(
    () => mixColor(stemColor, '#729460', 0.35),
    [stemColor],
  );

  return (
    <group>
      {/* 变径有机弧形花茎（底部稳固扎根，中上段随风压弹性微倾 + 逆光微光） */}
      <mesh geometry={stemGeometry} material={stemMaterial} />

      {/* 精致微点花托 + 14 片自然下垂反卷的细尖绿总苞片 */}
      <group ref={headGroupRef} position={HEAD_CENTER}>
        <mesh scale={[1, 0.78, 1]} material={receptacleMaterial}>
          <sphereGeometry args={[HEAD_RADIUS * 0.88, 28, 20]} />
        </mesh>
        <mesh geometry={bractsGeometry}>
          <meshStandardMaterial
            color={bractColor}
            roughness={0.62}
            metalness={0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 全部小伞瘦果微粒与真透视 3D 实体细柄 */}
      {sim.count > 0 ? (
        <>
          <instancedMesh
            ref={acheneRef}
            args={[undefined, undefined, sim.count]}
            frustumCulled={false}
          >
            <coneGeometry args={[1, 2.2, 6]} />
            <meshStandardMaterial
              color={acheneColor}
              roughness={0.55}
              transparent
              opacity={0.92}
            />
          </instancedMesh>
          <instancedMesh
            ref={stalkMeshRef}
            args={[undefined, undefined, sim.count]}
            frustumCulled={false}
          >
            <cylinderGeometry args={[0.55, 1, 1, 5]} />
            <meshStandardMaterial
              color={seedColor}
              roughness={0.45}
              transparent
              opacity={0.42}
              depthWrite={false}
            />
          </instancedMesh>
        </>
      ) : null}

      {/* 深度分层着色的 3D 冠毛羽丝伞（前半球通透明亮，后半球自然冷影） */}
      <lineSegments
        geometry={pappusGeometry}
        material={pappusMaterial}
        frustumCulled={false}
      />

      {/* 伞心柔光羽绒 + 背景电影散景微光尘 */}
      <points
        geometry={glowGeometry}
        material={glowMaterial}
        frustumCulled={false}
      />
    </group>
  );
}

/** DandelionField：三维蒲公英被风吹散的动态 3D 背景图组件。 */
export const DandelionField = React.forwardRef<
  HTMLDivElement,
  DandelionFieldProps
>(
  (
    {
      count = 180,
      windStrength = 1,
      windDirection,
      turbulence = 1,
      loop = true,
      seedColor = '#f8fafc',
      accentColor,
      stemColor = '#4b6b5c',
      interactive = true,
      gustSignal = 0,
      regatherSignal = 0,
      height = 420,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const { ref: sizeRef, size } = useElementSize<HTMLDivElement>();
    const themeVersion = useThemeVersion();
    const [clickGust, setClickGust] = useState(0);
    const pointerRef = useRef({ x: 0, y: 0, boost: 0 });
    const lastPointer = useRef<{ x: number; y: number } | null>(null);

    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        sizeRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref, sizeRef],
    );

    const resolvedAccent = useMemo(
      () => accentColor ?? readTokenColor('--aura-primary-400', '#c084fc'),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- themeVersion 变化即重读令牌
      [accentColor, themeVersion],
    );

    const handlePointerMove = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        if (lastPointer.current) {
          const speed = Math.hypot(
            nx - lastPointer.current.x,
            ny - lastPointer.current.y,
          );
          // 鼠标快速拂过即刻注入一阵柔风
          pointerRef.current.boost = Math.min(
            2.2,
            pointerRef.current.boost + speed * 3.5,
          );
        }
        lastPointer.current = { x: nx, y: ny };
        pointerRef.current.x = nx;
        pointerRef.current.y = ny;
      },
      [interactive],
    );

    const handlePointerLeave = useCallback(() => {
      lastPointer.current = null;
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    }, []);

    const handleClick = useCallback(() => {
      if (interactive) setClickGust((v) => v + 1);
    }, [interactive]);

    const fallback = <StaticDandelionFallback color={seedColor} />;

    return (
      <div
        ref={setRootRef}
        className={`aura-dandelion-field${className ? ` ${className}` : ''}`}
        style={{
          width: '100%',
          height,
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <div
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          aria-hidden
        >
          {size.width > 0 && size.height > 0 ? (
            <FieldErrorBoundary fallback={fallback}>
              <Canvas
                dpr={[1, 1.5]}
                camera={{
                  position: [42, -14, 305],
                  fov: 44,
                  near: 1,
                  far: 1600,
                }}
                gl={{ alpha: true, antialias: true }}
                fallback={fallback}
              >
                <ambientLight intensity={0.95} />
                <directionalLight position={[180, 220, 200]} intensity={0.85} />
                <DandelionScene
                  count={count}
                  windStrength={windStrength}
                  windDirection={windDirection}
                  turbulence={turbulence}
                  loop={loop}
                  seedColor={seedColor}
                  accentColor={resolvedAccent}
                  stemColor={stemColor}
                  gustSignal={gustSignal + clickGust}
                  regatherSignal={regatherSignal}
                  pointerRef={pointerRef}
                />
              </Canvas>
            </FieldErrorBoundary>
          ) : null}
        </div>
        {children ? (
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            {children}
          </div>
        ) : null}
      </div>
    );
  },
);

DandelionField.displayName = 'DandelionField';
