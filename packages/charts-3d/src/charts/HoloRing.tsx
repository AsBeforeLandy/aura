import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useElementSize } from '@aura-react-comp/charts';

/**
 * HoloRing：科技环装饰层。
 *
 * 大屏美术件——多层全息环反向旋转，中央可选核心光点。
 * 与 ParticleField 同一定位：纯装饰、aria-hidden、pointer-events 关闭、
 * WebGL 不可用时降级为静态 CSS 圆环，绝不影响页面主体。
 */

export interface HoloRingProps {
  /** 环层数（1~3） */
  layers?: number;
  /** 环色数组（按层循环取用） */
  colors?: string[];
  /** 旋转速度倍率，0 = 静止 */
  speed?: number;
  /** 中央核心光点的透明度，0 = 不显示 */
  coreOpacity?: number;
  /** 环管粗细（世界单位） */
  tube?: number;
  /** 容器高度（px） */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_COLORS = ['#38bdf8', '#a78bfa', '#22d3ee'];

/** 每层的倾角与半径系数：多层环错开才有「全息装置」的层次感 */
const LAYER_TILTS = [0.42, -0.3, 0.62];
const LAYER_RADIUS = [1, 0.78, 0.88];

function Ring({
  index,
  color,
  speed,
  tube,
}: {
  index: number;
  color: string;
  speed: number;
  tube: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const radius = 100 * (LAYER_RADIUS[index % LAYER_RADIUS.length] ?? 1);
  const tilt = LAYER_TILTS[index % LAYER_TILTS.length] ?? 0;
  // 相邻层反转：反向旋转是「机械感」的关键
  const direction = index % 2 === 0 ? 1 : -1;

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh || speed === 0) return;
    mesh.rotation.z += direction * speed * delta * 0.5;
    mesh.rotation.x = tilt + Math.sin(index * 2 + mesh.rotation.z * 0.4) * 0.06;
  });

  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, tube, 24, 120]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
        transparent
        opacity={0.8}
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  );
}

export function HoloRing({
  layers = 2,
  colors = DEFAULT_COLORS,
  speed = 1,
  coreOpacity = 0.5,
  tube = 3.2,
  height = 340,
  className,
  style,
}: HoloRingProps) {
  const { ref: containerRef, size } = useElementSize<HTMLDivElement>();
  const layerCount = Math.min(Math.max(layers, 1), 3);

  // 静态降级：WebGL 不可用时用 CSS 圆环占位
  const fallback = useMemo(
    () => (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
        }}
        aria-hidden
      >
        {colors.slice(0, layerCount).map((color, index) => (
          <span
            key={index}
            style={{
              position: 'absolute',
              width: `${72 - index * 16}%`,
              aspectRatio: '1',
              borderRadius: '50%',
              border: `2px solid ${color}`,
              opacity: 0.35,
              transform: `rotate(${index * 24}deg) scaleY(0.62)`,
            }}
          />
        ))}
      </div>
    ),
    [colors, layerCount],
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height, position: 'relative', ...style }}
      aria-hidden
    >
      {size.width > 0 && size.height > 0 ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 30, 260], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.9} />
          <pointLight
            position={[120, 160, 180]}
            intensity={1.2}
            color="#e0f2fe"
          />
          <group rotation={[0.35, 0, 0]}>
            {Array.from({ length: layerCount }, (_, index) => (
              <Ring
                key={index}
                index={index}
                color={colors[index % colors.length]}
                speed={speed}
                tube={tube}
              />
            ))}
            {coreOpacity > 0 ? (
              <mesh>
                <sphereGeometry args={[14, 24, 24]} />
                <meshBasicMaterial
                  color={colors[0]}
                  transparent
                  opacity={coreOpacity}
                />
              </mesh>
            ) : null}
          </group>
        </Canvas>
      ) : (
        fallback
      )}
    </div>
  );
}
