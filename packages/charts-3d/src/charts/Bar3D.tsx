import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useScene } from '../core/Scene3D';
import {
  buildInstanceColors,
  buildInstanceTransforms,
  type InstanceDatum,
} from '../core/instancing';
import { ColorBandLegend } from '../core/SceneLegend';
import { formatNumber, mixColor } from '@aura-react-comp/charts';
import { normalizeRatio, scaleBarHeights } from '../core/projection';

/**
 * Bar3D：三维柱状图。
 *
 * 数据是「行 × 列」的矩阵：x 与 z 是两个分类维度，value 决定柱高。
 * 颜色沿色带按值映射（低 → 高），与 2D 热力图的编码语言一致。
 *
 * 渲染策略：v1 每根柱子一个 mesh，适合 300 格以内的矩阵；
 * 更大规模换 InstancedMesh（拾取改用 instanceId），放在下一轮。
 */

export interface Bar3DDataItem {
  /** 行分类（X 轴） */
  x: string;
  /** 列分类（Z 轴） */
  z: string;
  value: number;
}

export interface Bar3DProps {
  data?: Bar3DDataItem[];
  /** 柱体最大高度（世界单位） */
  maxHeight?: number;
  /** 柱底面边长（世界单位） */
  cellSize?: number;
  /** 色带两端；缺省用主题紫 → 浅紫 */
  colorRange?: [string, string];
  /** 命中提示框 */
  tooltip?: boolean;
  /** 显示色带图例与数值参考刻度 */
  legend?: boolean;
  /** 入场生长动画；数据频繁刷新的监控场景可关闭 */
  animation?: boolean;
  /** 点击柱体回调 */
  onBarClick?: (item: Bar3DDataItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** 色带端点：跟随暗色场景（Scene3D 内部是深色底） */
const DEFAULT_RANGE: [string, string] = ['#7c3aed', '#c4b5fd'];

/**
 * Canvas 纹理文字。
 *
 * three 渲染文字不引入额外字体的最轻做法：把文字画到离屏 canvas，
 * 作为 sprite 贴图。高分辨率绘制（4 倍）避免近距离发虚。
 */
export function TextSprite({
  text,
  color = '#94a3b8',
  position,
  scale = 0.22,
}: {
  text: string;
  color?: string;
  position: [number, number, number];
  scale?: number;
}) {
  const aspect = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 4;
    ctx.font = '500 48px system-ui';
    return (ctx.measureText(text).width + 24) / 72;
  }, [text]);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.font = '500 48px system-ui';
    const width = Math.ceil(ctx.measureText(text).width + 24);
    canvas.width = width;
    canvas.height = 72;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 12, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [text, color]);

  if (!texture) return null;
  return (
    <sprite position={position} scale={[aspect * scale, scale, 1]}>
      <spriteMaterial
        attach="material"
        map={texture}
        transparent
        depthWrite={false}
      />
    </sprite>
  );
}

/** 入场生长动画的时长（秒）与错峰比例 */
const GROWTH_DURATION = 0.62;
const GROWTH_STAGGER = 0.5;

/** 柱体规模阈值：超过后切 InstancedMesh（整屏一次 draw call） */
const INSTANCE_THRESHOLD = 300;

function easeOutQuint(t: number): number {
  return 1 - (1 - t) ** 5;
}

