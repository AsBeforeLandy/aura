import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Camera, Vector3 } from 'three';
import { darkTheme, useElementSize } from '@aura-react-comp/charts';
import { Tooltip } from '@aura-react-comp/charts';
import type { TooltipPayload } from '@aura-react-comp/charts';
import { projectToScreen, type ScreenPoint } from './projection';

/** 提示框主题：暗色底，覆盖 darkTheme 的 tooltip 分支 */
const tooltipTheme = {
  ...darkTheme,
  tooltip: {
    ...darkTheme.tooltip,
    background: 'rgba(15, 23, 42, 0.92)',
    border: 'rgba(148, 163, 184, 0.4)',
  },
};

/**
 * Scene3D：3D 图表的画布容器。
 *
 * 职责（全部收敛在这一层，图表组件只关心几何与颜色）：
 *   · 容器自适应 + SSR 安全（未测量到尺寸前不创建 WebGL 上下文）
 *   · 相机 / 光照预设
 *   · OrbitControls 视角拖转
 *   · tooltip 通道：3D 子组件通过 SceneContext 上报命中与世界坐标，
 *     这里投影成屏幕坐标并渲染与 2D 图表同款的 DOM 提示框
 */

export interface Scene3DProps {
  height?: number;
  /** 相机位置，默认右前上方的斜视角 */
  cameraPosition?: [number, number, number];
  /** 是否允许拖转 / 缩放视角 */
  enableRotate?: boolean;
  /** 自动旋转（展示模式） */
  autoRotate?: boolean;
  /** 命中提示框内容；null 关闭 */
  children: React.ReactNode;
}

interface TooltipState {
  payload: TooltipPayload;
  screen: ScreenPoint;
}

interface SceneContextValue {
  /** 子组件命中图元时调用；payload 传 null 关闭提示框 */
  showTooltip: (payload: TooltipPayload | null, worldPosition: Vector3) => void;
  /** 让子组件把世界坐标投影到屏幕（含相机与容器尺寸） */
  project: (worldPosition: Vector3) => ScreenPoint;
  /** 读取 --aura-* 设计令牌色值（:root 级），缺失时回退 */
  readToken: (token: string, fallback: string) => string;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function useScene(): SceneContextValue | null {
  return useContext(SceneContext);
}

/** OrbitControls：不引 drei，直接封装 three-stdlib 的同名控制器 */
function SceneControls({
  enableRotate,
  autoRotate,
}: {
  enableRotate: boolean;
  autoRotate: boolean;
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  React.useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    // 不允许钻到地面以下，保持图表的可读朝向
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.enabled = enableRotate;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;
    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, enableRotate, autoRotate]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

export function Scene3D({
  height = 360,
  cameraPosition = [320, 260, 380],
  enableRotate = true,
  autoRotate = false,
  children,
}: Scene3DProps) {
  const { ref: containerRef, size } = useElementSize<HTMLDivElement>();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const project = useCallback(
    (worldPosition: Vector3): ScreenPoint => {
      if (!camera || size.width <= 0) return { x: 0, y: 0 };
      return projectToScreen(worldPosition, camera, size.width, size.height);
    },
    [camera, size.width, size.height],
  );

  const showTooltip = useCallback(
    (payload: TooltipPayload | null, worldPosition: Vector3) => {
      if (!payload) {
        setTooltip(null);
        return;
      }
      setTooltip({ payload, screen: project(worldPosition) });
    },
    [project],
  );

  const readToken = useCallback((token: string, fallback: string): string => {
    if (typeof getComputedStyle !== 'function') return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
    return value || fallback;
  }, []);

  const context = useMemo<SceneContextValue>(
    () => ({ showTooltip, project, readToken }),
    [showTooltip, project, readToken],
  );

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, position: 'relative' }}
      onPointerLeave={() => setTooltip(null)}
    >
      {size.width > 0 && size.height > 0 ? (
        <Canvas
          dpr={[1, 2]}
          camera={{ position: cameraPosition, fov: 40, near: 1, far: 3000 }}
          onCreated={({ camera: created }) => setCamera(created)}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[320, 420, 240]} intensity={0.9} />
          <directionalLight position={[-240, 160, -180]} intensity={0.35} />
          <SceneControls enableRotate={enableRotate} autoRotate={autoRotate} />
          <SceneContext.Provider value={context}>
            {children}
          </SceneContext.Provider>
        </Canvas>
      ) : null}

      {tooltip ? (
        <div
          style={{
            position: 'absolute',
            left: Math.min(
              Math.max(tooltip.screen.x, 60),
              Math.max(size.width - 60, 60),
            ),
            top: Math.max(tooltip.screen.y - 14, 8),
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
          <Tooltip
            payload={tooltip.payload}
            x={0}
            y={0}
            containerWidth={size.width}
            theme={tooltipTheme}
          />
        </div>
      ) : null}
    </div>
  );
}
