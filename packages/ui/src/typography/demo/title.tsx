import React from 'react';
import { Typography, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm">
    <Typography.Title level={1}>H1 标题</Typography.Title>
    <Typography.Title level={2}>H2 标题</Typography.Title>
    <Typography.Title level={3}>H3 标题</Typography.Title>
    <Typography.Title level={4}>H4 标题</Typography.Title>
    <Typography.Title level={5}>H5 标题</Typography.Title>
  </Space>
);

export default Demo;
