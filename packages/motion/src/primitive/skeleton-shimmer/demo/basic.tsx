import React from 'react';
import { Space } from 'antd';
import { SkeletonShimmer } from '@aura-react-comp/motion';

/** 典型的卡片加载骨架：头像 + 标题 + 两行文本 */
export default () => (
  <Space direction="vertical" size={16} style={{ width: '100%' }}>
    <div style={{ display: 'flex', gap: 12 }}>
      <SkeletonShimmer width={48} height={48} radius={24} />
      <div style={{ flex: 1, display: 'grid', gap: 8, alignContent: 'start' }}>
        <SkeletonShimmer width="40%" height={16} />
        <SkeletonShimmer width="70%" height={12} />
      </div>
    </div>
    <div style={{ display: 'grid', gap: 8 }}>
      <SkeletonShimmer width="100%" height={96} radius={12} />
      <SkeletonShimmer width="100%" height={12} />
      <SkeletonShimmer width="85%" height={12} />
    </div>
  </Space>
);
