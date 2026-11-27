import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { formatNumber } from '@aura-react-comp/charts';
import { TextSprite } from './Bar3D';
import { useScene } from '../core/Scene3D';
import { CategoryLegend } from '../core/SceneLegend';
import {
  buildPie3DModel,
  type Pie3DDatum,
  type Pie3DSlice,
} from '../core/pie3d';

export { buildPie3DModel } from '../core/pie3d';
export type {
  Pie3DDatum,
  Pie3DModel,
  Pie3DModelOptions,
  Pie3DSlice,
} from '../core/pie3d';

const EMPTY_DATA: Pie3DDatum[] = [];
const DEFAULT_SERIES = [
  '#7c3aed',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
];

/** Pie3D 组件属性（Scene3D 场景子组件）。 */
export interface Pie3DProps {
  /** 占比数据。@default [] */
  data?: Pie3DDatum[];
  /** 外半径（世界单位）。@default 115 */
  radius?: number;
  /** 内半径（世界单位）；0 为实心 3D 饼图，>0 为 3D 环形图。@default 48 */
  innerRadius?: number;
  /** 切片基础厚度（世界单位）。@default 28 */
  depth?: number;
  /** 是否按占比呈现立体高度阶梯（占比越高越厚）。@default true */
  heightScale?: boolean;
  /** 切片间缝隙角度（弧度）。@default 0.03 */
  padAngle?: number;
  /** 悬停或选中时沿径向弹出的距离（世界单位）。@default 14 */
  explodeDistance?: number;
  /** 分类色板；缺省读取 Scene3D 主题系列色。 */
  palette?: string[];
  /** 是否显示分类图例。@default true */
  legend?: boolean;
  /** 是否显示悬停提示框。@default true */
  tooltip?: boolean;
  /** 是否在切片上方展示名称与占比标签。@default true */
  showLabels?: boolean;
  /** 是否开启动效（错峰生长 + 悬停径向弹出）。@default true */
  animation?: boolean;
  /** 点击切片回调原始数据项。 */
  onSliceClick?: (datum: Pie3DDatum) => void;
}

/** 生成带平滑圆润倒角的 3D 扇形/环形切块几何体。 */
function createSliceGeometry(
  slice: Pie3DSlice,
  radius: number,
  innerRadius: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const { startAngle, endAngle } = slice;
  if (innerRadius > 0) {
    shape.absarc(0, 0, radius, startAngle, endAngle, false);
    shape.lineTo(
      Math.cos(endAngle) * innerRadius,
      Math.sin(endAngle) * innerRadius,
    );
    shape.absarc(0, 0, innerRadius, endAngle, startAngle, true);
    shape.closePath();
  } else {
    shape.moveTo(0, 0);
    shape.lineTo(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius);
    shape.absarc(0, 0, radius, startAngle, endAngle, false);
    shape.closePath();
  }

  const bevel = Math.min(2, slice.depth * 0.12);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: slice.depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: Math.min(1.6, bevel),
    bevelSegments: 4,
    curveSegments: 36,
  });
  // 将 XY 平面扇形放平到 XZ 水平面，沿 +Y 向上生长
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function SliceMesh({
  slice,
  totalCount,
  radius,
  innerRadius,
  color,
  explodeDistance,
  isHover,
  hasHover,
  animated,
  onOver,
  onOut,
  onClick,
}: {
  slice: Pie3DSlice;
  totalCount: number;
  radius: number;
  innerRadius: number;
  color: string;
  explodeDistance: number;
  isHover: boolean;
  hasHover: boolean;
  animated: boolean;
  onOver: () => void;
  onOut: () => void;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const growRef = useRef(animated ? 0 : 1);
  const offsetRef = useRef(0);

  const geometry = useMemo(
    () => createSliceGeometry(slice, radius, innerRadius),
    [innerRadius, radius, slice],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const delay = totalCount > 1 ? (slice.index / (totalCount - 1)) * 0.35 : 0;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);

    if (growRef.current < 1) {
      growRef.current = Math.min(1, growRef.current + dt / 0.68);
      const local = Math.min(
        1,
        Math.max(0, (growRef.current - delay) / (1 - delay)),
      );
      const eased = 1 - (1 - local) ** 5;
      group.scale.set(1, Math.max(0.01, eased), 1);
    }

    const target = isHover ? explodeDistance : 0;
    if (animated) {
      offsetRef.current += (target - offsetRef.current) * Math.min(1, dt * 11);
    } else {
      offsetRef.current = target;
    }
    const lift =
      explodeDistance > 0 ? (offsetRef.current / explodeDistance) * 6 : 0;
    group.position.set(
      slice.explodeDir[0] * offsetRef.current,
      lift,
      slice.explodeDir[1] * offsetRef.current,
    );
  });

  const opacity = hasHover && !isHover ? 0.52 : 0.96;

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        onPointerOver={(event) => {
          event.stopPropagation();
          onOver();
        }}
        onPointerOut={onOut}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.28}
          metalness={0.14}
          emissive={color}
          emissiveIntensity={isHover ? 0.28 : 0.04}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

