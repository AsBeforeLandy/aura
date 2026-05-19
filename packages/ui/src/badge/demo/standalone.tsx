import React from 'react';
import { Badge, Text, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size={32}>
    <Space direction="vertical" align="center" size={4}>
      <Badge count={5} />
      <Text style={{ fontSize: 12, color: '#6b7280' }}>独立数字</Text>
    </Space>
    <Space direction="vertical" align="center" size={4}>
      <Badge dot />
      <Text style={{ fontSize: 12, color: '#6b7280' }}>小圆点</Text>
    </Space>
    <Space direction="vertical" align="center" size={4}>
      <Badge count={99} />
      <Text style={{ fontSize: 12, color: '#6b7280' }}>overflowCount</Text>
    </Space>
    <Space direction="vertical" align="center" size={4}>
      <Badge count={200} overflowCount={99} />
      <Text style={{ fontSize: 12, color: '#6b7280' }}>200 → 99+</Text>
    </Space>
    <Space direction="vertical" align="center" size={4}>
      <Badge count={0} showZero />
      <Text style={{ fontSize: 12, color: '#6b7280' }}>showZero</Text>
    </Space>
  </Space>
);

export default Demo;
