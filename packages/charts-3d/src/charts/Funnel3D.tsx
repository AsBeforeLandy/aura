import React, {
  useCallback,
  useEffect,
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
  buildFunnel3DModel,
  type Funnel3DModelStage,
  type Funnel3DShape,
  type Funnel3DStage,
  type Funnel3DVariant,
} from '../core/funnel3d';

export { buildFunnel3DModel } from '../core/funnel3d';
export type {
  Funnel3DModel,
  Funnel3DModelOptions,
  Funnel3DModelStage,
  Funnel3DShape,
  Funnel3DStage,
  Funnel3DVariant,
} from '../core/funnel3d';

const EMPTY_DATA: Funnel3DStage[] = [];
const DEFAULT_SERIES = [
  '#7c3aed',
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ec4899',
];

/** Funnel3D 组件属性（Scene3D 场景子组件）。 */
export interface Funnel3DProps {
  /** 阶段数据（按从上到下顺序展示）。@default [] */
  data?: Funnel3DStage[];
  /** 形态：倒置转化漏斗或正置层级金字塔。@default 'funnel' */
  variant?: Funnel3DVariant;
  /** 截面形状：圆台 / 六棱台 / 四棱台。@default 'round' */
  shape?: Funnel3DShape;
  /** 漏斗总高度（世界单位）。@default 210 */
  height?: number;
  /** 最大半径（世界单位）。@default 105 */
  maxRadius?: number;
  /** 层间悬浮缝隙（世界单位）。@default 7 */
  gap?: number;
  /** 分类色板；缺省读取 Scene3D 主题系列色。 */
  palette?: string[];
  /** 是否显示分类图例。@default true */
  legend?: boolean;
  /** 是否显示悬停提示框（含整体转化率与环节转化率）。@default true */
  tooltip?: boolean;
  /** 是否在右侧展示阶段名称与转化率标注。@default true */
  showLabels?: boolean;
  /** 是否开启错峰展开与悬停微放大动画。@default true */
  animation?: boolean;
  /** 点击阶段回调原始阶段对象。 */
  onStageClick?: (stage: Funnel3DStage) => void;
}

function shapeSegments(shape: Funnel3DShape): number {
  if (shape === 'hex') return 6;
  if (shape === 'square') return 4;
  return 48;
}

