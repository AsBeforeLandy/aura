import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useScene } from '../core/Scene3D';
import { mixColor } from '@aura-react-comp/charts';
import { normalizeRatio } from '../core/projection';
import { CategoryLegend, ColorBandLegend } from '../core/SceneLegend';

/**
 * Scatter3D：三维散点图。
 *
 * 三个数值维度的位置编码（x / y / z），点大小与颜色可作为第四、第五个
 * 编码通道——但编码通道越多读者越难还原数值，size 默认关闭，
 * 需要时显式打开并配合 tooltip。
 */

export interface Scatter3DPoint {
  x: number;
  y: number;
  z: number;
  /** 类别名：同名的点共用一种颜色 */
  category?: string;
}

export interface Scatter3DProps {
  data?: Scatter3DPoint[];
  /** 点基础半径（世界单位） */
  pointSize?: number;
  /** 是否按 y 值渐变着色（关闭时按 category 着色） */
  colorByValue?: boolean;
  /** 色带两端（colorByValue 时生效） */
  colorRange?: [string, string];
  /** 坐标轴范围 [min, max]，不传按数据自动计算 */
  ranges?: { x?: [number, number]; y?: [number, number]; z?: [number, number] };
  /** 三条轴的长度（世界单位） */
  axisLength?: number;
  /** 命中提示框 */
  tooltip?: boolean;
}

const DEFAULT_RANGE: [string, string] = ['#7c3aed', '#0ea5e9'];
/** 三个类目以上的循环色板（暗底可读） */
const CATEGORY_COLORS = [
  '#a78bfa',
  '#22d3ee',
  '#f472b6',
  '#facc15',
  '#4ade80',
  '#fb923c',
];

/**
 * 三维散点的场景构造：轴框架 + 点位。
 * 纯数据计算拆出来，让缩放逻辑可以在 jsdom 里单测。
 */
export function buildScatterModel(
  data: Scatter3DPoint[],
  axisLength: number,
  ranges: Scatter3DProps['ranges'] = {},
) {
  const extent = (
    values: number[],
    fixed?: [number, number],
  ): [number, number] => {
    if (fixed) return fixed;
    const numeric = values.filter((v) => Number.isFinite(v));
    if (!numeric.length) return [0, 1];
    return [Math.min(...numeric), Math.max(...numeric)];
  };

  const xs = data.map((p) => p.x);
  const ys = data.map((p) => p.y);
  const zs = data.map((p) => p.z);

  const [minX, maxX] = extent(xs, ranges.x);
  const [minY, maxY] = extent(ys, ranges.y);
  const [minZ, maxZ] = extent(zs, ranges.z);

  // 值 → -axis/2..axis/2 的坐标（居中于原点）
  const center = (value: number, min: number, max: number) => {
    if (max === min) return 0;
    return ((value - min) / (max - min) - 0.5) * axisLength;
  };

  const toX = (v: number) => center(v, minX, maxX);
  const toZ = (v: number) => center(v, minZ, maxZ);
  // y 是高度：0 平面对应 minY，向上为正
  const toY = (v: number) => center(v, minY, maxY);

  const points = data.map((point) => ({
    point,
    position: new THREE.Vector3(toX(point.x), toY(point.y), toZ(point.z)),
    valueRatio: normalizeRatio(point.y, minY, maxY),
  }));

  return {
    points,
    ranges: { x: [minX, maxX], y: [minY, maxY], z: [minZ, maxZ] },
  };
}

