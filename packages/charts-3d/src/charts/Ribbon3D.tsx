import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { formatNumber, mixColor } from '@aura-react-comp/charts';
import { TextSprite } from './Bar3D';
import { useScene } from '../core/Scene3D';
import { CategoryLegend } from '../core/SceneLegend';
import {
  buildRibbon3DModel,
  type Ribbon3DModel,
  type Ribbon3DModelSeries,
  type Ribbon3DPoint,
  type Ribbon3DSeries,
} from '../core/ribbon3d';

export { buildRibbon3DModel } from '../core/ribbon3d';
export type {
  Ribbon3DGeometryData,
  Ribbon3DModel,
  Ribbon3DModelOptions,
  Ribbon3DModelSeries,
  Ribbon3DPoint,
  Ribbon3DSeries,
} from '../core/ribbon3d';

const EMPTY_CATEGORIES: string[] = [];
const EMPTY_SERIES: Ribbon3DSeries[] = [];
const DEFAULT_SERIES = [
  '#7c3aed',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
];

/** Ribbon3D 组件属性（Scene3D 场景子组件）。 */
export interface Ribbon3DProps {
  /** X 轴类目 / 时间刻度。@default [] */
  categories?: string[];
  /** 多条趋势序列，沿 Z 轴错落排布。@default [] */
  series?: Ribbon3DSeries[];
  /** X 轴总宽（世界单位）。@default 280 */
  width?: number;
  /** Z 轴总深（世界单位）。@default 180 */
  depth?: number;
  /** 丝带最大高度（世界单位）。@default 125 */
  maxHeight?: number;
  /** 丝带墙体厚度（世界单位）。@default 8 */
  thickness?: number;
  /** 是否使用 Catmull-Rom 样条平滑采样曲线。@default true */
  smooth?: boolean;
  /** 系列色板；缺省读取 Scene3D 主题系列色。 */
  palette?: string[];
  /** 是否显示系列图例。@default true */
  legend?: boolean;
  /** 是否显示悬停提示框。@default true */
  tooltip?: boolean;
  /** 是否显示顶部采样节点发光球并支持精确拾取。@default true */
  showNodes?: boolean;
  /** 是否显示地面与背面参考网格。@default true */
  showGrid?: boolean;
  /** 点击采样节点回调。 */
  onPointClick?: (info: {
    series: string;
    category: string;
    value: number;
    index: number;
  }) => void;
}

/** 单条 3D 渐变面积丝带墙 + 顶部高光脊线。 */
function RibbonWall({
  series,
  color,
  baseTint,
  highlighted,
  dimmed,
  onOver,
  onOut,
}: {
  series: Ribbon3DModelSeries;
  color: string;
  baseTint: string;
  highlighted: boolean;
  dimmed: boolean;
  onOver: () => void;
  onOut: () => void;
}) {
  const wallGeometry = useMemo(() => {
    const { positions, normals, heightRatios, indices } = series.geometry;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), 3),
    );
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), 3),
    );

    const colors = new Float32Array(positions.length);
    const scratch = new THREE.Color();
    const bottomColor = mixColor(color, baseTint, 0.52);
    const topColor = mixColor(color, '#ffffff', 0.14);
    for (let i = 0; i < heightRatios.length; i += 1) {
      scratch.set(mixColor(bottomColor, topColor, heightRatios[i]));
      colors[i * 3] = scratch.r;
      colors[i * 3 + 1] = scratch.g;
      colors[i * 3 + 2] = scratch.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
  }, [baseTint, color, series.geometry]);
  useEffect(() => () => wallGeometry.dispose(), [wallGeometry]);

  const ridgeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array(series.geometry.ridgePositions),
        3,
      ),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [series.geometry.ridgePositions]);
  useEffect(() => () => ridgeGeometry.dispose(), [ridgeGeometry]);

  const ridgeLine = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: mixColor(color, '#ffffff', 0.45),
      transparent: true,
      opacity: dimmed ? 0.3 : 0.95,
    });
    return new THREE.Line(ridgeGeometry, material);
  }, [color, dimmed, ridgeGeometry]);
  useEffect(
    () => () => (ridgeLine.material as THREE.Material).dispose(),
    [ridgeLine],
  );

  return (
    <group>
      <mesh
        geometry={wallGeometry}
        onPointerOver={(event) => {
          event.stopPropagation();
          onOver();
        }}
        onPointerOut={onOut}
      >
        <meshStandardMaterial
          vertexColors
          roughness={0.34}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={highlighted ? 0.24 : 0.04}
          transparent
          opacity={dimmed ? 0.3 : highlighted ? 0.95 : 0.84}
        />
      </mesh>
      <primitive object={ridgeLine} />
    </group>
  );
}