function StageMesh({
  stage,
  totalCount,
  shape,
  color,
  isHover,
  hasHover,
  animated,
  onOver,
  onOut,
  onClick,
}: {
  stage: Funnel3DModelStage;
  totalCount: number;
  shape: Funnel3DShape;
  color: string;
  isHover: boolean;
  hasHover: boolean;
  animated: boolean;
  onOver: () => void;
  onOut: () => void;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const growRef = useRef(animated ? 0 : 1);
  const scaleRef = useRef(1);

  const segments = shapeSegments(shape);
  const rotY = shape === 'square' ? Math.PI / 4 : 0;
  const delay = totalCount > 1 ? (stage.index / (totalCount - 1)) * 0.38 : 0;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);

    let intro = 1;
    if (growRef.current < 1) {
      growRef.current = Math.min(1, growRef.current + dt / 0.72);
      const local = Math.min(
        1,
        Math.max(0, (growRef.current - delay) / (1 - delay)),
      );
      intro = 1 - (1 - local) ** 5;
    }

    const targetScale = isHover ? 1.075 : 1;
    scaleRef.current = animated
      ? scaleRef.current +
        (targetScale - scaleRef.current) * Math.min(1, dt * 10)
      : targetScale;

    const s = Math.max(0.01, intro) * scaleRef.current;
    group.scale.set(s, Math.max(0.01, intro), s);
    group.position.set(
      0,
      stage.centerY - (1 - intro) * 26,
      (scaleRef.current - 1) * 80,
    );
  });

  const rimColor = useMemo(() => mixColor(color, '#ffffff', 0.45), [color]);
  const opacity = hasHover && !isHover ? 0.46 : 0.9;

  return (
    <group ref={groupRef} position={[0, stage.centerY, 0]}>
      <mesh
        rotation={[0, rotY, 0]}
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
        <cylinderGeometry
          args={[stage.topRadius, stage.bottomRadius, stage.height, segments]}
        />
        <meshStandardMaterial
          color={color}
          roughness={0.24}
          metalness={0.16}
          emissive={color}
          emissiveIntensity={isHover ? 0.3 : 0.06}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* 顶部微发光描边光环，凸显悬浮层次感 */}
      {stage.topRadius > 8 ? (
        <mesh
          rotation={[-Math.PI / 2, 0, rotY]}
          position={[0, stage.height / 2 + 0.35, 0]}
        >
          <ringGeometry
            args={[stage.topRadius * 0.9, stage.topRadius, segments]}
          />
          <meshBasicMaterial
            color={rimColor}
            transparent
            opacity={hasHover && !isHover ? 0.25 : 0.72}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

/** Funnel3D：三维悬浮转化漏斗 / 金字塔图。 */
export function Funnel3D({
  data = EMPTY_DATA,
  variant = 'funnel',
  shape = 'round',
  height = 210,
  maxRadius = 105,
  gap = 7,
  palette: paletteProp,
  legend = true,
  tooltip = true,
  showLabels = true,
  animation = true,
  onStageClick,
}: Funnel3DProps) {
  const scene = useScene();
  const [hoverIndex, setHoverIndex] = useState(-1);

  const model = useMemo(
    () => buildFunnel3DModel(data, { variant, height, maxRadius, gap }),
    [data, gap, height, maxRadius, variant],
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

  const stageColors = useMemo(
    () =>
      model.stages.map(
        (item) => item.stage.color || palette[item.index % palette.length],
      ),
    [model.stages, palette],
  );

  const tokens = useMemo(
    () => ({
      line: scene?.readToken('--aura-border-hover', '#94a3b8') ?? '#94a3b8',
      label: scene?.readToken('--aura-text', '#334155') ?? '#334155',
    }),
    [scene],
  );

  const guideGeometry = useMemo(() => {
    const verts: number[] = [];
    const labelX = model.maxRadius + 30;
    model.stages.forEach((stage) => {
      const midR = (stage.topRadius + stage.bottomRadius) / 2;
      verts.push(midR + 6, stage.centerY, 0, labelX - 6, stage.centerY, 0);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(verts), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, [model.maxRadius, model.stages]);
  useEffect(() => () => guideGeometry.dispose(), [guideGeometry]);

  useEffect(() => {
    if (!scene || !legend || model.stages.length === 0) return undefined;
    scene.setOverlay(
      <CategoryLegend
        items={model.stages.map((item, idx) => ({
          label: item.name,
          color: stageColors[idx],
        }))}
      />,
    );
    return () => scene.setOverlay(null);
  }, [legend, model.stages, scene, stageColors]);

  useEffect(() => {
    setHoverIndex(-1);
    if (!tooltip) scene?.showTooltip(null, new THREE.Vector3());
    return () => scene?.showTooltip(null, new THREE.Vector3());
  }, [model, scene, tooltip]);

  const handleOver = useCallback(
    (index: number) => {
      const stage = model.stages[index];
      if (!stage) return;
      setHoverIndex(index);
      if (!tooltip || !scene) return;
      const color = stageColors[index];
      scene.showTooltip(
        {
          label: stage.name,
          row: null,
          series: [
            {
              key: 'value',
              name: '数值',
              color,
              value: stage.value,
              formatted: formatNumber(stage.value),
            },
            {
              key: 'stepRate',
              name: '环节转化',
              color,
              value: stage.stepRate * 100,
              formatted: `${(stage.stepRate * 100).toFixed(1)}%`,
            },
            {
              key: 'overallRate',
              name: '总转化率',
              color,
              value: stage.overallRate * 100,
              formatted: `${(stage.overallRate * 100).toFixed(1)}%`,
            },
          ],
        },
        new THREE.Vector3(0, stage.centerY + stage.height * 0.4, 0),
      );
    },
    [model.stages, scene, stageColors, tooltip],
  );

  const handleOut = useCallback(() => {
    setHoverIndex(-1);
    scene?.showTooltip(null, new THREE.Vector3());
  }, [scene]);

  const labelX = model.maxRadius + 58;

  return (
    <group>
      {model.stages.map((stage, idx) => (
        <StageMesh
          key={`${stage.name}-${idx}`}
          stage={stage}
          totalCount={model.stages.length}
          shape={shape}
          color={stageColors[idx]}
          isHover={hoverIndex === idx}
          hasHover={hoverIndex >= 0}
          animated={animation}
          onOver={() => handleOver(idx)}
          onOut={handleOut}
          onClick={() => onStageClick?.(stage.stage)}
        />
      ))}

      {/* 右侧引导线与转化率标注 */}
      {showLabels && model.stages.length > 0 ? (
        <>
          <lineSegments geometry={guideGeometry}>
            <lineBasicMaterial
              color={tokens.line}
              transparent
              opacity={0.55}
              depthWrite={false}
            />
          </lineSegments>
          {model.stages.map((stage) => (
            <TextSprite
              key={`label-${stage.name}-${stage.index}`}
              text={`${stage.name} ${(stage.overallRate * 100).toFixed(0)}%`}
              color={tokens.label}
              position={[labelX, stage.centerY, 0]}
              scale={0.18}
            />
          ))}
        </>
      ) : null}
    </group>
  );
}
