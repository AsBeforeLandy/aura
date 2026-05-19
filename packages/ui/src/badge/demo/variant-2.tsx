import React from 'react';
import { Badge, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="md">
    <Badge count={5} variant="default" />
    <Badge count={5} variant="success" />
    <Badge count={5} variant="warning" />
    <Badge count={5} variant="error" />
    <Badge count={5} variant="info" />
  </Space>

);

export default Demo;