/** 全部原始采样点的发光脊线球（单个 InstancedMesh 渲染）。 */
function RibbonNodes({
  model,
  seriesColors,
  hoverPointIndex,
  hoverSeriesIndex,
  onOver,
  onOut,
  onClick,
}: {
  model: Ribbon3DModel;
  seriesColors: string[];
  hoverPointIndex: number;
  hoverSeriesIndex: number;
  onOver: (index: number) => void;
  onOut: () => void;
  onClick: (point: Ribbon3DPoint) => void;
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
      dummy.position.set(pt.position[0], pt.position[1] + 1.4, pt.position[2]);
      dummy.scale.setScalar(active ? 5.2 : inSeries ? 3.2 : 2.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);

      color.set(seriesColors[pt.seriesIndex]);
      if (active) color.lerp(white, 0.55);
      else if (inSeries) color.lerp(white, 0.22);
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

/** Ribbon3D：三维多系列趋势丝带 / 面积墙图。 */
export function Ribbon3D({
  categories = EMPTY_CATEGORIES,
  series = EMPTY_SERIES,
  width = 280,
  depth = 180,
  maxHeight = 125,
  thickness = 8,
  smooth = true,
  palette: paletteProp,
  legend = true,
  tooltip = true,
  showNodes = true,
  showGrid = true,
  onPointClick,
}: Ribbon3DProps) {
  const scene = useScene();
  const [hoverPointIndex, setHoverPointIndex] = useState(-1);
  const [hoverSeriesIndex, setHoverSeriesIndex] = useState(-1);

  const model = useMemo(
    () =>
      buildRibbon3DModel(categories, series, {
        width,
        depth,
        maxHeight,
        thickness,
        smooth,
      }),
    [categories, depth, maxHeight, series, smooth, thickness, width],
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
      bg: scene?.readToken('--aura-bg', '#ffffff') ?? '#ffffff',
      grid: scene?.readToken('--aura-border-hover', '#94a3b8') ?? '#94a3b8',
      label: scene?.readToken('--aura-text-secondary', '#64748b') ?? '#64748b',
    }),
    [scene],
  );

  const gridGeometry = useMemo(() => {
    const halfW = model.width / 2 + 18;
    const halfD = model.depth / 2 + 22;
    const verts: number[] = [];
    // 地面 X / Z 参考线
    for (const x of model.xPositions) {
      verts.push(x, 0, -halfD, x, 0, halfD);
    }
    for (const s of model.series) {
      verts.push(-halfW, 0, s.z, halfW, 0, s.z);
    }
    // 背面 4 档水平高度参考线
    for (let step = 1; step <= 4; step += 1) {
      const y = (step / 4) * model.maxHeight;
      verts.push(-halfW, y, -halfD, halfW, y, -halfD);
    }
    // 地面外框
    verts.push(
      -halfW,
      0,
      -halfD,
      halfW,
      0,
      -halfD,
      halfW,
      0,
      -halfD,
      halfW,
      0,
      halfD,
      halfW,
      0,
      halfD,
      -halfW,
      0,
      halfD,
      -halfW,
      0,
      halfD,
      -halfW,
      0,
      -halfD,
    );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(verts), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [model]);
  useEffect(() => () => gridGeometry.dispose(), [gridGeometry]);

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
          label: `${pt.seriesName} · ${pt.category}`,
          row: null,
          series: [
            {
              key: 'value',
              name: pt.seriesName,
              color,
              value: pt.value,
              formatted: formatNumber(pt.value),
            },
          ],
        },
        new THREE.Vector3(pt.position[0], pt.position[1] + 10, pt.position[2]),
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
    (pt: Ribbon3DPoint) => {
      onPointClick?.({
        series: pt.seriesName,
        category: pt.category,
        value: pt.value,
        index: pt.pointIndex,
      });
    },
    [onPointClick],
  );

  const halfW = model.width / 2 + 18;
  const halfD = model.depth / 2 + 22;

  return (
    <group position={[0, -model.maxHeight * 0.42, 0]}>
      {showGrid && model.series.length > 0 ? (
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial
            color={tokens.grid}
            transparent
            opacity={0.34}
            depthWrite={false}
          />
        </lineSegments>
      ) : null}

      {model.series.map((item, idx) => (
        <RibbonWall
          key={item.name}
          series={item}
          color={seriesColors[idx]}
          baseTint={tokens.bg}
          highlighted={hoverSeriesIndex === idx}
          dimmed={hoverSeriesIndex >= 0 && hoverSeriesIndex !== idx}
          onOver={() => setHoverSeriesIndex(idx)}
          onOut={handleClear}
        />
      ))}

      {showNodes ? (
        <RibbonNodes
          model={model}
          seriesColors={seriesColors}
          hoverPointIndex={hoverPointIndex}
          hoverSeriesIndex={hoverSeriesIndex}
          onOver={handlePointOver}
          onOut={handleClear}
          onClick={handleClick}
        />
      ) : null}

      {/* X 轴类目标签 */}
      {model.categories.map((cat, idx) => (
        <TextSprite
          key={`cat-${cat}-${idx}`}
          text={cat}
          color={tokens.label}
          position={[model.xPositions[idx], 2, halfD + 16]}
          scale={0.18}
        />
      ))}

      {/* Z 轴系列标签 */}
      {model.series.map((item) => (
        <TextSprite
          key={`series-${item.name}`}
          text={item.name}
          color={tokens.label}
          position={[halfW + 26, 4, item.z]}
          scale={0.18}
        />
      ))}
    </group>
  );
}
