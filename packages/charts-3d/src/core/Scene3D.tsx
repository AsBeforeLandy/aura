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

export type ScenePreset = 'default' | 'inspection' | 'top' | 'front';

interface ScenePresetConfig {
  camera: [number, number, number];
  autoRotate: boolean;
  autoRotateSpeed: number;
  maxPolarAngle: number;
}

/**
 * 视角预设（场景模板）。
 *
 * · default    斜视角，静态，适合交互分析
 * · inspection 巡检：低角度自动环绕，转速 2.2°/帧级，适合大屏展示态
 * · top        正俯视：看平面分布，避免透视遮挡
 * · front      正视图：当「图表」用，接近 2D 阅读习惯
 *
 * maxPolarAngle 统一限制在 π/2.05 —— 不允许钻到地面以下，
 * 那会让柱体的底面朝上、文字镜像，用户不知道自己看到了什么。
 */
const SCENE_PRESETS: Record<ScenePreset, ScenePresetConfig> = {
  default: {
    camera: [320, 260, 380],
    autoRotate: false,
    autoRotateSpeed: 1.2,
    maxPolarAngle: Math.PI / 2.05,
  },
  inspection: {
    camera: [300, 170, 320],
    autoRotate: true,
    autoRotateSpeed: 2.2,
    maxPolarAngle: Math.PI / 2.05,
  },
  top: {
    camera: [0.1, 540, 0.1],
    autoRotate: false,
    autoRotateSpeed: 1.2,
    maxPolarAngle: Math.PI / 2.05,
  },
  front: {
    camera: [0, 150, 520],
    autoRotate: false,
    autoRotateSpeed: 1.2,
    maxPolarAngle: Math.PI / 2.05,
  },
};

/** 读取视角预设配置（未知值回退 default） */
export function getScenePresetConfig(preset: ScenePreset): ScenePresetConfig {
  return SCENE_PRESETS[preset] ?? SCENE_PRESETS.default;
}

export interface Scene3DProps {
  height?: number;
  /** 视角预设（场景模板）；显式 cameraPosition / autoRotate 会覆盖预设 */
  preset?: ScenePreset;
  /** 相机位置，默认取视角预设的相机位 */
  cameraPosition?: [number, number, number];
  /** 是否允许拖转 / 缩放视角 */
  enableRotate?: boolean;
  /** 自动旋转（展示模式）；默认取视角预设的配置 */
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

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 场景错误边界。
 *
 * WebGL 上下文创建失败是运行时常态而非异常态：浏览器对同时存在的
 * WebGL 上下文有数量上限（超出后新的 create 会直接抛错）、驱动禁用、
 * headless 环境无软渲染兜底等都会命中。图表库在这样的页面里
 * 绝不能把整个大屏拖垮 —— 降级展示一块占位说明。
 */
class SceneErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { failed: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    // 上下文创建失败是预期分支，只在 console 留痕便于排查
    console.warn('[charts-3d] WebGL 场景创建失败，已降级：', error.message);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/** 默认的降级占位 */
function SceneFallback({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        display: 'grid',
        placeItems: 'center',
        border: '1px dashed rgba(148, 163, 184, 0.4)',
        borderRadius: 10,
        color: 'rgba(148, 163, 184, 0.9)',
        fontSize: 12,
      }}
    >
      当前环境不支持 WebGL，3D 场景已降级
    </div>
  );
}

export function useScene(): SceneContextValue | null {
  return useContext(SceneContext);
}

/** OrbitControls：不引 drei，直接封装 three-stdlib 的同名控制器 */
function SceneControls({
  enableRotate,
  autoRotate,
  maxPolarAngle,
  autoRotateSpeed,
}: {
  enableRotate: boolean;
  autoRotate: boolean;
  maxPolarAngle: number;
  autoRotateSpeed: number;
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  React.useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    // 不允许钻到地面以下，保持图表的可读朝向
    controls.maxPolarAngle = maxPolarAngle;
    controls.enabled = enableRotate;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = autoRotateSpeed;
    controlsRef.current = controls;
    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, enableRotate, autoRotate, maxPolarAngle, autoRotateSpeed]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

export function Scene3D({
  height = 360,
  cameraPosition: cameraPositionProp,
  autoRotate: autoRotateProp,
  preset = 'default',
  enableRotate = true,
  children,
}: Scene3DProps) {
  // preset 提供视角基线，显式 props 覆盖（调用方只想微调一项时不用抄整套）
  const presetConfig = useMemo(() => getScenePresetConfig(preset), [preset]);
  const cameraPosition = cameraPositionProp ?? presetConfig.camera;
  const autoRotate = autoRotateProp ?? presetConfig.autoRotate;
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
        <SceneErrorBoundary fallback={<SceneFallback height={height} />}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: cameraPosition, fov: 40, near: 1, far: 3000 }}
            onCreated={({ camera: created }) => setCamera(created)}
            fallback={<SceneFallback height={height} />}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[320, 420, 240]} intensity={0.9} />
            <directionalLight position={[-240, 160, -180]} intensity={0.35} />
            <SceneControls
              enableRotate={enableRotate}
              autoRotate={autoRotate}
              maxPolarAngle={presetConfig.maxPolarAngle}
              autoRotateSpeed={presetConfig.autoRotateSpeed}
            />
            <SceneContext.Provider value={context}>
              {children}
            </SceneContext.Provider>
          </Canvas>
        </SceneErrorBoundary>
      ) : null}

      {tooltip ? (
        // overlay 只做定位容器，边界收敛（clamp / 到顶翻转）全部交给
        // Tooltip 自身 —— 与 2D 图表的提示框行为保持一致
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Tooltip
            payload={tooltip.payload}
            x={tooltip.screen.x}
            y={tooltip.screen.y}
            containerWidth={size.width}
            containerHeight={size.height}
            theme={tooltipTheme}
          />
        </div>
      ) : null}
    </div>
  );
}
