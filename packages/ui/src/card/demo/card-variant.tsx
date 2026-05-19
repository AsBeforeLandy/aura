import React from 'react';
import { Card, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Card variant="default">
      <Card.Body>Default — 白色背景 + 浅边框</Card.Body>
    </Card>
    <Card variant="elevated">
      <Card.Body>Elevated — 白色背景 + 中等阴影</Card.Body>
    </Card>
    <Card variant="outlined">
      <Card.Body>Outlined — 加粗边框</Card.Body>
    </Card>
    <Card variant="glass">
      <Card.Body>Glass — 半透明 + 毛玻璃效果</Card.Body>
    </Card>
  </Space>
);

export default Demo;
