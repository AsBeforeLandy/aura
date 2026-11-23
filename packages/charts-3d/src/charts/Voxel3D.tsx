import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { formatNumber, mixColor } from '@aura-react-comp/charts';
import { sampleGradient } from './Surface3D';
import { TextSprite } from './Bar3D';
import { useScene } from '../core/Scene3D';
import { ColorBandLegend } from '../core/SceneLegend';
import {
  buildVoxelModel,
  buildVoxelTransforms,
  type VoxelDatum,
} from '../core/voxel';

/**
 * Voxel3D：三维体素热力图。
 *
 * x / z 平面网格 + y 层向堆叠的立方体阵列，值 → 色带颜色。
 * 与 Bar3D 互补：Bar 用高度编码一个分类维度，Voxel 用颜色编码
 * 三个分类维度的交叉值——数据是「立方体的立方体」。
 *
 * 渲染沿用 InstancedBars 的模式：全部体素共用 BoxGeometry，
 * 一次 draw call；拾取按 instanceId 反查；hover 提亮只写两个实例。
 */

const GROWTH_DURATION = 0.62;
const GROWTH_STAGGER = 0.5;

export interface Voxel3DProps {
  data?: VoxelDatum[];
  /** 体素边长（世界单位） */
  voxelSize?: number;
  /** 色带（支持多段，低浅高深）；缺省紫阶 400 → 500 → 700 */
  colorRange?: string[];
  /** 图例形态：色带（按值）或省略 */
  legend?: boolean;
  /** 入场缩放动画 */
  animation?: boolean;
  /** 命中提示框 */
  tooltip?: boolean;
  /** 点击体素回调 */
  onVoxelClick?: (datum: VoxelDatum) => void;
}

const DEFAULT_RANGE: string[] = ['#a78bfa', '#8b5cf6', '#6d28d9'];

/** InstancedMesh 体素层：矩阵 / 颜色 / 拾取 / 错峰生长 */
function InstancedVoxels({
  model,
  voxelSize,
  colorRange,
  hoverIndex,
  animated,
  onHover,
  onOut,
  onClick,
}: {
  model: ReturnType<typeof buildVoxelModel>;
  voxelSize: number;
  colorRange: string[];
  hoverIndex: number;
  animated: boolean;
  onHover: (index: number) => void;
  onOut: () => void;
  onClick: (index: number) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progress = useRef(animated ? 0 : 1);

  const instanceColors = useMemo(
    () =>
      model.instances.map(
        (instance) =>
          new THREE.Color(sampleGradient(colorRange, instance.ratio)),
      ),
    [model, colorRange],
  );

  // 初始：矩阵与颜色一次写入
  React.useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrices = buildVoxelTransforms(
      model.instances,
      voxelSize,
      animated ? 0 : 1,
      GROWTH_STAGGER,
    );
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    instanceColors.forEach((color, index) => mesh.setColorAt(index, color));
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [model, instanceColors, voxelSize, animated]);

  // 生长动画：每帧按错峰进度重建实例矩阵
  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta / GROWTH_DURATION);
    const matrices = buildVoxelTransforms(
      model.instances,
      voxelSize,
      progress.current,
      GROWTH_STAGGER,
    );
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  });

  // hover 高亮：命中体素提亮，上一个恢复（只写两个实例）
  const previousHover = useRef(-1);
  React.useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !mesh.instanceColor) return;
    if (previousHover.current >= 0 && instanceColors[previousHover.current]) {
      mesh.setColorAt(
        previousHover.current,
        instanceColors[previousHover.current],
      );
    }
    if (hoverIndex >= 0 && instanceColors[hoverIndex]) {
      mesh.setColorAt(
        hoverIndex,
        instanceColors[hoverIndex]
          .clone()
          .lerp(new THREE.Color('#ffffff'), 0.4),
      );
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    previousHover.current = hoverIndex;
  }, [hoverIndex, instanceColors]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, Math.max(1, model.instances.length)]}
      onPointerOver={(event) => {
        event.stopPropagation();
        const index = event.instanceId ?? -1;
        if (index >= 0) onHover(index);
      }}
      onPointerOut={() => onOut()}
      onClick={(event) => {
        event.stopPropagation();
        const index = event.instanceId ?? -1;
        if (index >= 0) onClick(index);
      }}
    >
      <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
      <meshStandardMaterial
        transparent
        opacity={0.88}
        roughness={0.4}
        metalness={0.1}
      />
    </instancedMesh>
  );
}

