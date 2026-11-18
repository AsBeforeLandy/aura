export { Scene3D, useScene, getScenePresetConfig } from './core/Scene3D';
export type { Scene3DProps, ScenePreset } from './core/Scene3D';
export { ColorBandLegend, CategoryLegend } from './core/SceneLegend';
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
export { ParticleField } from './charts/ParticleField';
export type { ParticleFieldProps } from './charts/ParticleField';
export { Voxel3D } from './charts/Voxel3D';
export type { Voxel3DProps } from './charts/Voxel3D';
export { HoloRing } from './charts/HoloRing';
export type { HoloRingProps } from './charts/HoloRing';
export {
  buildVoxelModel,
  buildVoxelTransforms,
  type VoxelDatum,
  type VoxelModel,
  type VoxelInstance,
} from './core/voxel';
export {
  MULTIHUE_HUES,
  SERIES_ORDER,
  CONTINUOUS_ORDER,
  seriesColor,
  continuousColor,
} from './theme/multihue';
export type { MultihueHue, MultihueLevel } from './theme/multihue';
export {
  initParticles,
  advanceParticles,
  collectLinks,
  type ParticleBounds,
} from './core/particles';
export {
  projectToScreen,
  scaleBarHeights,
  normalizeRatio,
} from './core/projection';
export type { ScreenPoint } from './core/projection';
