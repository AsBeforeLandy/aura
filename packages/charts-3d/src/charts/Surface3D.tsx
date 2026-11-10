import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mixColor } from '@aura-react-comp/charts';
import { normalizeRatio } from '../core/projection';

/**
 * Surface3D：三维曲面。
 *
 * 数据是值矩阵 values[row][col]：行列索引映射到 X / Z 平面，
 * 值映射到 Y 高度；顶点色沿色带按高度渐变——
 * 「用一张连续的面表达双变量函数」，适合优化地形、概率密度、能量面。
 *
 * 几何数据（顶点 / 索引 / 顶点色）由纯函数构造，jsdom 可直接单测；
 * 组件层只负责把 BufferGeometry 交给 three。
 */

export interface Surface3DProps {
  /** 值矩阵：values[row][col]，行列可以是任意 >= 2 的尺寸 */
  values?: number[][];
  /** 网格宽度（世界单位） */
  width?: number;
  /** 网格深度（世界单位） */
  depth?: number;
  /** 曲面最大起伏（世界单位） */
  maxHeight?: number;
  /** 色带（支持多段，如 [低, 中, 高]） */
  colorRange?: string[];
  /** 线框叠加：排查网格结构时用 */
  wireframe?: boolean;
}

/** 在多段色带上取 t（0~1）位置的颜色 */
export function sampleGradient(colors: string[], t: number): string {
  if (colors.length === 0) return '#888888';
  if (colors.length === 1) return colors[0];
  const clamped = Math.min(1, Math.max(0, t)) * (colors.length - 1);
  const index = Math.min(Math.floor(clamped), colors.length - 2);
  return mixColor(colors[index], colors[index + 1], clamped - index);
}

export interface SurfaceGeometryData {
  positions: number[];
  colors: number[];
  indices: number[];
  minValue: number;
  maxValue: number;
}

/**
 * 值矩阵 → 曲面几何数据。
 *
 * 行列 与 X / Z 平面对应；三角形按「每格两个」的标准网格索引展开。
 * 顶点色按归一化高度取色带，min 与 max 相等时整面取中点色。
 */
export function buildSurfaceGeometryData(
  values: number[][],
  options: {
    width: number;
    depth: number;
    maxHeight: number;
    colorRange: string[];
  },
): SurfaceGeometryData {
  const { width, depth, maxHeight, colorRange } = options;
  const rows = values.length;
  const cols = rows > 0 ? values[0].length : 0;

  const flat = values.flat();
  const numeric = flat.filter((value) => Number.isFinite(value));
  const minValue = numeric.length ? Math.min(...numeric) : 0;
  const maxValue = numeric.length ? Math.max(...numeric) : 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      // NaN ?? 0 不生效（?? 只兜 null/undefined），必须显式判有限
      const raw = values[row][col];
      const value = Number.isFinite(raw) ? raw : 0;
      const x = cols > 1 ? (col / (cols - 1) - 0.5) * width : 0;
      const z = rows > 1 ? (row / (rows - 1) - 0.5) * depth : 0;
      const ratio = normalizeRatio(value, minValue, maxValue);
      const y = ratio * maxHeight;

      positions.push(x, y, z);

      // 顶点色按色带取值，交给 three 的 vertexColors 插值
      const color = new THREE.Color(sampleGradient(colorRange, ratio));
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let row = 0; row < rows - 1; row += 1) {
    for (let col = 0; col < cols - 1; col += 1) {
      const a = row * cols + col;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return { positions, colors, indices, minValue, maxValue };
}

export function Surface3D({
  values = [],
  width = 240,
  depth = 240,
  maxHeight = 90,
  colorRange = ['#0ea5e9', '#a855f7', '#f472b6'],
  wireframe = false,
}: Surface3DProps) {
  const geometry = useMemo(() => {
    const data = buildSurfaceGeometryData(values, {
      width,
      depth,
      maxHeight,
      colorRange,
    });

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(data.positions, 3),
    );
    bufferGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(data.colors, 3),
    );
    bufferGeometry.setIndex(data.indices);
    bufferGeometry.computeVertexNormals();
    return bufferGeometry;
  }, [values, width, depth, maxHeight, colorRange]);

  const lineGeometry = useMemo(() => {
    // 线框用同几何的索引，换成线渲染
    const wire = new THREE.BufferGeometry();
    wire.setAttribute('position', geometry.getAttribute('position'));
    wire.setIndex(geometry.getIndex());
    return wire;
  }, [geometry]);

  // 色带三段时中点色给 mixColor 两次插值，保持渐变平滑
  React.useEffect(
    () => () => {
      geometry.dispose();
      lineGeometry.dispose();
    },
    [geometry, lineGeometry],
  );

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>
      {wireframe ? (
        <lineSegments geometry={lineGeometry}>
          <lineBasicMaterial
            attach="material"
            color="#0f172a"
            transparent
            opacity={0.35}
          />
        </lineSegments>
      ) : null}
    </group>
  );
}