export function Voxel3D({
  data = [],
  voxelSize = 16,
  colorRange,
  legend = true,
  animation = true,
  tooltip = true,
  onVoxelClick,
}: Voxel3DProps) {
  const scene = useScene();
  const [hoverIndex, setHoverIndex] = React.useState(-1);
  const model = useMemo(
    () => buildVoxelModel(data, voxelSize),
    [data, voxelSize],
  );

  // 主锚关联色：默认三档从系列色板首色（品牌主锚，随主题联动）派生
  // 明度梯度 —— 3D 材质自带光照衰减，深端只轻压（mix 黑 0.2）保持明快；
  // 显式传入的 colorRange 优先。
  const range = useMemo<string[]>(() => {
    if (colorRange) return colorRange;
    const anchor =
      scene?.seriesColors?.[0] ??
      scene?.readToken('--aura-primary-700', DEFAULT_RANGE[1]) ??
      DEFAULT_RANGE[1];
    return [
      mixColor(anchor, '#ffffff', 0.35),
      anchor,
      mixColor(anchor, '#000000', 0.2),
    ];
  }, [scene, colorRange]);

  // 图例：色带（min → max）
  React.useEffect(() => {
    if (!scene || !legend || data.length === 0) return undefined;
    scene.setOverlay(
      <ColorBandLegend
        min={model.min}
        max={model.max}
        colorRange={range}
        label="数值色带"
      />,
    );
    return () => scene.setOverlay(null);
  }, [scene, legend, data, model, range]);

  const handleHover = (index: number) => {
    setHoverIndex(index);
    if (!tooltip || !scene) return;
    const instance = model.instances[index];
    if (!instance) return;
    const { datum } = instance;
    scene.showTooltip(
      {
        label: `${datum.x} · ${datum.y} · ${datum.z}`,
        row: null,
        series: [
          {
            key: 'value',
            name: '数值',
            color: sampleGradient(range, instance.ratio),
            value: datum.value,
            formatted: formatNumber(datum.value),
          },
        ],
      },
      new THREE.Vector3(...instance.position).add(
        new THREE.Vector3(0, model.spacing * 0.8, 0),
      ),
    );
  };

  const handleOut = () => {
    setHoverIndex(-1);
    if (scene) scene.showTooltip(null, new THREE.Vector3());
  };

  // 地面网格（xz 平面）
  const gridLines = useMemo(() => {
    const lines: {
      a: [number, number, number];
      b: [number, number, number];
    }[] = [];
    const halfW = model.halfW;
    const halfD = model.halfD;
    for (let i = 0; i <= model.xLabels.length; i += 1) {
      const x = -halfW + i * model.spacing;
      lines.push({
        a: [x, -model.spacing * 0.6, -halfD],
        b: [x, -model.spacing * 0.6, halfD],
      });
    }
    for (let i = 0; i <= model.zLabels.length; i += 1) {
      const z = -halfD + i * model.spacing;
      lines.push({
        a: [-halfW, -model.spacing * 0.6, z],
        b: [halfW, -model.spacing * 0.6, z],
      });
    }
    return lines;
  }, [model]);

  const axisLabelColor = '#94a3b8';

  return (
    <group>
      {/* 地面网格 */}
      {gridLines.map((line, index) => (
        <line key={`grid-${index}`}>
          <bufferGeometry
            attach="geometry"
            onUpdate={(self) =>
              self.setFromPoints([
                new THREE.Vector3(...line.a),
                new THREE.Vector3(...line.b),
              ])
            }
          />
          <lineBasicMaterial
            attach="material"
            color="#475569"
            transparent
            opacity={0.5}
          />
        </line>
      ))}

      {/* 体素阵列 */}
      <InstancedVoxels
        model={model}
        voxelSize={voxelSize}
        colorRange={range}
        hoverIndex={hoverIndex}
        animated={animation}
        onHover={handleHover}
        onOut={handleOut}
        onClick={(index) => onVoxelClick?.(model.instances[index].datum)}
      />

      {/* 三轴标签：X 前缘 / Z 右缘 / Y 层左缘 */}
      {model.xLabels.map((label, index) => (
        <TextSprite
          key={`x-${label}`}
          text={label}
          position={[
            (index - (model.xLabels.length - 1) / 2) * model.spacing,
            -model.spacing * 0.6,
            model.halfD + 14,
          ]}
        />
      ))}
      {model.zLabels.map((label, index) => (
        <TextSprite
          key={`z-${label}`}
          text={label}
          position={[
            model.halfW + 20,
            -model.spacing * 0.6,
            (index - (model.zLabels.length - 1) / 2) * model.spacing,
          ]}
        />
      ))}
      {model.yLabels.map((label, index) => (
        <TextSprite
          key={`y-${label}`}
          text={label}
          position={[
            -model.halfW - 18,
            (index - (model.yLabels.length - 1) / 2) * model.spacing,
            -model.halfD,
          ]}
        />
      ))}

      {/* 轴名标注（可选装饰，颜色弱化） */}
      <TextSprite
        text="X"
        position={[model.halfW + 20, -model.spacing * 0.6, model.halfD + 14]}
        color={axisLabelColor}
        scale={0.18}
      />
    </group>
  );
}
