import React, { useState } from 'react';
import {
  Globe3D,
  Scene3D,
  type Globe3DPoint,
} from '@aura-react-comp/charts-3d';

const EARTH_TEXTURES = {
  textureUrl: '/aura/textures/earth/earth_atmos_2048.jpg',
  normalMapUrl: '/aura/textures/earth/earth_normal_2048.jpg',
  specularMapUrl: '/aura/textures/earth/earth_specular_2048.jpg',
  cloudsUrl: '/aura/textures/earth/earth_clouds_1024.png',
};

const points: Globe3DPoint[] = [
  { id: 'beijing', name: '北京', latitude: 39.9, longitude: 116.4, value: 94 },
  {
    id: 'shanghai',
    name: '上海',
    latitude: 31.23,
    longitude: 121.47,
    value: 98,
  },
  {
    id: 'singapore',
    name: '新加坡',
    latitude: 1.35,
    longitude: 103.82,
    value: 92,
  },
  { id: 'tokyo', name: '东京', latitude: 35.68, longitude: 139.69, value: 86 },
  {
    id: 'sydney',
    name: '悉尼',
    latitude: -33.87,
    longitude: 151.21,
    value: 62,
  },
  { id: 'dubai', name: '迪拜', latitude: 25.2, longitude: 55.27, value: 79 },
  {
    id: 'frankfurt',
    name: '法兰克福',
    latitude: 50.11,
    longitude: 8.68,
    value: 74,
  },
  { id: 'london', name: '伦敦', latitude: 51.51, longitude: -0.13, value: 84 },
  { id: 'ny', name: '纽约', latitude: 40.71, longitude: -74.01, value: 95 },
  { id: 'sf', name: '旧金山', latitude: 37.77, longitude: -122.42, value: 89 },
  {
    id: 'saopaulo',
    name: '圣保罗',
    latitude: -23.55,
    longitude: -46.63,
    value: 52,
  },
];

const arcs = [
  { from: 'shanghai', to: 'tokyo', value: 96 },
  { from: 'shanghai', to: 'singapore', value: 94 },
  { from: 'beijing', to: 'frankfurt', value: 84 },
  { from: 'singapore', to: 'dubai', value: 82 },
  { from: 'dubai', to: 'london', value: 79 },
  { from: 'london', to: 'ny', value: 92 },
  { from: 'ny', to: 'sf', value: 88 },
  { from: 'sf', to: 'tokyo', value: 86 },
  { from: 'singapore', to: 'sydney', value: 62 },
  { from: 'ny', to: 'saopaulo', value: 52 },
];

/** 全球业务节点与线路：真实卫星地球模型、云层漂移、立体飞线与城市标签。 */
export default () => {
  const [selected, setSelected] = useState<Globe3DPoint | null>(null);
  const [showClouds, setShowClouds] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    padding: 'var(--aura-spacing-1) var(--aura-spacing-3)',
    borderRadius: 'var(--aura-radius-sm)',
    border: '1px solid var(--aura-border)',
    background: active ? 'var(--aura-primary-600)' : 'var(--aura-bg-secondary)',
    color: active ? 'var(--aura-text-inverse)' : 'var(--aura-text)',
    fontSize: 'var(--aura-font-size-xs)',
    cursor: 'pointer',
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--aura-spacing-2)',
          marginBottom: 'var(--aura-spacing-3)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          aria-pressed={showClouds}
          style={toggleStyle(showClouds)}
          onClick={() => setShowClouds((prev) => !prev)}
        >
          大气云层
        </button>
        <button
          type="button"
          aria-pressed={showLabels}
          style={toggleStyle(showLabels)}
          onClick={() => setShowLabels((prev) => !prev)}
        >
          城市标签
        </button>
        <button
          type="button"
          aria-pressed={showGrid}
          style={toggleStyle(showGrid)}
          onClick={() => setShowGrid((prev) => !prev)}
        >
          辅助经纬网
        </button>
      </div>
      <div
        style={{
          borderRadius: 'var(--aura-radius-lg)',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse at 50% 45%, #0f1f3d 0%, #060b18 75%)',
        }}
      >
        <Scene3D
          height={500}
          cameraPosition={[-145, 118, -255]}
          autoRotate
          autoRotateSpeed={0.35}
        >
          <Globe3D
            {...EARTH_TEXTURES}
            points={points}
            arcs={arcs}
            showClouds={showClouds}
            showLabels={showLabels}
            showGrid={showGrid}
            onPointClick={setSelected}
          />
        </Scene3D>
      </div>
      <p
        role="status"
        style={{ marginTop: 'var(--aura-spacing-3)', marginBottom: 0 }}
      >
        {selected
          ? `已选择：${selected.name}（${selected.latitude.toFixed(1)}°, ${selected.longitude.toFixed(1)}°），业务值 ${selected.value ?? 0}`
          : '拖动旋转视角、滚轮缩放，悬停查看节点指标，点击选择业务枢纽'}
      </p>
    </div>
  );
};
