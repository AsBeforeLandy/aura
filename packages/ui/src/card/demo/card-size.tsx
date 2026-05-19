import React from 'react';
import { Card, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Card size="sm">
      <Card.Body>Small 卡片</Card.Body>
    </Card>
    <Card size="md">
      <Card.Body>Medium 卡片</Card.Body>
    </Card>
    <Card size="lg">
      <Card.Body>Large 卡片</Card.Body>
    </Card>
  </Space>
);

export default Demo;