/** 单根柱体：从基线错峰生长。数据更新不重播（progress 闭包保持） */
function AnimatedBar({
  bar,
  cellSize,
  delayRatio,
  animated,
  hasHover,
  isHover,
  onOver,
  onOut,
  onClick,
}: {
  bar: { item: Bar3DDataItem; x: number; z: number; h: number; color: string };
  cellSize: number;
  delayRatio: number;
  animated: boolean;
  hasHover: boolean;
  isHover: boolean;
  onOver: () => void;
  onOut: () => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  // 动画关闭时初始即为终态：useFrame 首帧直接跳过
  const progress = useRef(animated ? 0 : 1);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || progress.current >= 1) return;
    // 负值阶段是错峰等待：delayRatio * 时长内不动
    progress.current = Math.min(1, progress.current + delta / GROWTH_DURATION);
    const elapsed =
      progress.current * (1 + GROWTH_STAGGER) - delayRatio * GROWTH_STAGGER;
    const eased = easeOutQuint(Math.max(0, Math.min(1, elapsed)));
    mesh.scale.y = Math.max(eased, 0.001);
    mesh.position.y = (bar.h * eased) / 2;
  });

  return (
    <mesh
      ref={meshRef}
      position={[bar.x, bar.h / 2, bar.z]}
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
      <boxGeometry args={[cellSize, Math.max(bar.h, 1), cellSize]} />
      <meshStandardMaterial
        color={
          isHover
            ? mixColor(bar.color, '#ffffff', 0.35)
            : hasHover
              ? mixColor(bar.color, '#0f172a', 0.45)
              : bar.color
        }
        roughness={0.45}
        metalness={0.15}
      />
    </mesh>
  );
}

/**
 * InstancedBars：柱体规模 > 300 时的渲染分支。
 *
 * 全部柱体共用一个 BoxGeometry（实例矩阵区分位置与高度），
 * 整屏一次 draw call；拾取用 raycaster 的 instanceId 反查数据。
 * 生长动画每帧重建实例矩阵 —— 3000 柱每帧 3000 次矩阵写，可接受。
 */
function InstancedBars({
  instances,
  cellSize,
  colorRange,
  hoverIndex,
  onHover,
  onOut,
  onClick,
  animated,
}: {
  instances: InstanceDatum[];
  cellSize: number;
  colorRange: [string, string];
  hoverIndex: number;
  onHover: (index: number) => void;
  onOut: () => void;
  onClick: (index: number) => void;
  animated: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progress = useRef(animated ? 1 : 0);

  const instanceColors = useMemo(
    () => buildInstanceColors(instances, colorRange),
    [instances, colorRange],
  );

  // 初始：矩阵与颜色一次写入
  React.useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { matrices } = buildInstanceTransforms(
      instances,
      cellSize,
      0,
      GROWTH_STAGGER,
    );
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    instanceColors.forEach((color, index) =>
      mesh.setColorAt(index, new THREE.Color(color.r, color.g, color.b)),
    );
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instances, instanceColors, cellSize]);

  // 生长动画：每帧按错峰进度重建实例矩阵
  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta / GROWTH_DURATION);
    const { matrices } = buildInstanceTransforms(
      instances,
      cellSize,
      progress.current,
      GROWTH_STAGGER,
    );
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  });

  // hover 高亮：命中实例提亮，上一个恢复（只更新两个实例，不整批重刷）
  const previousHover = useRef(-1);
  React.useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !mesh.instanceColor) return;
    if (previousHover.current >= 0 && instanceColors[previousHover.current]) {
      const original = instanceColors[previousHover.current];
      mesh.setColorAt(
        previousHover.current,
        new THREE.Color(original.r, original.g, original.b),
      );
    }
    if (hoverIndex >= 0 && instanceColors[hoverIndex]) {
      const original = instanceColors[hoverIndex];
      const highlight = new THREE.Color(
        original.r,
        original.g,
        original.b,
      ).lerp(new THREE.Color('#ffffff'), 0.4);
      mesh.setColorAt(hoverIndex, highlight);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    previousHover.current = hoverIndex;
  }, [hoverIndex, instanceColors]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, Math.max(1, instances.length)]}
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
      <boxGeometry args={[cellSize, 1, cellSize]} />
      <meshStandardMaterial roughness={0.45} metalness={0.15} />
    </instancedMesh>
  );
}

