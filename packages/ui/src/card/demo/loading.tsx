import React from 'react';
import { Card, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space size="md">
    <Card loading style={{ width: 300 }}>
      <Card.Body>加载中...</Card.Body>
    </Card>
  </Space>
);

export default Demo;
