export { Scene3D } from './core/Scene3D';
export type { Scene3DProps } from './core/Scene3D';
export { Bar3D } from './charts/Bar3D';
export type { Bar3DProps, Bar3DDataItem } from './charts/Bar3D';
export { Scatter3D, buildScatterModel } from './charts/Scatter3D';
export type { Scatter3DProps, Scatter3DPoint } from './charts/Scatter3D';
export {
  Surface3D,
  buildSurfaceGeometryData,
  sampleGradient,
} from './charts/Surface3D';
export type { Surface3DProps, SurfaceGeometryData } from './charts/Surface3D';
export {
  projectToScreen,
  scaleBarHeights,
  normalizeRatio,
} from './core/projection';
export type { ScreenPoint } from './core/projection';
export { useScene } from './core/Scene3D';
