import React from 'react';
import { Card, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="md">
    <Card variant="default" style={{ width: 200 }}>
      <Card.Body>Default 卡片</Card.Body>
    </Card>
    <Card variant="elevated" style={{ width: 200 }}>
      <Card.Body>Elevated 卡片</Card.Body>
    </Card>
    <Card variant="outlined" style={{ width: 200 }}>
      <Card.Body>Outlined 卡片</Card.Body>
    </Card>
    <Card variant="glass" style={{ width: 200 }}>
      <Card.Body>Glass 卡片</Card.Body>
    </Card>
  </Space>
);

export default Demo;
