import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { formatNumber, mixColor, parseColor } from '@aura-react-comp/charts';
import { useScene } from '../core/Scene3D';
import { ColorBandLegend } from '../core/SceneLegend';
import {
  buildArcTubes,
  buildGlobeModel,
  sampleArcPosition,
  type Globe3DArc,
  type Globe3DModel,
  type Globe3DPoint,
} from '../core/globe';
import {
  createProceduralEarthTextures,
  isSafeTextureUrl,
} from '../core/globe-textures';

export {
  buildArcTubes,
  buildGlobeModel,
  buildSphereDots,
  latLngToVector3,
  sampleArcPosition,
} from '../core/globe';
export { isSafeTextureUrl } from '../core/globe-textures';
export type {
  Globe3DArc,
  Globe3DArcTubeData,
  Globe3DModel,
  Globe3DModelArc,
  Globe3DModelPoint,
  Globe3DPoint,
} from '../core/globe';

const EMPTY_POINTS: Globe3DPoint[] = [];
const EMPTY_ARCS: Globe3DArc[] = [];
const DEFAULT_POINT_SIZE = 4;
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

/** Globe3D 的场景属性；组件本身只渲染 Scene3D 内的 group。 */
export interface Globe3DProps {
  /** 业务点位。@default [] */
  points?: Globe3DPoint[];
  /** 业务弧线，端点引用 points 中的 id。@default [] */
  arcs?: Globe3DArc[];
  /** 地球半径（世界单位）。@default 120 */
  radius?: number;
  /** 点位基础大小（世界单位），实际大小按 value 缩放。@default 4 */
  pointSize?: number;
  /** 弧线最大抬升比例，相对于地球半径。@default 0.35 */
  arcHeight?: number;
  /** 真实地球地表贴图 URL（等距圆柱投影）；缺省使用内置程序化自然地球纹理。 */
  textureUrl?: string;
  /** 可选地形法线贴图 URL，赋予山脉与高原立体光照起伏。 */
  normalMapUrl?: string;
  /** 可选地形灰度凹凸贴图 URL。 */
  bumpMapUrl?: string;
  /** 凹凸贴图高度系数。@default 2.4 */
  bumpScale?: number;
  /** 可选海洋高光贴图 URL，仅海洋区域产生镜面光泽。 */
  specularMapUrl?: string;
  /** 可选透明大气云层贴图 URL；缺省在真实模式下使用内置云层。 */
  cloudsUrl?: string;
  /** 球体染色基准色；传入且未设 textureUrl 时可做纯色/叠色定制。 */
  globeColor?: string;
  /** 大气层辉光颜色；缺省为真实瑞利散射天空蓝。 */
  atmosphereColor?: string;
  /** 数值色带两端；缺省采用真实地球上高辨识度的亮青 → 暖金色带。 */
  colorRange?: [string, string];
  /** 是否显示漂移大气云层。@default true */
  showClouds?: boolean;
  /** 是否显示每 30° 辅助经纬网与空间轨道环。@default false */
  showGrid?: boolean;
  /** 是否显示球面斐波那契微点阵叠层。@default false */
  showDots?: boolean;
  /** 是否显示内外双层瑞利大气散射光晕。@default true */
  showAtmosphere?: boolean;
  /** 是否开启弧线流光粒子、云层漂移与节点脉冲动画；自动尊重 prefers-reduced-motion。@default true */
  animateArcs?: boolean;
  /** 是否通过 Scene3D overlay 显示数值色带图例。@default true */
  legend?: boolean;
  /** 是否显示点位名称、经纬度与数值提示框。@default true */
  tooltip?: boolean;
  /** 是否显示点位名称标签；有效点位不超过 30 个时才生效。@default false */
  showLabels?: boolean;
  /** 点击有效业务点位时回调原始点位对象。 */
  onPointClick?: (point: Globe3DPoint) => void;
}

const HALO_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