export function Bar3D({
  data = [],
  maxHeight = 160,
  cellSize = 26,
  colorRange = DEFAULT_RANGE,
  tooltip = true,
  legend = true,
  animation = true,
  onBarClick,
}: Bar3DProps) {
  const scene = useScene();
  const [hover, setHover] = useState<{
    item: Bar3DDataItem;
    top: THREE.Vector3;
  } | null>(null);

  // 色带图例：声明到 Scene3D 的 DOM 覆盖层，卸载时清除
  React.useEffect(() => {
    if (!scene || !legend || data.length === 0) return undefined;
    const values = data.map((item) =>
      Number.isFinite(item.value) ? item.value : 0,
    );
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    scene.setOverlay(
      <ColorBandLegend
        min={min}
        max={max}
        colorRange={colorRange}
        label="数值色带"
      />,
    );
    return () => scene.setOverlay(null);
  }, [scene, legend, data, colorRange]);

  const model = useMemo(() => {
    const xLabels: string[] = [];
    const zLabels: string[] = [];
    for (const item of data) {
      if (!xLabels.includes(item.x)) xLabels.push(item.x);
      if (!zLabels.includes(item.z)) zLabels.push(item.z);
    }

    const xIndex = new Map(xLabels.map((label, index) => [label, index]));
    const zIndex = new Map(zLabels.map((label, index) => [label, index]));

    const values = data.map((item) =>
      Number.isFinite(item.value) ? item.value : 0,
    );
    const heights = scaleBarHeights(values, maxHeight);

    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);

    const spacing = cellSize * 1.55;
    const bars = data.map((item, index) => {
      const column = xIndex.get(item.x) ?? 0;
      const row = zIndex.get(item.z) ?? 0;
      const x = (column - (xLabels.length - 1) / 2) * spacing;
      const z = (row - (zLabels.length - 1) / 2) * spacing;
      const h = heights[index];
      const ratio = normalizeRatio(values[index], min, max);
      return {
        item,
        x,
        z,
        h,
        color: mixColor(colorRange[0], colorRange[1], ratio),
      };
    });

    // 地面网格线：沿 X / Z 方向各画 (n + 1) 条
    const halfW = ((xLabels.length - 1) * spacing) / 2 + spacing / 2;
    const halfD = ((zLabels.length - 1) * spacing) / 2 + spacing / 2;
    const gridLines: {
      a: [number, number, number];
      b: [number, number, number];
    }[] = [];
    for (let i = 0; i <= xLabels.length; i += 1) {
      const x = -halfW + i * spacing;
      gridLines.push({ a: [x, 0, -halfD], b: [x, 0, halfD] });
    }
    for (let i = 0; i <= zLabels.length; i += 1) {
      const z = -halfD + i * spacing;
      gridLines.push({ a: [-halfW, 0, z], b: [halfW, 0, z] });
    }

    const useInstances = bars.length > INSTANCE_THRESHOLD;
    const instances: InstanceDatum[] = useInstances
      ? bars.map((bar, index) => ({
          index,
          x: bar.x,
          z: bar.z,
          height: bar.h,
          ratio: Math.min(
            1,
            Math.max(0, normalizeRatio(values[index], min, max)),
          ),
        }))
      : [];

    // 数值参考刻度：max 值的 25% / 50% / 75% / 100% 四档
    // heights 的映射是 value / valueMax * maxHeight，所以 ratio 高度处的数值就是 valueMax * ratio
    const valueMax = Math.max(...values, 0);
    const yTicks = [0.25, 0.5, 0.75, 1].map((ratio) => ({
      y: ratio * maxHeight,
      label: formatNumber(valueMax * ratio, { compact: true }),
    }));

    return {
      bars,
      gridLines,
      xLabels,
      zLabels,
      spacing,
      halfW,
      halfD,
      useInstances,
      instances,
      yTicks,
    };
  }, [data, maxHeight, cellSize, colorRange]);

  return (
    <group>
      {/* 地面网格 */}
      {model.gridLines.map((line, index) => (
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

      {/* 柱体：大规模切 InstancedMesh（一次 draw call） */}
      {model.useInstances ? (
        <InstancedBars
          instances={model.instances}
          cellSize={cellSize}
          colorRange={colorRange}
          animated={animation}
          hoverIndex={model.bars.findIndex((bar) => hover?.item === bar.item)}
          onHover={(index) => {
            const bar = model.bars[index];
            if (!bar) return;
            setHover({
              item: bar.item,
              top: new THREE.Vector3(bar.x, bar.h + 6, bar.z),
            });
            if (tooltip && scene) {
              scene.showTooltip(
                {
                  label: `${bar.item.x} · ${bar.item.z}`,
                  row: null,
                  series: [
                    {
                      key: 'value',
                      name: '数值',
                      color: bar.color,
                      value: bar.item.value,
                      formatted: String(bar.item.value),
                    },
                  ],
                },
                new THREE.Vector3(bar.x, bar.h + 6, bar.z),
              );
            }
          }}
          onOut={() => {
            setHover(null);
            if (tooltip && scene) scene.showTooltip(null, new THREE.Vector3());
          }}
          onClick={(index) => onBarClick?.(model.bars[index].item)}
        />
      ) : (
        model.bars.map((bar, index) => (
          <AnimatedBar
            key={`${bar.item.x}-${bar.item.z}`}
            bar={bar}
            cellSize={cellSize}
            delayRatio={
              model.bars.length > 1 ? index / (model.bars.length - 1) : 0
            }
            animated={animation}
            hasHover={hover !== null}
            isHover={hover?.item === bar.item}
            onOver={() => {
              setHover({
                item: bar.item,
                top: new THREE.Vector3(bar.x, bar.h + 6, bar.z),
              });
              if (tooltip && scene) {
                scene.showTooltip(
                  {
                    label: `${bar.item.x} · ${bar.item.z}`,
                    row: null,
                    series: [
                      {
                        key: 'value',
                        name: '数值',
                        color: bar.color,
                        value: bar.item.value,
                        formatted: String(bar.item.value),
                      },
                    ],
                  },
                  new THREE.Vector3(bar.x, bar.h + 6, bar.z),
                );
              }
            }}
            onOut={() => {
              setHover(null);
              if (tooltip && scene)
                scene.showTooltip(null, new THREE.Vector3());
            }}
            onClick={() => onBarClick?.(bar.item)}
          />
        ))
      )}

      {/* 数值参考刻度：25% / 50% / 75% / 100% 四档水平线 + 数值标注 */}
      {legend
        ? model.yTicks.map((tick, index) => (
            <group key={`ytick-${index}`}>
              {/* 前边缘与左边缘的两条参考线 */}
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(self) =>
                    self.setFromPoints([
                      new THREE.Vector3(-model.halfW, tick.y, model.halfD),
                      new THREE.Vector3(model.halfW, tick.y, model.halfD),
                    ])
                  }
                />
                <lineBasicMaterial color="#64748b" transparent opacity={0.4} />
              </line>
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(self) =>
                    self.setFromPoints([
                      new THREE.Vector3(-model.halfW, tick.y, -model.halfD),
                      new THREE.Vector3(-model.halfW, tick.y, model.halfD),
                    ])
                  }
                />
                <lineBasicMaterial color="#64748b" transparent opacity={0.4} />
              </line>
              <TextSprite
                text={tick.label}
                position={[-model.halfW - 16, tick.y, model.halfD + 4]}
                scale={0.2}
              />
            </group>
          ))
        : null}

      {/* 行 / 列标签 */}
      {model.xLabels.map((label, index) => {
        const x = (index - (model.xLabels.length - 1) / 2) * model.spacing;
        return (
          <TextSprite
            key={`xlabel-${label}`}
            text={label}
            position={[x, 1, model.halfD + 16]}
          />
        );
      })}
      {model.zLabels.map((label, index) => {
        const z = (index - (model.zLabels.length - 1) / 2) * model.spacing;
        return (
          <TextSprite
            key={`zlabel-${label}`}
            text={label}
            position={[model.halfW + 24, 1, z]}
          />
        );
      })}
    </group>
  );
}
