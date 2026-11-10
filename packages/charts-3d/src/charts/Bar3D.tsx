import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useScene } from '../core/Scene3D';
import { mixColor } from '@aura-react-comp/charts';
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
  className?: string;
  style?: React.CSSProperties;
}

/** 色带端点：跟随暗色场景（Scene3D 内部是深色底） */
const DEFAULT_RANGE: [string, string] = ['#3b2f7a', '#c4b5fd'];

/**
 * Canvas 纹理文字。
 *
 * three 渲染文字不引入额外字体的最轻做法：把文字画到离屏 canvas，
 * 作为 sprite 贴图。高分辨率绘制（4 倍）避免近距离发虚。
 */
function TextSprite({
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

export function Bar3D({
  data = [],
  maxHeight = 160,
  cellSize = 26,
  colorRange = DEFAULT_RANGE,
  tooltip = true,
}: Bar3DProps) {
  const scene = useScene();
  const [hover, setHover] = useState<{
    item: Bar3DDataItem;
    top: THREE.Vector3;
  } | null>(null);

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

    return { bars, gridLines, xLabels, zLabels, spacing, halfW, halfD };
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

      {/* 柱体 */}
      {model.bars.map((bar) => (
        <mesh
          key={`${bar.item.x}-${bar.item.z}`}
          position={[bar.x, bar.h / 2, bar.z]}
          onPointerOver={(event) => {
            event.stopPropagation();
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
          onPointerOut={() => {
            setHover(null);
            if (tooltip && scene) scene.showTooltip(null, new THREE.Vector3());
          }}
        >
          <boxGeometry args={[cellSize, Math.max(bar.h, 1), cellSize]} />
          <meshStandardMaterial
            color={
              hover?.item === bar.item
                ? mixColor(bar.color, '#ffffff', 0.35)
                : bar.color
            }
            roughness={0.45}
            metalness={0.15}
          />
        </mesh>
      ))}

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
