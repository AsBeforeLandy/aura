import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { formatNumber, mixColor } from '@aura-react-comp/charts';
import { TextSprite } from './Bar3D';
import { useScene } from '../core/Scene3D';
import { CategoryLegend } from '../core/SceneLegend';
import {
  buildRadar3DModel,
  type Radar3DIndicator,
  type Radar3DModel,
  type Radar3DModelSeries,
  type Radar3DPoint,
  type Radar3DSeries,
} from '../core/radar3d';

export { buildRadar3DModel } from '../core/radar3d';
export type {
  Radar3DIndicator,
  Radar3DModel,
  Radar3DModelIndicator,
  Radar3DModelOptions,
  Radar3DModelSeries,
  Radar3DPoint,
  Radar3DSeries,
} from '../core/radar3d';

const EMPTY_INDICATORS: Radar3DIndicator[] = [];
const EMPTY_SERIES: Radar3DSeries[] = [];
const DEFAULT_SERIES = [
  '#7c3aed',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
];

/** Radar3D 组件属性（Scene3D 场景子组件）。 */
export interface Radar3DProps {
  /** 维度定义（至少 3 个）。@default [] */
  indicators?: Radar3DIndicator[];
  /** 多维对比系列（沿 Y 轴分层悬浮透视）。@default [] */
  series?: Radar3DSeries[];
  /** 雷达最大半径（世界单位）。@default 115 */
  radius?: number;
  /** 多系列垂直分层间距（世界单位）。@default 28 */
  layerHeight?: number;
  /** 底层同心蛛网圈数。@default 4 */
  rings?: number;
  /** 系列色板；缺省读取 Scene3D 主题系列色。 */
  palette?: string[];
  /** 是否显示系列图例。@default true */
  legend?: boolean;
  /** 是否显示悬停提示框。@default true */
  tooltip?: boolean;
  /** 是否在外圈显示维度名称标签。@default true */
  showLabels?: boolean;
  /** 点击维度顶点回调。 */
  onPointClick?: (info: {
    series: string;
    indicator: string;
    value: number;
    max: number;
  }) => void;
}

