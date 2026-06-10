import React from 'react';
import { Spin, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="lg">
    <Space align="center" size="md">
      <Spin size="sm" />
      <Spin size="md" />
      <Spin size="lg" />
    </Space>
    <Spin tip="加载中..." />
    <Space align="center" size="md">
      <Spin variant="dot" />
      <Spin variant="dot" tip="正在载入..." />
    </Space>
  </Space>
);

export default Demo;