/** 外层 BackSide 羽化大气辉光（亮底 / 暗底均柔和可见） */
const OUTER_HALO_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = clamp(dot(-normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
    float alpha = pow(rim, 3.6) * uIntensity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/** 地表边缘 FrontSide 瑞利大气散射蓝雾（复刻太空视角地球边缘光环） */
const INNER_ATMOS_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float ndv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 3.0);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

const DOTS_VERTEX = `
  uniform float uSize;
  varying float vFacing;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vec3 v = normalize(-mvPos.xyz);
    vFacing = dot(n, v);
    gl_PointSize = uSize * (340.0 / max(-mvPos.z, 1.0));
    gl_Position = projectionMatrix * mvPos;
  }
`;

const DOTS_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFacing;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float edge = smoothstep(0.5, 0.16, dist);
    float front = smoothstep(-0.04, 0.32, vFacing);
    float alpha = edge * front * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function isDarkHex(color: string): boolean {
  const rgb = parseColor(color);
  if (!rgb) return false;
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance < 0.5;
}

function pointScale(pointSize: number, ratio: number): number {
  return pointSize * (0.58 + ratio * 0.42);
}

function pillarHeight(pointSize: number, ratio: number): number {
  return pointSize * (1.5 + ratio * 3.6);
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** 异步加载可选贴图并自动管理显存销毁；地址无效或加载失败时静默返回 null 以触发降级。 */
function useOptionalTexture(
  url: string | undefined,
  srgb: boolean,
  maxAnisotropy: number,
): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!isSafeTextureUrl(url)) {
      setTexture(null);
      return undefined;
    }
    let active = true;
    let loaded: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      url.trim(),
      (tex) => {
        if (!active) {
          tex.dispose();
          return;
        }
        if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, Math.max(1, maxAnisotropy));
        tex.needsUpdate = true;
        loaded = tex;
        setTexture(tex);
      },
      undefined,
      () => {
        if (active) setTexture(null);
      },
    );
    return () => {
      active = false;
      loaded?.dispose();
    };
  }, [maxAnisotropy, srgb, url]);

  return texture;
}

/** 构造倾斜的空间轨道环坐标（仅在 showGrid 开启时呈现）。 */
function buildOrbitRing(radius: number, segments = 128): Float32Array {
  const values: number[] = [];
  for (let i = 0; i < segments; i += 1) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    values.push(
      Math.cos(a0) * radius,
      0,
      Math.sin(a0) * radius,
      Math.cos(a1) * radius,
      0,
      Math.sin(a1) * radius,
    );
  }
  return new Float32Array(values);
}

/**
 * 真实地球上的高可读城市胶囊标签（带暗色毛玻璃底板 + 清晰亮字，无论背景是蓝海还是白云皆清晰锐利）。
 */
function GlobeLabelSprite({
  text,
  position,
  scale,
}: {
  text: string;
  position: [number, number, number];
  scale: number;
}) {
  const labelData = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const fontSize = 36;
    const padX = 22;
    const height = 62;
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
    const textWidth = Math.ceil(ctx.measureText(text).width);
    const width = textWidth + padX * 2;
    canvas.width = width;
    canvas.height = height;

    // 重置宽高后需重新设置字体与样式
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
    const r = height / 2;
    ctx.beginPath();
    ctx.moveTo(r, 2);
    ctx.lineTo(width - r, 2);
    ctx.arc(width - r, r, r - 2, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(r, height - 2);
    ctx.arc(r, r, r - 2, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(148, 197, 255, 0.45)';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2 + 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return { texture, aspect: width / height };
  }, [text]);

  useEffect(() => () => labelData?.texture.dispose(), [labelData]);

  if (!labelData) return null;
  return (
    <sprite
      position={position}
      scale={[labelData.aspect * scale, scale, 1]}
      renderOrder={5}
    >
      <spriteMaterial
        map={labelData.texture}
        transparent
        depthWrite={false}
        depthTest
      />
    </sprite>
  );
}

