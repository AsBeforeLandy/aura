import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useElementSize } from '@aura-react-comp/charts';
import {
  advanceParticles,
  collectLinks,
  initParticles,
} from '../core/particles';

/**
 * ParticleField：粒子背景装饰层。
 *
 * 大屏 / 登录页的「氛围层」—— 星野漂移 + 可选的近距离连线网络。
 * 纯装饰，不承载数据：默认 aria-hidden，pointer-events 关闭，
 * WebGL 不可用时静默降级为纯色（错误边界兜底，绝不影响页面主体）。
 *
 * 性能约定：粒子数默认 120（连线 O(n²) 在 120 时约 7000 次配对，
 * 单帧成本可控）；DPR 上限 1.5 —— 背景装饰不需要高分屏精度。
 */

export interface ParticleFieldProps {
  /** 粒子数量 */
  count?: number;
  /** 粒子颜色 */
  color?: string;
  /** 粒子尺寸（世界单位） */
  particleSize?: number;
  /** 粒子透明度 */
  opacity?: number;
  /** 是否绘制近距离连线网络 */
  showLinks?: boolean;
  /** 连线的距离阈值（世界单位） */
  linkDistance?: number;
  /** 连线颜色（深底上亮度低 = 视觉上淡，距离衰减用亮度模拟） */
  linkColor?: string;
  /** 漂移速度系数，0 = 静止 */
  speed?: number;
  /** 鼠标视差：相机随光标轻微偏移 */
  interactive?: boolean;
  /** 尊重 prefers-reduced-motion：命中时完全静止 */
  className?: string;
  style?: React.CSSProperties;
}

/** 世界坐标范围：铺满正视相机的视锥并留出环绕余量 */
const BOUNDS = { width: 560, height: 340, depth: 220 };

/** 降级占位：极简的静态星点（纯 CSS，WebGL 不可用时也有氛围） */
function StaticFallback({ color }: { color: string }) {
  const stars = React.useMemo(
    () =>
      Array.from({ length: 40 }, (_, index) => ({
        left: `${Math.abs(Math.sin(index * 12.9898) * 100)}%`,
        top: `${Math.abs(Math.sin(index * 78.233) * 100)}%`,
        size: index % 5 === 0 ? 2 : 1,
        opacity: 0.2 + (index % 4) * 0.15,
      })),
    [],
  );
  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      aria-hidden
    >
      {stars.map((star, index) => (
        <span
          key={index}
          style={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: color,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}

/** 粒子层：每帧推进位置并按需重建连线 */
function ParticlePoints({
  count,
  color,
  particleSize,
  opacity,
  showLinks,
  linkDistance,
  linkColor,
  speed,
  interactive,
}: {
  count: number;
  color: string;
  particleSize: number;
  opacity: number;
  showLinks: boolean;
  linkDistance: number;
  linkColor: string;
  speed: number;
  interactive: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const linksRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const particles = useMemo(() => initParticles(count, BOUNDS, 1), [count]);

  // 连线的几何槽位：预分配上限，每帧只改 drawRange 与坐标
  const linkGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(count * 6), 3),
    );
    return geometry;
  }, [count]);

  React.useEffect(() => {
    if (!interactive) return undefined;
    const handler = (event: PointerEvent) => {
      mouse.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, [interactive]);

  useFrame((_, delta) => {
    if (!reduced && speed > 0) {
      advanceParticles(
        particles.positions,
        particles.velocities,
        delta,
        speed,
        BOUNDS,
      );
    }

    const geometry = pointsRef.current?.geometry as
      THREE.BufferGeometry | undefined;
    if (geometry) {
      const attribute = geometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      attribute.array.set(particles.positions);
      attribute.needsUpdate = true;
    }

    if (showLinks && linksRef.current) {
      const segments = collectLinks(particles.positions, linkDistance, 400);
      const linkAttribute = linksRef.current.geometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      (linkAttribute.array as Float32Array).set(segments);
      linkAttribute.needsUpdate = true;
      linksRef.current.geometry.setDrawRange(0, segments.length / 3);
    }

    // 鼠标视差：相机轻微偏移 + 回望原点，用插值平滑
    if (interactive && !reduced) {
      const targetX = mouse.current.x * 26;
      const targetY = -mouse.current.y * 18;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions.slice(), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={particleSize}
          sizeAttenuation
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </points>

      {showLinks ? (
        <lineSegments ref={linksRef}>
          <primitive object={linkGeometry} attach="geometry" />
          <lineBasicMaterial
            color={linkColor}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </lineSegments>
      ) : null}
    </group>
  );
}

export function ParticleField({
  count = 120,
  color = '#38bdf8',
  particleSize = 2.2,
  opacity = 0.85,
  showLinks = true,
  linkDistance = 26,
  linkColor = '#0ea5e9',
  speed = 1,
  interactive = true,
  className,
  style,
}: ParticleFieldProps) {
  const { ref: containerRef, size } = useElementSize<HTMLDivElement>();

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative', ...style }}
      aria-hidden
    >
      {size.width > 0 && size.height > 0 ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 420], fov: 50 }}
          gl={{ alpha: true, antialias: false }}
        >
          <ParticlePoints
            count={count}
            color={color}
            particleSize={particleSize}
            opacity={opacity}
            showLinks={showLinks}
            linkDistance={linkDistance}
            linkColor={linkColor}
            speed={speed}
            interactive={interactive}
          />
        </Canvas>
      ) : (
        <StaticFallback color={color} />
      )}
    </div>
  );
}