/** 单个雷达系列悬浮层：半透明多边形填充 + 高亮外框 + 悬停柔和微抬升。 */
function RadarSeriesLayer({
  series,
  color,
  highlighted,
  dimmed,
  onOver,
  onOut,
}: {
  series: Radar3DModelSeries;
  color: string;
  highlighted: boolean;
  dimmed: boolean;
  onOver: () => void;
  onOut: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const liftRef = useRef(0);

  const fillGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(series.fillPositions), 3),
    );
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }, [series.fillPositions]);
  useEffect(() => () => fillGeometry.dispose(), [fillGeometry]);

  const outlineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(series.outlinePositions), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [series.outlinePositions]);
  useEffect(() => () => outlineGeometry.dispose(), [outlineGeometry]);

  const outlineColor = useMemo(() => mixColor(color, '#ffffff', 0.32), [color]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = highlighted ? 5 : 0;
    liftRef.current += (target - liftRef.current) * Math.min(1, delta * 10);
    group.position.y = liftRef.current;
  });

  return (
    <group ref={groupRef}>
      <mesh
        geometry={fillGeometry}
        onPointerOver={(event) => {
          event.stopPropagation();
          onOver();
        }}
        onPointerOut={onOut}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={highlighted ? 0.3 : 0.1}
          roughness={0.35}
          metalness={0.08}
          transparent
          opacity={dimmed ? 0.14 : highlighted ? 0.56 : 0.36}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={outlineGeometry}>
        <lineBasicMaterial
          color={outlineColor}
          transparent
          opacity={dimmed ? 0.28 : 0.96}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/** 全部系列维度顶点的发光球珠（单 InstancedMesh 渲染 + 精确拾取）。 */
function RadarVertices({
  model,
  seriesColors,
  hoverPointIndex,
  hoverSeriesIndex,
  onOver,
  onOut,
  onClick,
}: {
  model: Radar3DModel;
  seriesColors: string[];
  hoverPointIndex: number;
  hoverSeriesIndex: number;
  onOver: (index: number) => void;
  onOut: () => void;
  onClick: (point: Radar3DPoint) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const white = new THREE.Color('#ffffff');
    const color = new THREE.Color();

    model.allPoints.forEach((pt, idx) => {
      const active = idx === hoverPointIndex;
      const inSeries =
        hoverSeriesIndex < 0 || pt.seriesIndex === hoverSeriesIndex;
      const lift = pt.seriesIndex === hoverSeriesIndex ? 5 : 0;
      dummy.position.set(pt.position[0], pt.position[1] + lift, pt.position[2]);
      dummy.scale.setScalar(active ? 5.6 : inSeries ? 3.6 : 2.3);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);

      color.set(seriesColors[pt.seriesIndex]);
      if (active) color.lerp(white, 0.55);
      else if (inSeries) color.lerp(white, 0.2);
      mesh.setColorAt(idx, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dummy, hoverPointIndex, hoverSeriesIndex, model.allPoints, seriesColors]);

  if (model.allPoints.length === 0) return null;
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, model.allPoints.length]}
      frustumCulled={false}
      onPointerOver={(event) => {
        event.stopPropagation();
        const idx = event.instanceId ?? -1;
        if (idx >= 0) onOver(idx);
      }}
      onPointerOut={onOut}
      onClick={(event) => {
        event.stopPropagation();
        const idx = event.instanceId ?? -1;
        if (idx >= 0 && idx < model.allPoints.length) {
          onClick(model.allPoints[idx]);
        }
      }}
    >
      <sphereGeometry args={[1, 14, 10]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

/** Radar3D：三维多维立体分层雷达图。 */
export function Radar3D({
  indicators = EMPTY_INDICATORS,
  series = EMPTY_SERIES,
  radius = 115,
  layerHeight = 28,
  rings = 4,
  palette: paletteProp,
  legend = true,
  tooltip = true,
  showLabels = true,
  onPointClick,
}: Radar3DProps) {
  const scene = useScene();
  const [hoverPointIndex, setHoverPointIndex] = useState(-1);
  const [hoverSeriesIndex, setHoverSeriesIndex] = useState(-1);

  const model = useMemo(
    () => buildRadar3DModel(indicators, series, { radius, layerHeight, rings }),
    [indicators, layerHeight, radius, rings, series],
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

  const seriesColors = useMemo(
    () =>
      model.series.map(
        (item) => item.color || palette[item.index % palette.length],
      ),
    [model.series, palette],
  );

  const tokens = useMemo(
    () => ({
      web: scene?.readToken('--aura-border-hover', '#94a3b8') ?? '#94a3b8',
      label: scene?.readToken('--aura-text', '#334155') ?? '#334155',
    }),
    [scene],
  );

  const webGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(model.webLines), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [model.webLines]);
  useEffect(() => () => webGeometry.dispose(), [webGeometry]);

  const pillarGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(model.pillarLines), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [model.pillarLines]);
  useEffect(() => () => pillarGeometry.dispose(), [pillarGeometry]);

  useEffect(() => {
    if (!scene || !legend || model.series.length === 0) return undefined;
    scene.setOverlay(
      <CategoryLegend
        items={model.series.map((item, idx) => ({
          label: item.name,
          color: seriesColors[idx],
        }))}
      />,
    );
    return () => scene.setOverlay(null);
  }, [legend, model.series, scene, seriesColors]);

  useEffect(() => {
    setHoverPointIndex(-1);
    setHoverSeriesIndex(-1);
    if (!tooltip) scene?.showTooltip(null, new THREE.Vector3());
    return () => scene?.showTooltip(null, new THREE.Vector3());
  }, [model, scene, tooltip]);

  const handlePointOver = useCallback(
    (index: number) => {
      const pt = model.allPoints[index];
      if (!pt) return;
      setHoverPointIndex(index);
      setHoverSeriesIndex(pt.seriesIndex);
      if (!tooltip || !scene) return;
      const color = seriesColors[pt.seriesIndex];
      scene.showTooltip(
        {
          label: `${pt.seriesName} · ${pt.indicatorName}`,
          row: null,
          series: [
            {
              key: 'value',
              name: '得分',
              color,
              value: pt.value,
              formatted: `${formatNumber(pt.value)} / ${formatNumber(pt.max)}`,
            },
            {
              key: 'ratio',
              name: '达成率',
              color,
              value: pt.ratio * 100,
              formatted: `${(pt.ratio * 100).toFixed(1)}%`,
            },
          ],
        },
        new THREE.Vector3(pt.position[0], pt.position[1] + 12, pt.position[2]),
      );
    },
    [model.allPoints, scene, seriesColors, tooltip],
  );

  const handleClear = useCallback(() => {
    setHoverPointIndex(-1);
    setHoverSeriesIndex(-1);
    scene?.showTooltip(null, new THREE.Vector3());
  }, [scene]);

  const handleClick = useCallback(
    (pt: Radar3DPoint) => {
      onPointClick?.({
        series: pt.seriesName,
        indicator: pt.indicatorName,
        value: pt.value,
        max: pt.max,
      });
    },
    [onPointClick],
  );

  return (
    <group position={[0, -model.topElevation * 0.45, 0]}>
      {/* 底层蛛网与外圈垂直标尺柱 */}
      {model.indicators.length >= 3 ? (
        <>
          <lineSegments geometry={webGeometry}>
            <lineBasicMaterial
              color={tokens.web}
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </lineSegments>
          <lineSegments geometry={pillarGeometry}>
            <lineBasicMaterial
              color={tokens.web}
              transparent
              opacity={0.26}
              depthWrite={false}
            />
          </lineSegments>
        </>
      ) : null}

      {/* 分层悬浮多边形系列 */}
      {model.series.map((item, idx) => (
        <RadarSeriesLayer
          key={item.name}
          series={item}
          color={seriesColors[idx]}
          highlighted={hoverSeriesIndex === idx}
          dimmed={hoverSeriesIndex >= 0 && hoverSeriesIndex !== idx}
          onOver={() => setHoverSeriesIndex(idx)}
          onOut={handleClear}
        />
      ))}

      {/* 发光维度顶点 */}
      <RadarVertices
        model={model}
        seriesColors={seriesColors}
        hoverPointIndex={hoverPointIndex}
        hoverSeriesIndex={hoverSeriesIndex}
        onOver={handlePointOver}
        onOut={handleClear}
        onClick={handleClick}
      />

      {/* 外圈维度名称标签 */}
      {showLabels
        ? model.indicators.map((ind) => (
            <TextSprite
              key={ind.name}
              text={ind.name}
              color={tokens.label}
              position={ind.labelPosition}
              scale={0.19}
            />
          ))
        : null}
    </group>
  );
}