/** 缓慢漂移的独立 3D 大气云层球。 */
function GlobeClouds({
  radius,
  map,
  animated,
}: {
  radius: number;
  map: THREE.Texture;
  animated: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!animated || !meshRef.current) return;
    meshRef.current.rotation.y += Math.min(delta, 0.05) * 0.014;
  });
  return (
    <mesh ref={meshRef} scale={1.012} renderOrder={1}>
      <sphereGeometry args={[radius, 56, 40]} />
      <meshLambertMaterial
        map={map}
        transparent
        opacity={0.48}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * 复合业务节点层：法向数据光柱 + 贴地圆环 + 错峰脉冲波纹 + 可拾取自发光核心球。
 */
function InstancedGlobeNodes({
  model,
  pointSize,
  colorRange,
  hoverIndex,
  animated,
  onHover,
  onOut,
  onPointClick,
}: {
  model: Globe3DModel;
  pointSize: number;
  colorRange: [string, string];
  hoverIndex: number;
  animated: boolean;
  onHover: (index: number) => void;
  onOut: () => void;
  onPointClick?: (point: Globe3DPoint) => void;
}) {
  const beaconRef = useRef<THREE.InstancedMesh>(null);
  const pillarRef = useRef<THREE.InstancedMesh>(null);
  const ringRef = useRef<THREE.InstancedMesh>(null);
  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const previousHover = useRef(-1);
  const clockRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);

  const colors = useMemo(
    () =>
      model.points.map(
        (item) =>
          new THREE.Color(mixColor(colorRange[0], colorRange[1], item.ratio)),
      ),
    [model, colorRange],
  );

  const writeNode = useCallback(
    (index: number, highlight: boolean) => {
      const item = model.points[index];
      normal.copy(item.position).normalize();
      const height = pillarHeight(pointSize, item.ratio);
      const radius = pointScale(pointSize, item.ratio) * (highlight ? 1.38 : 1);

      const beacon = beaconRef.current;
      if (beacon) {
        dummy.position
          .copy(item.position)
          .addScaledVector(normal, height + radius * 0.4);
        dummy.quaternion.identity();
        dummy.scale.setScalar(radius);
        dummy.updateMatrix();
        beacon.setMatrixAt(index, dummy.matrix);
      }

      const pillar = pillarRef.current;
      if (pillar) {
        quaternion.setFromUnitVectors(UP_AXIS, normal);
        dummy.position.copy(item.position).addScaledVector(normal, height / 2);
        dummy.quaternion.copy(quaternion);
        const thickness = pointSize * (highlight ? 0.36 : 0.26);
        dummy.scale.set(thickness, height, thickness);
        dummy.updateMatrix();
        pillar.setMatrixAt(index, dummy.matrix);
      }
    },
    [dummy, model.points, normal, pointSize, quaternion],
  );

  React.useLayoutEffect(() => {
    const beacon = beaconRef.current;
    const pillar = pillarRef.current;
    const ring = ringRef.current;
    const pulse = pulseRef.current;
    if (!beacon || !pillar || !ring || !pulse) return;

    beacon.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pillar.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pulse.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    model.points.forEach((item, index) => {
      writeNode(index, false);
      beacon.setColorAt(index, colors[index]);
      pillar.setColorAt(index, colors[index]);

      normal.copy(item.position).normalize();
      quaternion.setFromUnitVectors(Z_AXIS, normal);
      const baseScale = pointSize * (1.25 + item.ratio * 0.72);
      dummy.position.copy(item.position).addScaledVector(normal, 1.5);
      dummy.quaternion.copy(quaternion);
      dummy.scale.setScalar(baseScale);
      dummy.updateMatrix();
      ring.setMatrixAt(index, dummy.matrix);
      ring.setColorAt(index, colors[index]);

      dummy.scale.setScalar(baseScale * 1.45);
      dummy.updateMatrix();
      pulse.setMatrixAt(index, dummy.matrix);
      pulse.setColorAt(index, colors[index]);
    });

    beacon.instanceMatrix.needsUpdate = true;
    pillar.instanceMatrix.needsUpdate = true;
    ring.instanceMatrix.needsUpdate = true;
    pulse.instanceMatrix.needsUpdate = true;
    if (beacon.instanceColor) beacon.instanceColor.needsUpdate = true;
    if (pillar.instanceColor) pillar.instanceColor.needsUpdate = true;
    if (ring.instanceColor) ring.instanceColor.needsUpdate = true;
    if (pulse.instanceColor) pulse.instanceColor.needsUpdate = true;
    previousHover.current = -1;
  }, [colors, dummy, model, normal, pointSize, quaternion, writeNode]);

  useEffect(() => {
    const beacon = beaconRef.current;
    const pillar = pillarRef.current;
    if (!beacon || !pillar || !beacon.instanceColor || !pillar.instanceColor) {
      return;
    }
    const previous = previousHover.current;
    if (previous === hoverIndex) return;
    if (previous >= 0 && previous < model.points.length) {
      writeNode(previous, false);
      beacon.setColorAt(previous, colors[previous]);
      pillar.setColorAt(previous, colors[previous]);
    }
    if (hoverIndex >= 0 && hoverIndex < model.points.length) {
      writeNode(hoverIndex, true);
      const bright = colors[hoverIndex]
        .clone()
        .lerp(new THREE.Color('#ffffff'), 0.5);
      beacon.setColorAt(hoverIndex, bright);
      pillar.setColorAt(hoverIndex, bright);
    }
    beacon.instanceMatrix.needsUpdate = true;
    pillar.instanceMatrix.needsUpdate = true;
    beacon.instanceColor.needsUpdate = true;
    pillar.instanceColor.needsUpdate = true;
    previousHover.current = hoverIndex;
  }, [colors, hoverIndex, model.points.length, writeNode]);

  useFrame((_, delta) => {
    if (!animated) return;
    const pulse = pulseRef.current;
    if (!pulse) return;
    clockRef.current += Math.min(delta, 0.05) * 0.55;
    const t = clockRef.current;
    for (let index = 0; index < model.points.length; index += 1) {
      const item = model.points[index];
      const phase = (t + index * 0.23) % 1;
      normal.copy(item.position).normalize();
      quaternion.setFromUnitVectors(Z_AXIS, normal);
      const base = pointSize * (1.25 + item.ratio * 0.72);
      const scale = base * (1.05 + phase * 1.5);
      dummy.position.copy(item.position).addScaledVector(normal, 1.7);
      dummy.quaternion.copy(quaternion);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      pulse.setMatrixAt(index, dummy.matrix);
    }
    pulse.instanceMatrix.needsUpdate = true;
  });

  const handleOver = (index: number | undefined) => {
    if (index !== undefined && index >= 0) onHover(index);
  };
  const handleClick = (index: number | undefined) => {
    if (index !== undefined && index >= 0 && index < model.points.length) {
      onPointClick?.(model.points[index].point);
    }
  };

  return (
    <group>
      {/* 贴地发光底座圆环 */}
      <instancedMesh
        ref={ringRef}
        args={[undefined, undefined, model.points.length]}
        frustumCulled={false}
        renderOrder={2}
      >
        <ringGeometry args={[0.55, 0.94, 24]} />
        <meshBasicMaterial
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </instancedMesh>

      {/* 错峰脉冲波纹外环 */}
      <instancedMesh
        ref={pulseRef}
        args={[undefined, undefined, model.points.length]}
        frustumCulled={false}
        renderOrder={2}
      >
        <ringGeometry args={[0.82, 1, 24]} />
        <meshBasicMaterial
          side={THREE.DoubleSide}
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </instancedMesh>

      {/* 自发光法向数据立柱（背光面依然清晰高亮） */}
      <instancedMesh
        ref={pillarRef}
        args={[undefined, undefined, model.points.length]}
        frustumCulled={false}
        renderOrder={3}
        onPointerOver={(event) => {
          event.stopPropagation();
          handleOver(event.instanceId);
        }}
        onPointerOut={onOut}
        onClick={(event) => {
          event.stopPropagation();
          handleClick(event.instanceId);
        }}
      >
        <cylinderGeometry args={[0.45, 0.95, 1, 10]} />
        <meshBasicMaterial transparent opacity={0.9} />
      </instancedMesh>

      {/* 顶部发光核心球（主拾取目标） */}
      <instancedMesh
        ref={beaconRef}
        args={[undefined, undefined, model.points.length]}
        frustumCulled={false}
        renderOrder={4}
        onPointerOver={(event) => {
          event.stopPropagation();
          handleOver(event.instanceId);
        }}
        onPointerOut={onOut}
        onClick={(event) => {
          event.stopPropagation();
          handleClick(event.instanceId);
        }}
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}

/** 沿每条球面弧线滑行的明亮流光粒子（主光点 + 2 颗渐小拖尾）。 */
function ArcFlowPulses({
  model,
  pointSize,
  colorRange,
  animated,
}: {
  model: Globe3DModel;
  pointSize: number;
  colorRange: [string, string];
  animated: boolean;
}) {
  const trailCount = 3;
  const total = model.arcs.length * trailCount;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progressRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  const writeAt = useCallback(
    (elapsed: number) => {
      const mesh = meshRef.current;
      if (!mesh) return;
      for (let arcIndex = 0; arcIndex < model.arcs.length; arcIndex += 1) {
        const arc = model.arcs[arcIndex];
        const head = animated ? (elapsed * 0.28 + arcIndex * 0.19) % 1 : 0.5;
        for (let step = 0; step < trailCount; step += 1) {
          const instanceIndex = arcIndex * trailCount + step;
          const t = (head - step * 0.03 + 1) % 1;
          sampleArcPosition(arc.path, t, pos);
          const edgeFade = Math.sin(Math.PI * t);
          const scale =
            pointSize *
            (step === 0 ? 0.5 : step === 1 ? 0.34 : 0.22) *
            (0.45 + 0.55 * edgeFade);
          dummy.position.copy(pos);
          dummy.scale.setScalar(scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(instanceIndex, dummy.matrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    [animated, dummy, model.arcs, pointSize, pos],
  );

  React.useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const white = new THREE.Color('#ffffff');
    for (let arcIndex = 0; arcIndex < model.arcs.length; arcIndex += 1) {
      const arc = model.arcs[arcIndex];
      const base = new THREE.Color(
        mixColor(colorRange[0], colorRange[1], arc.ratio),
      );
      for (let step = 0; step < trailCount; step += 1) {
        const color = base.clone().lerp(white, step === 0 ? 0.8 : 0.45);
        mesh.setColorAt(arcIndex * trailCount + step, color);
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    writeAt(0);
  }, [colorRange, model.arcs, writeAt]);

  useFrame((_, delta) => {
    if (!animated) return;
    progressRef.current += Math.min(delta, 0.05);
    writeAt(progressRef.current);
  });

  if (total === 0) return null;
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, total]}
      frustumCulled={false}
      renderOrder={4}
    >
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial transparent opacity={0.96} depthWrite={false} />
    </instancedMesh>
  );
}

/** 真实卫星地球业务可视化：支持自定义卫星贴图与内置程序化自然地球兜底。 */
export function Globe3D({
  points = EMPTY_POINTS,
  arcs = EMPTY_ARCS,
  radius = 120,
  pointSize = DEFAULT_POINT_SIZE,
  arcHeight = 0.35,
  textureUrl,
  normalMapUrl,
  bumpMapUrl,
  bumpScale = 2.4,
  specularMapUrl,
  cloudsUrl,
  globeColor,
  atmosphereColor,
  colorRange,
  showClouds = true,
  showGrid = false,
  showDots = false,
  showAtmosphere = true,
  animateArcs = true,
  legend = true,
  tooltip = true,
  showLabels = false,
  onPointClick,
}: Globe3DProps) {
  const scene = useScene();
  const { gl } = useThree();
  const reducedMotion = usePrefersReducedMotion();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

  const model = useMemo(
    () => buildGlobeModel(points, arcs, radius, arcHeight),
    [points, arcs, radius, arcHeight],
  );
  const hoverIndex =
    hoverId === null
      ? -1
      : model.points.findIndex((item) => item.point.id === hoverId);
  const safePointSize =
    Number.isFinite(pointSize) && pointSize > 0
      ? pointSize
      : DEFAULT_POINT_SIZE;

  // 零依赖内置自然地球贴图：未传外部 URL 或加载中时立即呈现真实蓝海绿陆与云层
  const procedural = useMemo(() => createProceduralEarthTextures(), []);
  useEffect(() => () => procedural?.dispose(), [procedural]);

  const externalMap = useOptionalTexture(textureUrl, true, maxAnisotropy);
  const externalNormal = useOptionalTexture(normalMapUrl, false, maxAnisotropy);
  const externalBump = useOptionalTexture(bumpMapUrl, false, maxAnisotropy);
  const externalSpecular = useOptionalTexture(
    specularMapUrl,
    false,
    maxAnisotropy,
  );
  const externalClouds = useOptionalTexture(cloudsUrl, true, maxAnisotropy);

  const activeMap = externalMap ?? procedural?.map ?? null;
  const activeSpecular =
    externalSpecular ??
    (externalMap ? null : (procedural?.specularMap ?? null));
  const activeClouds = externalClouds ?? procedural?.cloudsMap ?? null;

  const palette = useMemo(() => {
    const readToken = (token: string, fallback: string) =>
      scene?.readToken(token, fallback) ?? fallback;
    const bg = readToken('--aura-bg', '#ffffff');
    const dark = isDarkHex(bg);
    const range: [string, string] = colorRange ?? ['#38bdf8', '#fbbf24'];
    return {
      dark,
      range,
      atmosphere: atmosphereColor ?? (dark ? '#60a5fa' : '#38bdf8'),
      dots: dark ? '#bae6fd' : '#e0f2fe',
      grid: dark ? '#93c5fd' : '#bae6fd',
      orbit: dark ? '#60a5fa' : '#38bdf8',
    };
  }, [atmosphereColor, colorRange, scene]);

  const outerHaloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(palette.atmosphere) },
          uIntensity: { value: palette.dark ? 0.78 : 0.44 },
        },
        vertexShader: HALO_VERTEX,
        fragmentShader: OUTER_HALO_FRAGMENT,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [palette.atmosphere, palette.dark],
  );
  useEffect(() => () => outerHaloMaterial.dispose(), [outerHaloMaterial]);

  const innerAtmosMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(palette.atmosphere) },
          uIntensity: { value: palette.dark ? 0.52 : 0.38 },
        },
        vertexShader: HALO_VERTEX,
        fragmentShader: INNER_ATMOS_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    [palette.atmosphere, palette.dark],
  );
  useEffect(() => () => innerAtmosMaterial.dispose(), [innerAtmosMaterial]);

  const dotsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(palette.dots) },
          uOpacity: { value: 0.48 },
          uSize: { value: Math.min(2, gl.getPixelRatio()) * 2.2 },
        },
        vertexShader: DOTS_VERTEX,
        fragmentShader: DOTS_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    [gl, palette.dots],
  );
  useEffect(() => () => dotsMaterial.dispose(), [dotsMaterial]);

  const dotsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(model.dots), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [model.dots]);
  useEffect(() => () => dotsGeometry.dispose(), [dotsGeometry]);

  const gridGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(model.grid), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [model.grid]);
  useEffect(() => () => gridGeometry.dispose(), [gridGeometry]);

  const orbitGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(buildOrbitRing(model.radius * 1.16), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [model.radius]);
  useEffect(() => () => orbitGeometry.dispose(), [orbitGeometry]);

  const arcGeometry = useMemo(() => {
    if (model.arcs.length === 0) return null;
    const tubeRadius = Math.max(0.48, model.radius * 0.0068);
    const tube = buildArcTubes(model.arcs, tubeRadius, 5);
    if (tube.positions.length === 0) return null;

    const colors = new Float32Array(tube.positions.length);
    const highlight = new THREE.Color('#ffffff');
    const scratch = new THREE.Color();
    for (let i = 0; i < tube.progress.length; i += 1) {
      const u = tube.progress[i];
      const ratio = tube.ratios[i];
      scratch.set(mixColor(palette.range[0], palette.range[1], ratio));
      const apex = Math.sin(Math.PI * u);
      scratch.lerp(highlight, apex * 0.28);
      colors[i * 3] = scratch.r;
      colors[i * 3 + 1] = scratch.g;
      colors[i * 3 + 2] = scratch.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(tube.positions), 3),
    );
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(tube.normals), 3),
    );
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(tube.indices);
    geometry.computeBoundingSphere();
    return geometry;
  }, [model.arcs, model.radius, palette.range]);
  useEffect(() => () => arcGeometry?.dispose(), [arcGeometry]);

  const normalScale = useMemo(() => new THREE.Vector2(0.85, 0.85), []);

  useEffect(() => {
    if (!scene || !legend || model.points.length === 0) return undefined;
    scene.setOverlay(
      <ColorBandLegend
        min={model.min}
        max={model.max}
        colorRange={palette.range}
        label="数值色带"
      />,
    );
    return () => scene.setOverlay(null);
  }, [legend, model, palette.range, scene]);

  useEffect(() => {
    setHoverId(null);
    if (!tooltip) scene?.showTooltip(null, new THREE.Vector3());
    return () => scene?.showTooltip(null, new THREE.Vector3());
  }, [model, scene, tooltip]);

  const handleHover = useCallback(
    (index: number) => {
      const item = model.points[index];
      if (!item) return;
      setHoverId(item.point.id);
      if (!tooltip || !scene) return;
      const color = mixColor(palette.range[0], palette.range[1], item.ratio);
      const lift = pillarHeight(safePointSize, item.ratio) + safePointSize * 2;
      const tipPosition = item.position
        .clone()
        .addScaledVector(item.position.clone().normalize(), lift);
      scene.showTooltip(
        {
          label: item.point.name,
          row: null,
          series: [
            {
              key: 'latitude',
              name: '纬度',
              color,
              value: item.latitude,
              formatted: `${item.latitude.toFixed(2)}°`,
            },
            {
              key: 'longitude',
              name: '经度',
              color,
              value: item.longitude,
              formatted: `${item.longitude.toFixed(2)}°`,
            },
            {
              key: 'value',
              name: '数值',
              color,
              value: item.value,
              formatted: formatNumber(item.value),
            },
          ],
        },
        tipPosition,
      );
    },
    [model.points, palette.range, safePointSize, scene, tooltip],
  );

  const handleOut = useCallback(() => {
    setHoverId(null);
    scene?.showTooltip(null, new THREE.Vector3());
  }, [scene]);

  const shouldAnimate = animateArcs && !reducedMotion;
  const labelScale = Math.max(9.5, model.radius * 0.088);

  return (
    <group>
      {/* 柔和天光补光，保证背光半球的真实大陆与海洋细节依然通透可辨 */}
      <hemisphereLight args={['#e0f2fe', '#1e3a5f', 0.45]} />

      {/* 真实地球本体：卫星地表 + 地形法线/凹凸 + 海洋镜面高光 */}
      <mesh
        onPointerOver={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <sphereGeometry args={[model.radius, 72, 48]} />
        <meshPhongMaterial
          key={`${activeMap?.uuid ?? 'none'}-${externalNormal?.uuid ?? 'n'}-${externalBump?.uuid ?? 'b'}-${activeSpecular?.uuid ?? 's'}`}
          color={globeColor ?? '#ffffff'}
          map={activeMap}
          normalMap={externalNormal}
          normalScale={normalScale}
          bumpMap={externalBump}
          bumpScale={bumpScale}
          specularMap={activeSpecular}
          specular="#5a8fc2"
          shininess={24}
        />
      </mesh>

      {/* 独立 3D 漂移大气云层 */}
      {showClouds && activeClouds ? (
        <GlobeClouds
          radius={model.radius}
          map={activeClouds}
          animated={shouldAnimate}
        />
      ) : null}

      {/* 内层地表边缘瑞利蓝光散射 + 外层羽化大气辉光 */}
      {showAtmosphere ? (
        <>
          <mesh scale={1.018} material={innerAtmosMaterial} renderOrder={2}>
            <sphereGeometry args={[model.radius, 56, 40]} />
          </mesh>
          <mesh scale={1.14} material={outerHaloMaterial}>
            <sphereGeometry args={[model.radius, 48, 36]} />
          </mesh>
        </>
      ) : null}

      {/* 可选球面微点阵叠层 */}
      {showDots ? (
        <points scale={1.016} geometry={dotsGeometry} material={dotsMaterial} />
      ) : null}

      {/* 可选经纬网 + 空间轨道细环 */}
      {showGrid ? (
        <>
          <lineSegments scale={1.015} geometry={gridGeometry}>
            <lineBasicMaterial
              color={palette.grid}
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </lineSegments>
          <lineSegments rotation={[0.24, 0, -0.18]} geometry={orbitGeometry}>
            <lineBasicMaterial
              color={palette.orbit}
              transparent
              opacity={0.28}
              depthWrite={false}
            />
          </lineSegments>
        </>
      ) : null}

      {/* 立体渐变管道弧线 */}
      {arcGeometry ? (
        <mesh geometry={arcGeometry} renderOrder={3}>
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={0.86}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* 沿弧线流动的飞线流星 */}
      {model.arcs.length > 0 ? (
        <ArcFlowPulses
          model={model}
          pointSize={safePointSize}
          colorRange={palette.range}
          animated={shouldAnimate}
        />
      ) : null}

      {/* 复合业务节点（发光底座环 + 脉冲波纹 + 数据立柱 + 发光核心） */}
      {model.points.length > 0 ? (
        <InstancedGlobeNodes
          model={model}
          pointSize={safePointSize}
          colorRange={palette.range}
          hoverIndex={hoverIndex}
          animated={shouldAnimate}
          onHover={handleHover}
          onOut={handleOut}
          onPointClick={onPointClick}
        />
      ) : null}

      {/* 高可读胶囊城市名称标签 */}
      {showLabels && model.points.length <= 30
        ? model.points.map((item) => {
            const normal = item.position.clone().normalize();
            const offset =
              pillarHeight(safePointSize, item.ratio) + safePointSize * 2.8;
            const position = item.position
              .clone()
              .addScaledVector(normal, offset);
            return (
              <GlobeLabelSprite
                key={item.point.id}
                text={item.point.name}
                position={[position.x, position.y, position.z]}
                scale={labelScale}
              />
            );
          })
        : null}
    </group>
  );
}