export function Scatter3D({
  data = [],
  pointSize = 5,
  colorByValue = true,
  colorRange = DEFAULT_RANGE,
  ranges,
  axisLength = 240,
  tooltip = true,
}: Scatter3DProps) {
  const scene = useScene();
  const [hover, setHover] = useState<{
    point: Scatter3DPoint;
    position: THREE.Vector3;
  } | null>(null);

  const categories = useMemo(() => {
    const list: string[] = [];
    data.forEach((item) => {
      const category = item.category ?? '__default__';
      if (!list.includes(category)) list.push(category);
    });
    return list;
  }, [data]);

  const model = useMemo(
    () => buildScatterModel(data, axisLength, ranges),
    [data, axisLength, ranges],
  );

  // 图例：类别模式列色点；按值模式列色带（两端标注 Y 量程）
  React.useEffect(() => {
    if (!scene || data.length === 0) return undefined;
    if (colorByValue) {
      const [minY, maxY] = model.ranges.y;
      scene.setOverlay(
        <ColorBandLegend
          min={minY}
          max={maxY}
          colorRange={colorRange}
          label="Y 值"
        />,
      );
    } else {
      scene.setOverlay(
        <CategoryLegend
          items={categories.map((category, index) => ({
            label: category,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
          }))}
        />,
      );
    }
    return () => scene.setOverlay(null);
  }, [scene, data.length, colorByValue, categories, model, colorRange]);

  const colorOf = (point: Scatter3DPoint, valueRatio: number): string => {
    if (colorByValue) return mixColor(colorRange[0], colorRange[1], valueRatio);
    const categoryIndex = categories.indexOf(point.category ?? '__default__');
    return CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];
  };

  // 坐标轴框架：三条轴线沿 X / Y / Z
  const half = axisLength / 2;
  const axes: { a: THREE.Vector3; b: THREE.Vector3; color: string }[] = [
    {
      a: new THREE.Vector3(-half, -half, -half),
      b: new THREE.Vector3(half, -half, -half),
      color: '#94a3b8',
    },
    {
      a: new THREE.Vector3(-half, -half, -half),
      b: new THREE.Vector3(-half, half, -half),
      color: '#64748b',
    },
    {
      a: new THREE.Vector3(-half, -half, -half),
      b: new THREE.Vector3(-half, -half, half),
      color: '#94a3b8',
    },
  ];

  return (
    <group>
      {axes.map((axis, index) => (
        <line key={`axis-${index}`}>
          <bufferGeometry
            attach="geometry"
            onUpdate={(self) => self.setFromPoints([axis.a, axis.b])}
          />
          <lineBasicMaterial
            attach="material"
            color={axis.color}
            transparent
            opacity={0.7}
          />
        </line>
      ))}

      {model.points.map((item, index) => {
        const color = colorOf(item.point, item.valueRatio);
        const isHover = hover?.point === item.point;
        return (
          <mesh
            key={`point-${index}`}
            position={item.position}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHover({ point: item.point, position: item.position.clone() });
              if (tooltip && scene) {
                scene.showTooltip(
                  {
                    label: item.point.category ?? '散点',
                    row: null,
                    series: [
                      {
                        key: 'x',
                        name: 'X',
                        color,
                        value: item.point.x,
                        formatted: String(item.point.x),
                      },
                      {
                        key: 'y',
                        name: 'Y',
                        color,
                        value: item.point.y,
                        formatted: String(item.point.y),
                      },
                      {
                        key: 'z',
                        name: 'Z',
                        color,
                        value: item.point.z,
                        formatted: String(item.point.z),
                      },
                    ],
                  },
                  item.position
                    .clone()
                    .add(new THREE.Vector3(0, pointSize * 1.6, 0)),
                );
              }
            }}
            onPointerOut={() => {
              setHover(null);
              if (tooltip && scene)
                scene.showTooltip(null, new THREE.Vector3());
            }}
          >
            <sphereGeometry
              args={[isHover ? pointSize * 1.35 : pointSize, 20, 20]}
            />
            <meshStandardMaterial
              color={color}
              roughness={0.35}
              metalness={0.1}
              transparent
              opacity={activeOpacity(
                hover !== null,
                isHover || isNeighborOf(hover, item.point, data),
              )}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** 有命中时，非命中非邻居的点压暗 */
function activeOpacity(hasHover: boolean, isHighlight: boolean): number {
  if (!hasHover || isHighlight) return 1;
  return 0.25;
}

/** 判断某点是否是命中点的同数据邻居（简化：位置相同即邻居） */
function isNeighborOf(
  hover: { point: Scatter3DPoint; position: THREE.Vector3 } | null,
  point: Scatter3DPoint,
  data: Scatter3DPoint[],
): boolean {
  if (!hover) return false;
  const hoverIndex = data.indexOf(hover.point);
  const pointIndex = data.indexOf(point);
  if (hoverIndex < 0 || pointIndex < 0) return false;
  return Math.abs(hoverIndex - pointIndex) === 1;
}
