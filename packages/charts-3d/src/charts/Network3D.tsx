import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { formatNumber } from '@aura-react-comp/charts';
import { TextSprite } from './Bar3D';
import { useScene } from '../core/Scene3D';
import { CategoryLegend } from '../core/SceneLegend';
import {
  buildNetworkModel,
  type Network3DLayout,
  type Network3DLink,
  type Network3DModel,
  type Network3DNode,
} from '../core/network';
export { buildNetworkModel };
export type {
  Network3DLayout,
  Network3DLink,
  Network3DModel,
  Network3DModelLink,
  Network3DModelNode,
  Network3DModelOptions,
  Network3DNode,
} from '../core/network';
/** Network3D 的组件属性。 */
export interface Network3DProps {
  /** 网络节点。 @default [] */
  nodes?: Network3DNode[];
  /** 网络连线。 @default [] */
  links?: Network3DLink[];
  /** 节点基础半径（世界单位）。 @default 5 */
  nodeSize?: number;
  /** 连线不透明度，内部限制在 0～1。 @default 0.35 */
  linkOpacity?: number;
  /** 连线颜色；缺省跟随场景系列色。 */
  linkColor?: string;
  /** 布局方式；超过 600 个节点时 force 自动退化为 sphere。 @default 'force' */
  layout?: Network3DLayout;
  /** 布局半径（世界单位）。 @default 140 */
  layoutRadius?: number;
  /** 力布局迭代次数，内部限制为 20～240。 @default 120 */
  iterations?: number;
  /** 力布局随机种子；相同数据与种子得到相同布局。 @default 7 */
  seed?: number;
  /** 节点分类色板；缺省从 Scene3D 的 seriesColors 读取。 */
  palette?: string[];
  /** 是否显示分类图例。 @default true */
  legend?: boolean;
  /** 是否显示命中提示框。 @default true */
  tooltip?: boolean;
  /** 是否显示节点名称；仅在节点数不超过 50 时生效。 @default false */
  showLabels?: boolean;
  /** 点击节点时回调原始节点对象。 */
  onNodeClick?: (node: Network3DNode) => void;
}
const DEFAULT_SERIES = [
  '#7c3aed',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
];
function InstancedNetworkNodes({
  model,
  colors,
  hoverIndex,
  activeNodes,
  highlightColor,
  mutedColor,
  onHover,
  onOut,
  onClick,
}: {
  model: Network3DModel;
  colors: THREE.Color[];
  hoverIndex: number;
  activeNodes: Set<number> | null;
  highlightColor: string;
  mutedColor: string;
  onHover: (index: number) => void;
  onOut: () => void;
  onClick: (index: number) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    model.nodes.forEach((node, index) => {
      dummy.position.set(...node.position);
      dummy.scale.setScalar(
        node.radius * (index === hoverIndex && activeNodes ? 1.22 : 1),
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [activeNodes, hoverIndex, model]);
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const color = new THREE.Color();
    const highlight = new THREE.Color(highlightColor);
    const muted = new THREE.Color(mutedColor);
    model.nodes.forEach((node, index) => {
      const base = colors[index];
      if (!base) return;
      color.copy(base);
      if (activeNodes) {
        if (index === hoverIndex) color.lerp(highlight, 0.3);
        else if (activeNodes.has(index)) color.lerp(highlight, 0.14);
        else color.lerp(muted, 0.84);
      }
      mesh.setColorAt(index, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [activeNodes, colors, highlightColor, hoverIndex, model, mutedColor]);
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, model.nodes.length]}
      frustumCulled={false}
      onPointerOver={(event) => {
        event.stopPropagation();
        const index = event.instanceId ?? -1;
        if (index >= 0) onHover(index);
      }}
      onPointerOut={onOut}
      onClick={(event) => {
        event.stopPropagation();
        const index = event.instanceId ?? -1;
        if (index >= 0) onClick(index);
      }}
    >
      <sphereGeometry args={[1, 20, 14]} />
      <meshStandardMaterial roughness={0.38} metalness={0.06} />
    </instancedMesh>
  );
}
function NetworkLinks({
  model,
  color,
  opacity,
  hoverIndex,
  highlightColor,
  mutedColor,
}: {
  model: Network3DModel;
  color: string;
  opacity: number;
  hoverIndex: number;
  highlightColor: string;
  mutedColor: string;
}) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(model.links.length * 6);
    model.links.forEach((link, index) => {
      const source = model.nodes[link.sourceIndex].position;
      const target = model.nodes[link.targetIndex].position;
      positions.set(source, index * 6);
      positions.set(target, index * 6 + 3);
    });
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    result.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(model.links.length * 6), 3),
    );
    result.computeBoundingSphere();
    return result;
  }, [model]);
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  useLayoutEffect(() => {
    const attribute = geometry.getAttribute('color');
    if (!(attribute instanceof THREE.BufferAttribute)) return;
    const scratch = new THREE.Color();
    const highlight = new THREE.Color(highlightColor);
    const muted = new THREE.Color(mutedColor);
    model.links.forEach((link, index) => {
      const related =
        hoverIndex >= 0 &&
        (link.sourceIndex === hoverIndex || link.targetIndex === hoverIndex);
      scratch.copy(baseColor);
      if (hoverIndex >= 0) {
        scratch.lerp(related ? highlight : muted, related ? 0.58 : 0.9);
      }
      attribute.setXYZ(index * 2, scratch.r, scratch.g, scratch.b);
      attribute.setXYZ(index * 2 + 1, scratch.r, scratch.g, scratch.b);
    });
    attribute.needsUpdate = true;
  }, [baseColor, geometry, highlightColor, hoverIndex, model, mutedColor]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  if (model.links.length === 0) return null;
  const activeOpacity =
    hoverIndex >= 0 && opacity > 0 ? Math.max(0.85, opacity) : opacity;
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={activeOpacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}
/** Network3D：确定性三维网络图。 */
export function Network3D({
  nodes = [],
  links = [],
  nodeSize = 5,
  linkOpacity = 0.35,
  linkColor,
  layout = 'force',
  layoutRadius = 140,
  iterations = 120,
  seed = 7,
  palette: paletteProp,
  legend = true,
  tooltip = true,
  showLabels = false,
  onNodeClick,
}: Network3DProps) {
  const scene = useScene();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const model = useMemo(
    () =>
      buildNetworkModel(nodes, links, {
        nodeSize,
        layout,
        layoutRadius,
        iterations,
        seed,
      }),
    [nodes, links, nodeSize, layout, layoutRadius, iterations, seed],
  );
  const hoverIndex =
    hoverId === null
      ? -1
      : model.nodes.findIndex((node) => node.id === hoverId);
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
  const nodeColors = useMemo(
    () =>
      model.nodes.map(
        (node) => new THREE.Color(palette[node.categoryIndex % palette.length]),
      ),
    [model, palette],
  );
  const neighbors = useMemo(() => {
    const result: number[][] = model.nodes.map(() => []);
    model.links.forEach((link) => {
      result[link.sourceIndex].push(link.targetIndex);
      result[link.targetIndex].push(link.sourceIndex);
    });
    return result;
  }, [model]);
  const activeNodes = useMemo(() => {
    if (hoverIndex < 0 || hoverIndex >= model.nodes.length) return null;
    const result = new Set<number>([hoverIndex]);
    neighbors[hoverIndex].forEach((index) => result.add(index));
    return result;
  }, [hoverIndex, model.nodes.length, neighbors]);
  const tokens = useMemo(
    () => ({
      edgeColor:
        linkColor?.trim() ||
        scene?.readToken('--aura-text-secondary', '#6b7280') ||
        '#6b7280',
      highlightColor:
        scene?.readToken('--aura-primary-700', '#7c3aed') ?? '#7c3aed',
      mutedColor: scene?.readToken('--aura-bg', '#ffffff') ?? '#ffffff',
      labelColor:
        scene?.readToken('--aura-text-secondary', '#6b7280') ?? '#6b7280',
    }),
    [linkColor, scene],
  );
  const edgeOpacity = Number.isFinite(linkOpacity)
    ? Math.max(0, Math.min(1, linkOpacity))
    : 0.35;
  useEffect(() => {
    if (!scene || !legend || model.categories.length === 0) return undefined;
    scene.setOverlay(
      <CategoryLegend
        items={model.categories.map((category, index) => ({
          label: category,
          color: palette[index % palette.length],
        }))}
      />,
    );
    return () => scene.setOverlay(null);
  }, [legend, model.categories, palette, scene]);
  useEffect(() => {
    setHoverId(null);
    if (!tooltip) scene?.showTooltip(null, new THREE.Vector3());
    return () => scene?.showTooltip(null, new THREE.Vector3());
  }, [model, scene, tooltip]);
  const handleHover = useCallback(
    (index: number) => {
      const node = model.nodes[index];
      if (!node) return;
      setHoverId(node.id);
      if (!tooltip || !scene) return;
      scene.showTooltip(
        {
          label: node.label,
          row: null,
          series: [
            {
              key: 'category',
              name: '分类',
              color: nodeColors[index].getStyle(),
              value: null,
              formatted: node.category,
            },
            {
              key: 'value',
              name: '数值',
              color: nodeColors[index].getStyle(),
              value: node.value ?? null,
              formatted:
                node.value === undefined ? '—' : formatNumber(node.value),
            },
            {
              key: 'degree',
              name: '连接数',
              color: nodeColors[index].getStyle(),
              value: node.degree,
              formatted: String(node.degree),
            },
          ],
        },
        new THREE.Vector3(...node.position).add(
          new THREE.Vector3(0, node.radius + 8, 0),
        ),
      );
    },
    [model, nodeColors, scene, tooltip],
  );
  const handleOut = useCallback(() => {
    setHoverId(null);
    scene?.showTooltip(null, new THREE.Vector3());
  }, [scene]);
  const handleClick = useCallback(
    (index: number) => {
      const node = model.nodes[index];
      if (node) onNodeClick?.(node.node);
    },
    [model, onNodeClick],
  );
  return (
    <group>
      <NetworkLinks
        model={model}
        color={tokens.edgeColor}
        opacity={edgeOpacity}
        hoverIndex={hoverIndex}
        highlightColor={tokens.highlightColor}
        mutedColor={tokens.mutedColor}
      />
      {model.nodes.length > 0 ? (
        <InstancedNetworkNodes
          model={model}
          colors={nodeColors}
          hoverIndex={hoverIndex}
          activeNodes={activeNodes}
          highlightColor={tokens.highlightColor}
          mutedColor={tokens.mutedColor}
          onHover={handleHover}
          onOut={handleOut}
          onClick={handleClick}
        />
      ) : null}
      {showLabels && model.nodes.length <= 50
        ? model.nodes.map((node) => (
            <TextSprite
              key={node.id}
              text={node.label}
              color={tokens.labelColor}
              position={[
                node.position[0],
                node.position[1] + node.radius + 10,
                node.position[2],
              ]}
              scale={0.18}
            />
          ))
        : null}
    </group>
  );
}