/** Pie3D：三维立体饼图 / 环形图（倒角切块、高度阶梯与悬停弹出动效）。 */
export function Pie3D({
  data = EMPTY_DATA,
  radius = 115,
  innerRadius = 48,
  depth = 28,
  heightScale = true,
  padAngle = 0.03,
  explodeDistance = 14,
  palette: paletteProp,
  legend = true,
  tooltip = true,
  showLabels = true,
  animation = true,
  onSliceClick,
}: Pie3DProps) {
  const scene = useScene();
  const [hoverIndex, setHoverIndex] = useState(-1);

  const model = useMemo(
    () =>
      buildPie3DModel(data, {
        radius,
        innerRadius,
        depth,
        heightScale,
        padAngle,
      }),
    [data, depth, heightScale, innerRadius, padAngle, radius],
  );

  const palette = useMemo(() => {
    const custom = paletteProp?.filter(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );
    if (custom?.length) return custom;
    const themed = scene?.seriesColors.filter(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );
    return themed?.length ? themed : DEFAULT_SERIES;
  }, [paletteProp, scene?.seriesColors]);

  const tokens = useMemo(
    () => ({
      ring: scene?.readToken('--aura-border-hover', '#cbd5e1') ?? '#cbd5e1',
      label: scene?.readToken('--aura-text', '#334155') ?? '#334155',
    }),
    [scene],
  );

  const sliceColors = useMemo(
    () =>
      model.slices.map(
        (slice) => slice.datum.color || palette[slice.index % palette.length],
      ),
    [model.slices, palette],
  );

  useEffect(() => {
    if (!scene || !legend || model.slices.length === 0) return undefined;
    scene.setOverlay(
      <CategoryLegend
        items={model.slices.map((slice, index) => ({
          label: `${slice.name} (${(slice.ratio * 100).toFixed(1)}%)`,
          color: sliceColors[index],
        }))}
      />,
    );
    return () => scene.setOverlay(null);
  }, [legend, model.slices, scene, sliceColors]);

  useEffect(() => {
    setHoverIndex(-1);
    if (!tooltip) scene?.showTooltip(null, new THREE.Vector3());
    return () => scene?.showTooltip(null, new THREE.Vector3());
  }, [model, scene, tooltip]);

  const handleOver = useCallback(
    (index: number) => {
      const slice = model.slices[index];
      if (!slice) return;
      setHoverIndex(index);
      if (!tooltip || !scene) return;
      const color = sliceColors[index];
      scene.showTooltip(
        {
          label: slice.name,
          row: null,
          series: [
            {
              key: 'value',
              name: '数值',
              color,
              value: slice.value,
              formatted: formatNumber(slice.value),
            },
            {
              key: 'ratio',
              name: '占比',
              color,
              value: slice.ratio * 100,
              formatted: `${(slice.ratio * 100).toFixed(1)}%`,
            },
          ],
        },
        new THREE.Vector3(
          slice.labelPosition[0],
          slice.labelPosition[1] + 6,
          slice.labelPosition[2],
        ),
      );
    },
    [model.slices, scene, sliceColors, tooltip],
  );

  const handleOut = useCallback(() => {
    setHoverIndex(-1);
    scene?.showTooltip(null, new THREE.Vector3());
  }, [scene]);

  const safeExplode =
    Number.isFinite(explodeDistance) && explodeDistance >= 0
      ? explodeDistance
      : 14;

  return (
    <group position={[0, -14, 0]}>
      {/* 柔和悬浮光环底座 */}
      {model.slices.length > 0 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
          <ringGeometry
            args={[
              Math.max(4, model.innerRadius * 0.72),
              model.radius * 1.12,
              64,
            ]}
          />
          <meshBasicMaterial
            color={tokens.ring}
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* 3D 倒角扇形切块 */}
      {model.slices.map((slice, index) => (
        <SliceMesh
          key={`${slice.name}-${index}`}
          slice={slice}
          totalCount={model.slices.length}
          radius={model.radius}
          innerRadius={model.innerRadius}
          color={sliceColors[index]}
          explodeDistance={safeExplode}
          isHover={hoverIndex === index}
          hasHover={hoverIndex >= 0}
          animated={animation}
          onOver={() => handleOver(index)}
          onOut={handleOut}
          onClick={() => onSliceClick?.(slice.datum)}
        />
      ))}

      {/* 切片占比标签 */}
      {showLabels
        ? model.slices
            .filter((slice) => slice.ratio >= 0.04)
            .map((slice) => (
              <TextSprite
                key={`label-${slice.name}-${slice.index}`}
                text={`${slice.name} ${(slice.ratio * 100).toFixed(0)}%`}
                color={tokens.label}
                position={slice.labelPosition}
                scale={0.19}
              />
            ))
        : null}
    </group>
  );
}
