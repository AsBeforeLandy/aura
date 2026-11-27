import React, { useState } from 'react';
import {
  Network3D,
  Scene3D,
  type Network3DProps,
} from '@aura-react-comp/charts-3d';

const nodes = [
  { id: 'product', label: '产品', category: '规划', value: 90 },
  { id: 'design', label: '设计', category: '规划', value: 80 },
  { id: 'web', label: 'Web 前端', category: '研发', value: 95 },
  { id: 'mobile', label: '移动端', category: '研发', value: 75 },
  { id: 'api', label: 'API', category: '研发', value: 90 },
  { id: 'database', label: '数据库', category: '研发', value: 70 },
  { id: 'qa', label: '测试', category: '交付', value: 65 },
  { id: 'release', label: '发布', category: '交付', value: 60 },
];

const links = [
  { source: 'product', target: 'design' },
  { source: 'product', target: 'web' },
  { source: 'product', target: 'mobile' },
  { source: 'design', target: 'web' },
  { source: 'design', target: 'mobile' },
  { source: 'web', target: 'api' },
  { source: 'mobile', target: 'api' },
  { source: 'api', target: 'database' },
  { source: 'web', target: 'qa' },
  { source: 'mobile', target: 'qa' },
  { source: 'api', target: 'qa' },
  { source: 'qa', target: 'release' },
];

const layouts: {
  label: string;
  value: NonNullable<Network3DProps['layout']>;
}[] = [
  { label: '力导布局', value: 'force' },
  { label: '球面布局', value: 'sphere' },
  { label: '网格布局', value: 'grid' },
];

/** 切换布局，比较力导、球面和网格三种组织方式。 */
export default () => {
  const [layout, setLayout] =
    useState<NonNullable<Network3DProps['layout']>>('force');

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
        {layouts.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setLayout(item.value)}
            aria-pressed={layout === item.value}
            style={{
              padding: 'var(--aura-spacing-1) var(--aura-spacing-3)',
              borderRadius: 'var(--aura-radius-sm)',
              border: '1px solid var(--aura-border)',
              background:
                layout === item.value
                  ? 'var(--aura-primary-600)'
                  : 'var(--aura-bg-secondary)',
              color:
                layout === item.value
                  ? 'var(--aura-text-inverse)'
                  : 'var(--aura-text)',
              cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <Scene3D height={440} cameraPosition={[290, 220, 330]}>
        <Network3D nodes={nodes} links={links} layout={layout} showLabels />
      </Scene3D>
    </div>
  );
};
